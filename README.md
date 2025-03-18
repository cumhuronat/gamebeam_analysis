# GameBeam Performance Analysis Framework

## Overview

GameBeam Performance Analysis Framework is a tool designed for automated testing, monitoring, and analysis of cloud gaming performance metrics. This framework facilitates systematic testing of the GameBeam framework across various configurations and network conditions.

## Purpose

This framework was developed to provide consistent and reproducible methodologies for analyzing the performance of GameBeam framework with particular focus on:

1. Measuring streaming quality and performance metrics
2. Analyzing the impact of different configuration parameters
3. Collecting data for comparative analysis of cloud gaming technologies
4. Providing benchmarks for academic research and performance optimization studies

## Key Features

- **Automated batch testing**: Run multiple test configurations sequentially with customizable parameters
- **Multi-client support**: Test performance with varying numbers of simultaneous clients
- **Comprehensive metrics collection**: Capture a wide range of performance data
- **Database integration**: Store and organize test results for analysis
- **NVIDIA GPU metrics**: Collect detailed GPU performance statistics
- **WebRTC analysis**: Parse and analyze WebRTC internals for streaming quality assessment
- **Configurable test parameters**: Customize resolution, frame rate, duration, encoder settings and more

## Core Components

### Performance Monitoring

The framework collects detailed system and network performance metrics including:

#### System Metrics
- **CPU Usage**: Process-specific CPU utilization
- **Memory Usage**: Working set memory consumption
- **GPU Utilization**: Graphics processing unit load
- **Network Traffic**: Bytes and packets sent/received

#### NVIDIA GPU Metrics (When Available)
- **GPU Power Consumption**: Power usage in watts
- **GPU Temperature**: Core and memory temperature
- **GPU Utilization**: SM (Streaming Multiprocessor), Memory, Encoder/Decoder utilization
- **GPU Clock Speeds**: Graphics and memory clock frequencies

### WebRTC Streaming Analysis

Detailed metrics for WebRTC-based game streaming:

#### Audio Metrics
- Jitter, packet loss, concealed samples
- Audio quality metrics (interruptions, delay)
- Bitrate and bandwidth utilization

#### Video Metrics
- Resolution and frame rate
- Encoding/decoding performance
- Frame drops, freezes, and quality degradation
- Jitter buffer statistics

#### Network Metrics
- Round-trip time
- Bandwidth estimation
- Packet loss and retransmission rates

### Input Latency Analysis

The framework measures end-to-end latency which is crucial for gaming experience:

- **Input-to-display delay**: Time between user input and corresponding visual feedback
- **Frame delivery timing**: Analysis of consistent frame pacing
- **Processing and network delays**: Breakdown of delay components

## Configuration Parameters

The framework supports testing with variable parameters:

- **Resolution**: Different display resolutions (e.g., 1080p, 720p)
- **Frame Rate**: Variable target frame rates (e.g., 30, 60 FPS)
- **Client Count**: Multiple simultaneous connections
- **Test Duration**: Configurable test length
- **Audio**: Enable/disable audio streaming
- **Hardware Acceleration**: Toggle hardware encoder usage
- **Runs Per Configuration**: Execute each configuration multiple times for statistical validity

## Implementation Details

The framework consists of several key modules:

1. **Game Performance Monitor**: Collects system metrics via typeperf and nvidia-smi
2. **Unity Commander**: Controls the game server application
3. **Client Commander**: Manages browser-based client instances and collects End-to-End latency metrics
4. **WebRTC Dump Parser**: Extracts and processes WebRTC statistics
5. **Database Manager**: Stores test results in PostgreSQL database
6. **Batch Testing Module**: Orchestrates sequential test execution

## Usage in Academic Research

This framework is particularly valuable for academic studies focused on:

1. **Comparative Analysis**: Benchmark different streaming technologies
2. **Configuration Optimization**: Determine optimal settings for various network conditions
3. **Quality of Experience (QoE) Studies**: Correlate technical metrics with user experience
4. **Performance Modeling**: Develop predictive models for cloud gaming performance
5. **Network Impact Studies**: Analyze how network conditions affect gaming experience

## Getting Started

### Prerequisites

- Node.js and npm/pnpm
- PostgreSQL database
- Windows environment (for typeperf/nvidia-smi metrics collection)
- GameBeam Tech Demo application

### Setup

1. Clone the repository
2. Install dependencies with `pnpm install`
3. Configure database connection in `.env` file
4. Set `UNITY_GAME_PATH` environment variable to point to the GameBeam Tech Demo executable

### Running Tests

#### Single Test

```bash
pnpm start -- start --clients 1 --duration 60 --width 1920 --height 1080 --frameRate 30 --audio true --hardware true
```

#### Batch Testing

```bash
pnpm start -- batch --configFile batch-config-combinations.json
```

### Data Analysis

Test results are stored in the PostgreSQL database and can be exported for analysis in statistical software or visualization tools.

## Future Work

- Integration with additional metrics collection tools
- Cross-platform support for metrics collection

## Publications

If you use this framework in your academic research, please consider citing our work.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
