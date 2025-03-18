import type { ArgumentsCamelCase, Argv } from "yargs";
import { logger } from "../logger";

import type { WebRTCMetrics } from "src/webrtcDumpParser";
import type WebSocket from "ws";
import { ClientCommander, type DelayMeasurements } from "../clientCommander";
import { DatabaseManager } from "../databaseManager";
import type { PerformanceMetrics } from "../gamePerformanceMonitor";
import { UnityCommander, type UnityMessage } from "../unityCommander";
import "dotenv/config";

interface StartArgv {
	clients?: number;
	duration?: number;
	width?: number;
	height?: number;
	frameRate?: number;
	audio?: boolean;
	hardware?: boolean;
}

export const command = "start";
export const describe = "start a new analysis run.";
export const aliases = ["s"];

export function builder(yargs: Argv): Argv<StartArgv> {
	return yargs
		.option("clients", {
			type: "number",
			alias: "c",
			default: 1,
		})
		.option("width", {
			type: "number",
			alias: "w",
			default: 1920,
		})
		.option("height", {
			type: "number",
			alias: "h",
			default: 1080,
		})
		.option("audio", {
			type: "boolean",
			alias: "a",
			default: true,
		})
		.option("frameRate", {
			type: "number",
			alias: "f",
			default: 30,
		})
		.option("duration", {
			type: "number",
			alias: "d",
			description: "Duration of the run in seconds",
			default: 60,
		})
		.option("hardware", {
			type: "boolean",
			alias: "hw",
			description: "Use hardware acceleration",
			default: true,
		});
}

let unityCommander: UnityCommander;
let clients: ClientCommander[] = [];
let clientsConnected = 0;
let connectionTimeoutId: NodeJS.Timeout | null = null;
const databaseManager = new DatabaseManager({
	host: process.env.DB_HOST || "localhost",
	port: Number.parseInt(process.env.DB_PORT || "5432"),
	database: process.env.DB_NAME || "gamebeam",
	user: process.env.DB_USER || "postgres",
	password: process.env.DB_PASSWORD || "postgres",
});

let clientCount = 0;
let runId = 0;
let duration = 0;
async function cleanup(deleteRunFromDb = false): Promise<void> {
	logger.info("Stopping analysis run...");

	// Clear any pending timeout
	if (connectionTimeoutId) {
		clearTimeout(connectionTimeoutId);
		connectionTimeoutId = null;
	}

	for (const client of clients) {
		await client.stop();
	}
	clients = [];
	if (unityCommander) {
		await unityCommander.stop();
	}

	await new Promise((resolve) => setTimeout(resolve, 1000));

	if (deleteRunFromDb) {
		try {
			// Delete the run from the database
			await databaseManager.deleteRun(runId);
			logger.info(
				`Run ${runId} deleted from database due to connection timeout.`,
			);
		} catch (error) {
			logger.error("Error deleting run from database:", error);
		}
	}

	databaseManager.close();
}

export async function handler(argv: ArgumentsCamelCase<StartArgv>) {
	clientCount = argv.clients!;
	duration = argv.duration!;
	const width = argv.width!;
	const height = argv.height!;
	const frameRate = argv.frameRate!;
	const audio = argv.audio!;
	const hardware = argv.hardware!;

	await databaseManager.initialize();

	runId = await databaseManager.insertRun({
		clientCount,
		width,
		height,
		duration,
		frameRate,
		audio,
		hardware,
	});

	unityCommander = new UnityCommander(
		runId,
		width,
		height,
		frameRate,
		audio,
		hardware,
	);
	unityCommander.on("connection", (_ws: WebSocket) => {
		logger.info("New host connected.");
	});
	unityCommander.on("disconnection", (_ws: WebSocket) => {
		logger.info("host disconnected.");
	});
	unityCommander.on("message", async (message: UnityMessage) => {
		switch (message.type) {
			case "ready":
				await startClients();
				break;
		}
	});
	unityCommander.on("metrics", async (metrics: PerformanceMetrics) => {
		logger.debug("Performance metrics:", metrics);
		await databaseManager.insertMetrics(runId, metrics);
	});

	unityCommander.start();
}

function createClientWithIndex(index: number, link: string): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		const clientCommander = new ClientCommander(link, runId, index);
		clients.push(clientCommander);

		const clientIndex = index + 1; // Store the client index (1-based)

		clientCommander.on("gameReady", async () => {
			logger.info(`Client number ${clientIndex} ready.`);
			clientsConnected++;

			if (clientsConnected === clientCount && connectionTimeoutId) {
				logger.info("All clients connected successfully.");
				clearTimeout(connectionTimeoutId);
				connectionTimeoutId = null;
			}

			resolve();
		});

		clientCommander.on("metrics", async (metrics: WebRTCMetrics) => {
			await databaseManager.insertWebRTCMetrics(runId, clientIndex, metrics);
		});

		clientCommander.on(
			"delayValues",
			async (delayValues: DelayMeasurements) => {
				await databaseManager.insertDelayValues(
					runId,
					clientIndex,
					delayValues,
				);
			},
		);

		clientCommander.on("error", (error) => {
			reject(error);
		});

		logger.info(`Starting client number ${clientIndex}.`);

		clientCommander.start().catch((error) => {
			logger.error(`Error starting client ${clientIndex}:`, error);
			reject(error);
		});
	});
}

async function startClients() {
	logger.info(`Starting ${clientCount} clients...`);
	const promises: Promise<void>[] = [];

	// Reset the connected clients counter
	clientsConnected = 0;

	// Set a 120-second timeout to check if all clients connect
	connectionTimeoutId = setTimeout(() => {
		if (clientsConnected < clientCount) {
			logger.error(
				`Connection timeout: Only ${clientsConnected} of ${clientCount} clients connected after 20 seconds.`,
			);
			cleanup(true) // Delete the run from database
				.then(() => {
					// Exit with a non-zero code to indicate failure
					process.exit(1);
				})
				.catch((err) => {
					logger.error("Error during cleanup:", err);
					process.exit(1);
				});
		}
	}, 120000);

	for (let i = 0; i < clientCount; i++) {
		promises.push(createClientWithIndex(i, unityCommander.link));
	}

	try {
		await Promise.all(promises);
		logger.info("Game and Timer started.");

		// Update the game_started_at field in the database with the current time
		await databaseManager.updateGameStartedAt(runId, new Date());

		// Set a timer to end the test after the specified duration
		setTimeout(() => {
			cleanup()
				.then(() => {
					// Exit with success code
					process.exit(0);
				})
				.catch((err) => {
					logger.error("Error during cleanup:", err);
					process.exit(1);
				});
		}, duration * 1000);

		await unityCommander.startGame();
		for (const client of clients) {
			client.startGame();
		}
	} catch (error) {
		logger.error("Failed to start all clients:", error);

		// Clean up and exit with error
		await cleanup(true);
		process.exit(1);
	}
}
