import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import type { ArgumentsCamelCase, Argv } from "yargs";
import { logger } from "../logger";

interface BatchConfig {
	clients: number;
	duration: number;
	width: number;
	height: number;
	frameRate: number;
	audio: boolean;
	hardware: boolean;
	runsPerConfig?: number;
}

interface ResolutionPair {
	width: number;
	height: number;
}

interface ConfigOptions {
	clients?: number[];
	duration?: number[];
	resolutions?: ResolutionPair[];
	frameRate?: number[];
	audio?: boolean[];
	hardware?: boolean[];
	runsPerConfig?: number[];
	filter?: string;
}

interface BatchArgv {
	configFile?: string;
	delay?: number;
	maxRetries?: number;
	startIndex?: number;
	runsPerConfig?: number;
}

export const command = "batch";
export const describe = "Run multiple analysis configurations sequentially";
export const aliases = ["b"];

export function builder(yargs: Argv): Argv<BatchArgv> {
	return yargs
		.option("configFile", {
			type: "string",
			alias: "c",
			description: "Path to JSON config file with configuration options",
			default: "batch-config-combinations.json",
		})
		.option("delay", {
			type: "number",
			alias: "d",
			description: "Delay in seconds between consecutive runs",
			default: 3,
		})
		.option("maxRetries", {
			type: "number",
			alias: "r",
			description: "Maximum number of retries for failed tests",
			default: 20,
		})
		.option("startIndex", {
			type: "number",
			alias: "s",
			description: "Index of the configuration to start from (0-based)",
			default: 0,
		})
		.option("runsPerConfig", {
			type: "number",
			alias: "n",
			description: "Number of times to execute each configuration",
			default: 1,
		});
}

function generateConfigurations(options: ConfigOptions): BatchConfig[] {
	let configurations: Partial<BatchConfig>[] = [{}];

	if (options.clients && options.clients.length > 0) {
		const newConfigs: Partial<BatchConfig>[] = [];
		for (const config of configurations) {
			for (const client of options.clients) {
				newConfigs.push({ ...config, clients: client });
			}
		}
		configurations = newConfigs;
	}

	if (options.duration && options.duration.length > 0) {
		const newConfigs: Partial<BatchConfig>[] = [];
		for (const config of configurations) {
			for (const duration of options.duration) {
				newConfigs.push({ ...config, duration });
			}
		}
		configurations = newConfigs;
	}

	if (options.resolutions && options.resolutions.length > 0) {
		const newConfigs: Partial<BatchConfig>[] = [];
		for (const config of configurations) {
			for (const resolution of options.resolutions) {
				newConfigs.push({
					...config,
					width: resolution.width,
					height: resolution.height,
				});
			}
		}
		configurations = newConfigs;
	}

	if (options.frameRate && options.frameRate.length > 0) {
		const newConfigs: Partial<BatchConfig>[] = [];
		for (const config of configurations) {
			for (const frameRate of options.frameRate) {
				newConfigs.push({ ...config, frameRate });
			}
		}
		configurations = newConfigs;
	}

	if (options.audio && options.audio.length > 0) {
		const newConfigs: Partial<BatchConfig>[] = [];
		for (const config of configurations) {
			for (const audio of options.audio) {
				newConfigs.push({ ...config, audio });
			}
		}
		configurations = newConfigs;
	}

	if (options.hardware && options.hardware.length > 0) {
		const newConfigs: Partial<BatchConfig>[] = [];
		for (const config of configurations) {
			for (const hardware of options.hardware) {
				newConfigs.push({ ...config, hardware });
			}
		}
		configurations = newConfigs;
	}

	if (options.runsPerConfig && options.runsPerConfig.length > 0) {
		const newConfigs: Partial<BatchConfig>[] = [];
		for (const config of configurations) {
			for (const runsPerConfig of options.runsPerConfig) {
				newConfigs.push({ ...config, runsPerConfig });
			}
		}
		configurations = newConfigs;
	}

	if (options.filter) {
		try {
			const filterFn = new Function("config", `return ${options.filter};`);
			configurations = configurations.filter((config) => filterFn(config));
		} catch (error) {
			logger.error(`Error applying filter: ${error}`);
		}
	}

	return configurations as BatchConfig[];
}

export async function handler(argv: ArgumentsCamelCase<BatchArgv>) {
	const configFile = argv.configFile!;
	const delaySeconds = argv.delay!;
	const maxRetries = argv.maxRetries!;
	const startIndex = argv.startIndex!;
	const commandLineRunsPerConfig = argv.runsPerConfig!;

	logger.info(`Starting batch run using config file: ${configFile}`);

	try {
		const configPath = path.resolve(process.cwd(), configFile);
		const configContent = fs.readFileSync(configPath, "utf8");
		const configOptions: ConfigOptions | BatchConfig[] =
			JSON.parse(configContent);

		let configurations: BatchConfig[];

		if (Array.isArray(configOptions)) {
			logger.info(
				"Using legacy configuration format (array of explicit configurations)",
			);
			configurations = configOptions;
		} else {
			logger.info("Generating configurations from options");
			configurations = generateConfigurations(configOptions as ConfigOptions);
			logger.info(
				`Generated ${configurations.length} configurations from options`,
			);
		}

		if (configurations.length === 0) {
			logger.error("No valid configurations found or generated");
			return;
		}

		logger.info(`Found ${configurations.length} configurations to run`);

		if (startIndex < 0 || startIndex >= configurations.length) {
			logger.error(
				`Invalid startIndex: ${startIndex}. Must be between 0 and ${configurations.length - 1}`,
			);
			return;
		}

		if (startIndex > 0) {
			logger.info(
				`Starting from configuration index ${startIndex} (skipping ${startIndex} configurations)`,
			);
		}

		const totalRuns = commandLineRunsPerConfig || 1;
		
		for (let runNumber = 1; runNumber <= totalRuns; runNumber++) {
			if (totalRuns > 1) {
				logger.info(`Starting run ${runNumber}/${totalRuns} across all configurations`);
			}
			
			for (let i = startIndex; i < configurations.length; i++) {
				const config = configurations[i];

				if (!config || typeof config !== "object") {
					logger.error(`Invalid configuration found at index ${i}, skipping`);
					continue;
				}

				logger.info(
					`Running configuration ${i}/${configurations.length - 1} (Run ${runNumber}/${totalRuns}) --clients ${config.clients} --duration ${config.duration} --width ${config.width} --height ${config.height} --frameRate ${config.frameRate} --audio ${config.audio} --hardware ${config.hardware}`,
				);

				const command = `tsx ./bin/run.ts start --clients ${config.clients} --duration ${config.duration} --width ${config.width} --height ${config.height} --frameRate ${config.frameRate} --audio ${config.audio} --hardware ${config.hardware}`;

				let success = false;
				let retryCount = 0;

				while (!success && retryCount <= maxRetries) {
					if (retryCount > 0) {
						logger.info(
							`Retry attempt ${retryCount} of ${maxRetries} for configuration ${i}: --clients ${config.clients} --duration ${config.duration} --width ${config.width} --height ${config.height}`,
						);
						logger.info(`Waiting ${delaySeconds} seconds before retrying...`);
						await new Promise((resolve) =>
							setTimeout(resolve, delaySeconds * 1000),
						);
					}

					logger.info(`Executing: ${command}`);

					try {
						execSync(command, {
							stdio: "inherit",
							windowsHide: true,
						});
						logger.info(`Configuration ${i} (Run ${runNumber}/${totalRuns}) completed successfully`);
						success = true;
					} catch (error) {
						const err = error as any;
						if (err.status) {
							logger.error(`Test failed with exit code: ${err.status}`);
						} else {
							logger.error("Error running configuration:", error);
						}
						retryCount++;

						if (retryCount > maxRetries) {
							logger.error(
								`Maximum retry attempts (${maxRetries}) reached for configuration ${i}. Exiting...`,
							);
							logger.info(
								`To resume testing, run: tsx ./bin/run.ts batch --startIndex ${i + 1} --runsPerConfig ${totalRuns - runNumber + 1}`,
							);
							process.exit(1);
						}
					}
				}

				if (i < configurations.length - 1 || runNumber < totalRuns) {
					logger.info(
						`Waiting ${delaySeconds} seconds before starting next configuration...`,
					);
					await new Promise((resolve) =>
						setTimeout(resolve, delaySeconds * 1000),
					);
				}
			}
			
			if (runNumber < totalRuns) {
				logger.info(`Completed run ${runNumber}/${totalRuns}. Starting next run of all configurations...`);
				await new Promise((resolve) =>
					setTimeout(resolve, delaySeconds * 2 * 1000), 
				);
			}
		}

		logger.info("Batch run completed successfully");
	} catch (error) {
		logger.error("Error running batch command:", error);
	}
}
