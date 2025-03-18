import { type ChildProcess, exec, spawn } from "node:child_process";
import { EventEmitter } from "node:events";
import { logger } from "./logger";

export interface PerformanceMetrics {
	timestamp: Date;
	// Typeperf metrics
	gpuUtilization: number;
	workingSetPrivate: number;
	cpuUsage: number;
	bytesReceived: number;
	bytesSent: number;
	packetsReceived: number;
	packetsSent: number;
	// NVIDIA GPU metrics
	nvGpuPower: number;
	nvGpuTemp: number;
	nvGpuMemTemp: number;
	nvGpuSm: number;
	nvGpuMem: number;
	nvGpuEnc: number;
	nvGpuDec: number;
	nvGpuJpg: number;
	nvGpuOfa: number;
	nvGpuMemClock: number;
	nvGpuClock: number;
}

export class GamePerformanceMonitor extends EventEmitter {
	private typeperfProcess: ChildProcess | null = null;
	private nvidiaSmiProcess: ChildProcess | null = null;
	private processId: number;
	private processName: string;
	private dataBuffer = "";
	private nvidiaSmiBuffer = "";
	private nvMetrics: Partial<PerformanceMetrics> = {};
	private headerParsed = false;

	constructor(processId: number, processName = "GameBeamTechDemo") {
		super();
		this.processId = processId;
		this.processName = processName;
	}

	start(): void {
		this.startTypeperf();
		this.startNvidiaSmi();
		logger.info("Performance monitoring started");
	}

	private startTypeperf(): void {
		const counters = [
			`"\\GPU Engine(pid_${this.processId}*3D)\\Utilization Percentage"`,
			`"\\Process(${this.processName})\\Working Set - Private"`,
			`"\\Process(${this.processName})\\% Processor Time"`,
			`"\\Network Interface(Real*)\\Bytes Received/sec"`,
			`"\\Network Interface(Real*)\\Bytes Sent/sec"`,
			`"\\Network Interface(Real*)\\Packets Received/sec"`,
			`"\\Network Interface(Real*)\\Packets Sent/sec"`,
		];

		const typeperfArgs = [...counters, "-si", "1"];

		this.typeperfProcess = spawn("typeperf", typeperfArgs, { shell: true });

		if (!this.typeperfProcess.stdout || !this.typeperfProcess.stderr) {
			throw new Error("Failed to create typeperf process streams");
		}

		this.typeperfProcess.stdout.on("data", (data: Buffer) => {
			this.dataBuffer += data.toString();
			const lines = this.dataBuffer.split("\r\n");

			if (lines.length === 0) return;
			if (!lines[lines.length - 1]?.endsWith("\r\n")) {
				this.dataBuffer = lines.pop() || "";
			} else {
				this.dataBuffer = "";
			}

			for (let i = 0; i < lines.length; i++) {
				const trimmedLine = lines[i]!.trim();
				if (trimmedLine && !trimmedLine.startsWith('"(PDH-CSV')) {
					try {
						const values = trimmedLine
							.split(",")
							.map((s) => s.replace(/"/g, "").trim());
						if (values.length < 8) {
							logger.error("Invalid performance data format:", trimmedLine);
							continue;
						}
						const [
							timestamp,
							gpuStr,
							memoryStr,
							cpuStr,
							bytesReceivedStr,
							bytesSentStr,
							packetsReceivedStr,
							packetsSentStr,
						] = values;
						if (
							!timestamp ||
							!gpuStr ||
							!memoryStr ||
							!cpuStr ||
							!bytesReceivedStr ||
							!bytesSentStr ||
							!packetsReceivedStr ||
							!packetsSentStr
						) {
							logger.error("Missing performance data values:", trimmedLine);
							continue;
						}

						const metrics: PerformanceMetrics = {
							timestamp: new Date(timestamp),
							gpuUtilization: Number.parseFloat(gpuStr) || 0,
							workingSetPrivate: Number.parseFloat(memoryStr) || 0,
							cpuUsage: Number.parseFloat(cpuStr) || 0,
							bytesReceived: Number.parseFloat(bytesReceivedStr) || 0,
							bytesSent: Number.parseFloat(bytesSentStr) || 0,
							packetsReceived: Number.parseFloat(packetsReceivedStr) || 0,
							packetsSent: Number.parseFloat(packetsSentStr) || 0,
							nvGpuPower: this.nvMetrics.nvGpuPower || 0,
							nvGpuTemp: this.nvMetrics.nvGpuTemp || 0,
							nvGpuMemTemp: this.nvMetrics.nvGpuMemTemp || 0,
							nvGpuSm: this.nvMetrics.nvGpuSm || 0,
							nvGpuMem: this.nvMetrics.nvGpuMem || 0,
							nvGpuEnc: this.nvMetrics.nvGpuEnc || 0,
							nvGpuDec: this.nvMetrics.nvGpuDec || 0,
							nvGpuJpg: this.nvMetrics.nvGpuJpg || 0,
							nvGpuOfa: this.nvMetrics.nvGpuOfa || 0,
							nvGpuMemClock: this.nvMetrics.nvGpuMemClock || 0,
							nvGpuClock: this.nvMetrics.nvGpuClock || 0,
						};

						this.emit("metrics", metrics);
						logger.debug("Performance metrics:", metrics);
					} catch (error) {
						logger.error("Error parsing performance metrics:", error);
					}
				}
			}
		});

		this.typeperfProcess.stderr.on("data", (data: Buffer) => {
			logger.error("Typeperf error:", data.toString());
		});

		this.typeperfProcess.on("error", (error) => {
			logger.error("Failed to start typeperf:", error);
			this.emit("error", error);
		});

		this.typeperfProcess.on("exit", (code) => {
			logger.info(`Typeperf process exited with code ${code}`);
			this.typeperfProcess = null;
			this.emit("stopped");
		});
	}

	private startNvidiaSmi(): void {
		this.nvidiaSmiProcess = spawn("nvidia-smi.exe", ["dmon"], { shell: true });

		if (!this.nvidiaSmiProcess.stdout || !this.nvidiaSmiProcess.stderr) {
			logger.error("Failed to create nvidia-smi process streams");
			return;
		}

		this.nvidiaSmiProcess.stdout.on("data", (data: Buffer) => {
			this.nvidiaSmiBuffer += data.toString();
			const lines = this.nvidiaSmiBuffer.split("\n");

			if (lines.length === 0) return;
			if (!lines[lines.length - 1]?.endsWith("\n")) {
				this.nvidiaSmiBuffer = lines.pop() || "";
			} else {
				this.nvidiaSmiBuffer = "";
			}

			for (let i = 0; i < lines.length; i++) {
				const line = lines[i]!.trim();

				if (!line || line.startsWith("#")) {
					if (line.startsWith("# gpu")) {
						this.headerParsed = true;
					}
					continue;
				}

				if (this.headerParsed) {
					try {
						const values = line.split(/\s+/).filter(Boolean);

						if (values.length < 12) {
							continue;
						}

						const [
							_gpuIdx,
							power,
							gpuTemp,
							memTemp,
							sm,
							mem,
							enc,
							dec,
							jpg,
							ofa,
							memClock,
							gpuClock,
						] = values;

						this.nvMetrics = {
							nvGpuPower: Number.parseFloat(power || "0"),
							nvGpuTemp: Number.parseFloat(gpuTemp || "0"),
							nvGpuMemTemp:
								memTemp === "-" ? 0 : Number.parseFloat(memTemp || "0"),
							nvGpuSm: Number.parseFloat(sm || "0"),
							nvGpuMem: Number.parseFloat(mem || "0"),
							nvGpuEnc: Number.parseFloat(enc || "0"),
							nvGpuDec: Number.parseFloat(dec || "0"),
							nvGpuJpg: Number.parseFloat(jpg || "0"),
							nvGpuOfa: Number.parseFloat(ofa || "0"),
							nvGpuMemClock: Number.parseFloat(memClock || "0"),
							nvGpuClock: Number.parseFloat(gpuClock || "0"),
						};

						logger.debug("NVIDIA GPU metrics updated:", this.nvMetrics);
					} catch (error) {
						logger.error("Error parsing NVIDIA metrics:", error);
					}
				}
			}
		});

		this.nvidiaSmiProcess.stderr.on("data", (data: Buffer) => {
			logger.error("NVIDIA SMI error:", data.toString());
		});

		this.nvidiaSmiProcess.on("error", (error) => {
			logger.error("Failed to start NVIDIA SMI:", error);
		});

		this.nvidiaSmiProcess.on("exit", (code) => {
			logger.info(`NVIDIA SMI process exited with code ${code}`);
			this.nvidiaSmiProcess = null;
		});
	}

	stop(): void {
		if (this.typeperfProcess) {
			this.typeperfProcess.kill();

			exec("taskkill /f /im typeperf.exe", (error) => {
				if (error) {
					logger.error("Error killing typeperf process:", error);
				} else {
					logger.info("Typeperf process killed successfully");
				}
			});

			this.typeperfProcess = null;
		}

		if (this.nvidiaSmiProcess) {
			this.nvidiaSmiProcess.kill();

			exec("taskkill /f /im nvidia-smi.exe", (error) => {
				if (error) {
					logger.error("Error killing nvidia-smi process:", error);
				} else {
					logger.info("NVIDIA SMI process killed successfully");
				}
			});

			this.nvidiaSmiProcess = null;
		}

		logger.info("Performance monitoring stopped");
	}
}
