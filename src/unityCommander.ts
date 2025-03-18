import { type ChildProcess, spawn } from "node:child_process";
import { EventEmitter } from "node:events";
import { type WebSocket, WebSocketServer } from "ws";
import {
	GamePerformanceMonitor,
	type PerformanceMetrics,
} from "./gamePerformanceMonitor";
import { logger } from "./logger";

export interface BaseUnityMessage {
	type: "string";
}

export interface ReadyUnityMessage {
	type: "ready";
	link: string;
}

export type UnityMessage = ReadyUnityMessage | BaseUnityMessage;

export class UnityCommander extends EventEmitter {
	private wss!: WebSocketServer;
	private client: WebSocket | null = null;
	private readonly port: number;
	private readonly runId: number;
	private readonly width: number;
	private readonly height: number;
	private readonly frameRate: number;
	private readonly audio: boolean;
	private readonly hardware: boolean;
	public link: string;
	private gameProcess: ChildProcess | null = null;
	private performanceMonitor: GamePerformanceMonitor | null = null;

	constructor(
		runId: number,
		width = 1920,
		height = 1080,
		frameRate = 30,
		audio = true,
		hardware = false,
		port = 8000,
	) {
		super();
		this.runId = runId;
		this.width = width;
		this.frameRate = frameRate;
		this.height = height;
		this.port = port;
		this.link = "";
		this.audio = audio;
		this.hardware = hardware;
	}

	async start(): Promise<void> {
		const execPath = process.env.UNITY_GAME_PATH;
		if (!execPath) {
			throw new Error("UNITY_GAME_PATH environment variable is not set");
		}

		try {
			this.gameProcess = spawn(
				execPath,
				[
					"--width",
					this.width.toString(),
					"--height",
					this.height.toString(),
					"--frame-rate",
					this.frameRate.toString(),
					"--hw-encoder",
					this.hardware ? "true" : "false",
					this.audio ? "" : "--no-audio",
				],
				{
					stdio: "ignore",
				},
			);

			if (!this.gameProcess.pid) {
				throw new Error("Failed to get process ID for the game");
			}

			this.performanceMonitor = new GamePerformanceMonitor(
				this.gameProcess.pid,
			);
			this.performanceMonitor.on("metrics", (metrics: PerformanceMetrics) => {
				this.emit("metrics", metrics);
			});
			this.performanceMonitor.start();

			this.gameProcess.on("error", (error) => {
				logger.error("Failed to start Unity game:", error);
				throw error;
			});

			this.gameProcess.on("exit", (code) => {
				logger.info(`Unity game process exited with code ${code}`);
				this.gameProcess = null;
			});

			logger.info("Unity game process started");
		} catch (error) {
			logger.error("Error starting Unity game:", error);
			throw error;
		}

		logger.info(`WebSocket server is listening on port ${this.port}`);
		// Set up WebSocket server
		this.wss = new WebSocketServer({ port: this.port });

		this.wss.on("listening", () => {
			this.emit(
				"started",
				`WebSocket server is listening on port ${this.port}`,
			);
		});

		this.wss.on("connection", (ws: WebSocket) => {
			this.handleNewConnection(ws);
		});

		this.wss.on("error", (error: Error) => {
			this.emit("error", error);
		});
	}

	async startGame(): Promise<void> {
		if (!this.client) {
			throw new Error("No client connected");
		}
		this.client.send(
			JSON.stringify({
				command: "start",
			}),
		);
	}

	private handleNewConnection(ws: WebSocket): void {
		this.client = ws;
		this.emit("connection", ws);

		ws.on("message", (data: WebSocket.Data) => {
			const message: UnityMessage = JSON.parse(data.toString());
			logger.info(`Received message: ${message.type}`);
			switch (message.type) {
				case "ready":
					this.link = message.link;
					break;
			}
			this.emit("message", message);
		});

		ws.on("close", () => {
			this.client = null;
			this.emit("disconnection", ws);
		});

		ws.on("error", (error: Error) => {
			this.emit("error", error);
		});
	}

	async stop(): Promise<void> {
		if (this.performanceMonitor) {
			this.performanceMonitor.stop();
			this.performanceMonitor = null;
		}

		if (this.gameProcess) {
			this.gameProcess.kill();
			this.gameProcess = null;
			logger.info("Unity game process stopped");
		}

		this.client = null;
		this.wss?.close();
	}
}
