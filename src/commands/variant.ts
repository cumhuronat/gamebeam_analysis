import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import type { ArgumentsCamelCase, Argv } from "yargs";
import { logger } from "../logger";

interface BaselineConfig {
  clients: number;
  duration: number;
  width: number;
  height: number;
  frameRate: number;
  audio: boolean;
  hardware: boolean;
  game: string;
}

interface ResolutionPair {
  width: number;
  height: number;
}

interface VariantConfig {
  baseline: BaselineConfig;
  variants: {
    clients?: number[];
    duration?: number[];
    resolutions?: ResolutionPair[];
    frameRate?: number[];
    audio?: boolean[];
    hardware?: boolean[];
    game?: string[];
  };
  runsPerConfig: number;
}

interface VariantArgv {
  configFile?: string;
  delay?: number;
  maxRetries?: number;
  startIndex?: number;
}

export const command = "variant";
export const describe = "Run baseline configuration with one parameter variant at a time";
export const aliases = ["v"];

export function builder(yargs: Argv): Argv<VariantArgv> {
  return yargs
    .option("configFile", {
      type: "string",
      alias: "c",
      description: "Path to JSON config file with baseline and variant options",
      default: "variant-config.json",
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
    });
}

function generateVariantConfigurations(variantConfig: VariantConfig): BaselineConfig[] {
  const { baseline, variants } = variantConfig;
  const configurations: BaselineConfig[] = [];
  
  // First add the baseline configuration
  configurations.push({ ...baseline });
  
  // Then add variants, changing one parameter at a time
  
  // Client variants
  if (variants.clients && variants.clients.length > 0) {
    for (const clientCount of variants.clients) {
      if (clientCount !== baseline.clients) {
        configurations.push({
          ...baseline,
          clients: clientCount
        });
      }
    }
  }
  
  // Duration variants
  if (variants.duration && variants.duration.length > 0) {
    for (const duration of variants.duration) {
      if (duration !== baseline.duration) {
        configurations.push({
          ...baseline,
          duration
        });
      }
    }
  }
  
  // Resolution variants
  if (variants.resolutions && variants.resolutions.length > 0) {
    for (const resolution of variants.resolutions) {
      if (resolution.width !== baseline.width || resolution.height !== baseline.height) {
        configurations.push({
          ...baseline,
          width: resolution.width,
          height: resolution.height
        });
      }
    }
  }
  
  // Frame rate variants
  if (variants.frameRate && variants.frameRate.length > 0) {
    for (const frameRate of variants.frameRate) {
      if (frameRate !== baseline.frameRate) {
        configurations.push({
          ...baseline,
          frameRate
        });
      }
    }
  }
  
  // Audio variants
  if (variants.audio && variants.audio.length > 0) {
    for (const audio of variants.audio) {
      if (audio !== baseline.audio) {
        configurations.push({
          ...baseline,
          audio
        });
      }
    }
  }
  
  // Hardware variants
  if (variants.hardware && variants.hardware.length > 0) {
    for (const hardware of variants.hardware) {
      if (hardware !== baseline.hardware) {
        configurations.push({
          ...baseline,
          hardware
        });
      }
    }
  }
  
  // Game variants
  if (variants.game && variants.game.length > 0) {
    for (const game of variants.game) {
      if (game !== baseline.game) {
        configurations.push({
          ...baseline,
          game
        });
      }
    }
  }
  
  return configurations;
}

function getConfigDescription(config: BaselineConfig, baseline: BaselineConfig): string {
  const differences: string[] = [];
  
  if (config.clients !== baseline.clients) {
    differences.push(`clients: ${config.clients}`);
  }
  if (config.duration !== baseline.duration) {
    differences.push(`duration: ${config.duration}`);
  }
  if (config.width !== baseline.width || config.height !== baseline.height) {
    differences.push(`resolution: ${config.width}x${config.height}`);
  }
  if (config.frameRate !== baseline.frameRate) {
    differences.push(`frameRate: ${config.frameRate}`);
  }
  if (config.audio !== baseline.audio) {
    differences.push(`audio: ${config.audio}`);
  }
  if (config.hardware !== baseline.hardware) {
    differences.push(`hardware: ${config.hardware}`);
  }
  if (config.game !== baseline.game) {
    differences.push(`game: ${config.game}`);
  }
  
  if (differences.length === 0) {
    return "baseline";
  }
  
  return differences.join(", ");
}

export async function handler(argv: ArgumentsCamelCase<VariantArgv>) {
  const configFile = argv.configFile!;
  const delaySeconds = argv.delay!;
  const maxRetries = argv.maxRetries!;
  const startIndex = argv.startIndex!;
  
  logger.info(`Starting variant run using config file: ${configFile}`);
  
  try {
    const configPath = path.resolve(process.cwd(), configFile);
    const configContent = fs.readFileSync(configPath, "utf8");
    const parsedConfig = JSON.parse(configContent);
    
    // Handle both single config object and array of configs
    const variantConfigs: VariantConfig[] = Array.isArray(parsedConfig) 
      ? parsedConfig 
      : [parsedConfig];
    
    if (variantConfigs.length === 0) {
      logger.error("No configurations found in config file");
      return;
    }
    
    logger.info(`Found ${variantConfigs.length} variant configuration${variantConfigs.length > 1 ? 's' : ''} to process`);
    
    // Process each variant config sequentially
    for (let configIndex = 0; configIndex < variantConfigs.length; configIndex++) {
      const variantConfig = variantConfigs[configIndex];
      
      // Skip undefined configs
      if (!variantConfig) {
        logger.error(`Invalid variant config at index ${configIndex}, skipping`);
        continue;
      }
      
      if (!variantConfig.baseline) {
        logger.error(`No baseline configuration found in config at index ${configIndex}, skipping`);
        continue;
      }
      
      const configurations = generateVariantConfigurations(variantConfig);
      
      if (configurations.length === 0) {
        logger.error(`No valid configurations found or generated for config at index ${configIndex}, skipping`);
        continue;
      }
      
      logger.info(`Processing config ${configIndex + 1}/${variantConfigs.length}: Found ${configurations.length} configurations to run (baseline + variants)`);
      logger.info(`Baseline: clients=${variantConfig.baseline.clients}, duration=${variantConfig.baseline.duration}, resolution=${variantConfig.baseline.width}x${variantConfig.baseline.height}, frameRate=${variantConfig.baseline.frameRate}, audio=${variantConfig.baseline.audio}, hardware=${variantConfig.baseline.hardware}, game=${variantConfig.baseline.game}`);
      
      // Use the provided startIndex only for the first config
      const effectiveStartIndex = configIndex === 0 ? startIndex : 0;
      
      if (effectiveStartIndex < 0 || effectiveStartIndex >= configurations.length) {
        logger.error(
          `Invalid startIndex: ${effectiveStartIndex} for config ${configIndex}. Must be between 0 and ${configurations.length - 1}, skipping config`
        );
        continue;
      }
      
      if (effectiveStartIndex > 0) {
        logger.info(
          `Starting from configuration index ${effectiveStartIndex} (skipping ${effectiveStartIndex} configurations)`
        );
      }
      
      const totalRuns = variantConfig.runsPerConfig || 1;
      
      for (let runNumber = 1; runNumber <= totalRuns; runNumber++) {
        if (totalRuns > 1) {
          logger.info(`Starting run ${runNumber}/${totalRuns} across all configurations for config ${configIndex + 1}/${variantConfigs.length}`);
        }
        
        for (let i = effectiveStartIndex; i < configurations.length; i++) {
          const config = configurations[i];
          
          if (!config || typeof config !== "object") {
            logger.error(`Invalid configuration found at index ${i}, skipping`);
            continue;
          }
          
          const configDescription = getConfigDescription(config, variantConfig.baseline);
          const isBaseline = configDescription === "baseline";
          
          logger.info(
            `Running configuration ${i}/${configurations.length - 1} (Run ${runNumber}/${totalRuns}) - ${isBaseline ? "BASELINE" : `VARIANT (${configDescription})`} - Config ${configIndex + 1}/${variantConfigs.length}`
          );
          
          logger.info(
            `Parameters: --clients ${config.clients} --duration ${config.duration} --width ${config.width} --height ${config.height} --frameRate ${config.frameRate} --audio ${config.audio} --hardware ${config.hardware} --game ${config.game}`
          );
          
          const command = `tsx ./bin/run.ts start --clients ${config.clients} --duration ${config.duration} --width ${config.width} --height ${config.height} --frameRate ${config.frameRate} --audio ${config.audio} --hardware ${config.hardware} --game ${config.game}`;
          
          let success = false;
          let retryCount = 0;
          
          while (!success && retryCount <= maxRetries) {
            if (retryCount > 0) {
              logger.info(
                `Retry attempt ${retryCount} of ${maxRetries} for configuration ${i}: ${isBaseline ? "BASELINE" : `VARIANT (${configDescription})`}`
              );
              logger.info(`Waiting ${delaySeconds} seconds before retrying...`);
              await new Promise((resolve) =>
                setTimeout(resolve, delaySeconds * 1000)
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
                  `Maximum retry attempts (${maxRetries}) reached for configuration ${i}. Exiting...`
                );
                logger.info(
                  `To resume testing, run: tsx ./bin/run.ts variant --startIndex ${i + 1} --configFile ${configFile} --runsPerConfig ${totalRuns - runNumber + 1}`
                );
                process.exit(1);
              }
            }
          }
          
          if (i < configurations.length - 1 || runNumber < totalRuns) {
            logger.info(
              `Waiting ${delaySeconds} seconds before starting next configuration...`
            );
            await new Promise((resolve) =>
              setTimeout(resolve, delaySeconds * 1000)
            );
          }
        }
        
        if (runNumber < totalRuns) {
          logger.info(`Completed run ${runNumber}/${totalRuns} for config ${configIndex + 1}/${variantConfigs.length}. Starting next run of all configurations...`);
          await new Promise((resolve) =>
            setTimeout(resolve, delaySeconds * 2 * 1000)
          );
        }
      }
      
      // Add extra delay between processing different configs
      if (configIndex < variantConfigs.length - 1) {
        logger.info(`Completed processing config ${configIndex + 1}/${variantConfigs.length}. Waiting ${delaySeconds * 3} seconds before starting next config...`);
        await new Promise((resolve) =>
          setTimeout(resolve, delaySeconds * 3 * 1000)
        );
      }
    }
    
    logger.info("All variant runs completed successfully");
  } catch (error) {
    logger.error("Error running variant command:", error);
  }
}
