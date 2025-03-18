import { EventEmitter } from "node:events";
import puppeteer, { type Browser, type Page } from "puppeteer-core";
import { logger } from "./logger";
import { WebrtcDumpParser } from "./webrtcDumpParser";
import fs from "node:fs";

declare global {
	interface Window {
		onCustomEvent: (e: Event) => void;
	}
}
interface DelayMeasurement {
	delay: number;
	timestamp: number;
}

export type DelayMeasurements = DelayMeasurement[];

export class ClientCommander extends EventEmitter {
	private browser!: Browser;
	private gamePage!: Page;
	private webrtcPage!: Page;
	private url: string;
	private runId: number;
	private index: number;

	constructor(url: string, runId: number, index: number) {
		super();
		this.url = url;
		this.runId = runId;
		this.index = index+1;
	}

	private async wait(seconds: number): Promise<void> {
		await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
	}

	public async start(): Promise<void> {
		const params = new URLSearchParams({
			key: process.env.TESTABLE_KEY!,
			name: `run-${this.runId}-${this.index}`,
			browserName: "chrome",
			region: "aws-us-east-1",
		}).toString();

		this.browser = await puppeteer.connect({
			browserWSEndpoint: `wss://cdp.testable.io?${params.toString()}`,
		});

		logger.info("Connected to BrowserStack.");

		this.webrtcPage = await this.browser.newPage();
		await this.webrtcPage.goto("chrome://webrtc-internals");

		this.gamePage = await this.browser.newPage();
		await this.gamePage.exposeFunction("gameReady", async () => {
			await this.gamePage.evaluate(() => {
				const button = document.querySelector(
					".fullscreen-button",
				) as HTMLElement;
				if (button) {
					button.click();
				}
			});
			await this.wait(1);
			this.emit("gameReady");
		});

		await this.gamePage.goto(this.url);
	}

	public async startGame(): Promise<void> {
		await this.wait(4);
		await this.replayRace();
	}

	public async replayRace(): Promise<void> {
		const raceRecording = (await import("./raceRecording")).default;
		const startTime = Date.now();

		try {
			const client = await this.gamePage.createCDPSession();

			for (const event of raceRecording) {
				const timeToWait = event.time - (Date.now() - startTime);
				if (timeToWait > 0) {
					await new Promise((resolve) => setTimeout(resolve, timeToWait));
				}

				if (event.type === "keydown") {
					await client.send("Input.dispatchKeyEvent", {
						autoRepeat: false,
						code: event.code,
						isKeypad: false,
						isSystemKey: true,
						key: event.key,
						text: undefined,
						type: "keyDown",
						keyIdentifier: event.code,
						nativeVirtualKeyCode: undefined,
						windowsVirtualKeyCode: undefined,
					});
				} else if (event.type === "keyup") {
					await client.send("Input.dispatchKeyEvent", {
						autoRepeat: false,
						code: event.code,
						isKeypad: false,
						isSystemKey: true,
						key: event.key,
						text: undefined,
						type: "keyUp",
						keyIdentifier: event.code,
						nativeVirtualKeyCode: undefined,
						windowsVirtualKeyCode: undefined,
					});
				}
			}
		} catch (e) {
			return;
		}
	}

	public async stop(): Promise<void> {
		logger.info("Stopping client...");
		if (this.browser) {
			logger.info("Closing browser...");
			await this.webrtcPage.evaluate(() => {
				const originalCreateObjectURL = URL.createObjectURL;
				URL.createObjectURL = (blob: Blob) => {
					//@ts-expect-error no worries about this
					window._webrtcDumpBlob = blob;
					return originalCreateObjectURL(blob);
				};
			});

			await this.webrtcPage.evaluate(() => {
				const button = document.querySelector("button") as HTMLElement;
				button.click();
			});
			await this.wait(1);

			const webrtcDumpContent = await this.webrtcPage.evaluate(async () => {
				//@ts-expect-error no worries about this
				const blob = window._webrtcDumpBlob;
				if (!blob) {
					return null;
				}
				return await blob.text();
			});

      fs.writeFileSync("webrtc_dump.json", webrtcDumpContent);

			const parser = new WebrtcDumpParser(webrtcDumpContent);
			const results = parser.parse();
			this.emit("metrics", results);

			const delayValues = await this.gamePage.evaluate(() => {
				//@ts-expect-error no worries about this
				return window.getDelayValues();
			});

			this.emit("delayValues", delayValues);

			await this.browser.close();
		}
	}
}
