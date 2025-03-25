interface WebrtcInternalsDump {
	getUserMedia: unknown;
	PeerConnections: {
		[key: string]: {
			pid: number;
			rtcConfiguration: string;
			stats: {
				[key: string]: {
					startTime: string;
					endTime: string;
					statsType: string;
					values: string;
				};
			};
		};
	};
}

export interface BaseWebRTCMetric {
	timestamp: Date;
	[key: string]: unknown;
}

export interface DataChannelMetric extends BaseWebRTCMetric {
	label?: string;
	protocol?: string;
	dataChannelIdentifier?: number;
	state?: string;
	messagesSent?: number;
	messagesSentPerS?: number;
	bytesSent?: number;
	bytesSentInBitsPerS?: number;
	messagesReceived?: number;
	messagesReceivedPerS?: number;
	bytesReceived?: number;
	bytesReceivedInBitsPerS?: number;
}

export interface CandidatePairMetric extends BaseWebRTCMetric {
	transportId?: string;
	localCandidateId?: string;
	remoteCandidateId?: string;
	state?: string;
	priority?: number;
	nominated?: boolean;
	writable?: boolean;
	packetsSent?: number;
	packetsSentPerS?: number;
	bytesSent?: number;
	bytesSentInBitsPerS?: number;
	packetsReceived?: number;
	packetsReceivedPerS?: number;
	bytesReceived?: number;
	bytesReceivedInBitsPerS?: number;
	totalRoundTripTime?: number;
	totalRoundTripTimePerResponsesReceived?: number;
	currentRoundTripTime?: number;
	availableOutgoingBitrate?: number;
	requestsReceived?: number;
	requestsSent?: number;
	responsesReceived?: number;
	responsesSent?: number;
	consentRequestsSent?: number;
	packetsDiscardedOnSend?: number;
	bytesDiscardedOnSend?: number;
	lastPacketReceivedTimestamp?: string;
	lastPacketSentTimestamp?: string;
}

export interface AudioMetric extends BaseWebRTCMetric {
	ssrc?: number;
	kind?: string;
	transportId?: string;
	codecId?: string;
	codec?: string;
	jitter?: number;
	packetsLost?: number;
	playoutId?: string;
	trackIdentifier?: string;
	mid?: number;
	remoteId?: string;
	packetsReceived?: number;
	packetsReceivedPerS?: number;
	packetsDiscarded?: number;
	packetsDiscardedPerS?: number;
	fecPacketsReceived?: number;
	fecPacketsReceivedPerS?: number;
	fecPacketsDiscarded?: number;
	fecPacketsDiscardedPerS?: number;
	bytesReceived?: number;
	bytesReceivedInBitsPerS?: number;
	headerBytesReceived?: number;
	headerBytesReceivedInBitsPerS?: number;
	lastPacketReceivedTimestamp?: string;
	jitterBufferDelay?: number;
	jitterBufferDelayPerJitterBufferEmittedCountInMs?: number;
	jitterBufferTargetDelay?: number;
	jitterBufferTargetDelayPerJitterBufferEmittedCountInMs?: number;
	jitterBufferMinimumDelay?: number;
	jitterBufferMinimumDelayPerJitterBufferEmittedCountInMs?: number;
	jitterBufferEmittedCount?: number;
	totalSamplesReceived?: number;
	totalSamplesReceivedPerS?: number;
	concealedSamples?: number;
	concealedSamplesPerS?: number;
	concealedSamplesPerTotalSamplesReceived?: number;
	silentConcealedSamples?: number;
	silentConcealedSamplesPerS?: number;
	concealmentEvents?: number;
	insertedSamplesForDeceleration?: number;
	insertedSamplesForDecelerationPerS?: number;
	removedSamplesForAcceleration?: number;
	removedSamplesForAccelerationPerS?: number;
	audioLevel?: number;
	audioLevelInRMS?: number;
	totalAudioEnergy?: number;
	totalSamplesDuration?: number;
	totalProcessingDelay?: number;
	totalProcessingDelayPerJitterBufferEmittedCountInMs?: number;
	jitterBufferFlushes?: number;
	delayedPacketOutageSamples?: number;
	relativePacketArrivalDelay?: number;
	interruptionCount?: number;
	totalInterruptionDuration?: number;
}

export interface VideoMetric extends BaseWebRTCMetric {
	ssrc?: number;
	kind?: string;
	transportId?: string;
	codecId?: string;
	codec?: string;
	jitter?: number;
	packetsLost?: number;
	trackIdentifier?: string;
	mid?: number;
	packetsReceived?: number;
	packetsReceivedPerS?: number;
	bytesReceived?: number;
	bytesReceivedInBitsPerS?: number;
	headerBytesReceived?: number;
	headerBytesReceivedInBitsPerS?: number;
	retransmittedPacketsReceived?: number;
	retransmittedPacketsReceivedPerS?: number;
	retransmittedBytesReceived?: number;
	retransmittedBytesReceivedInBitsPerS?: number;
	rtxSsrc?: number;
	lastPacketReceivedTimestamp?: string;
	jitterBufferDelay?: number;
	jitterBufferDelayPerJitterBufferEmittedCountInMs?: number;
	jitterBufferTargetDelay?: number;
	jitterBufferTargetDelayPerJitterBufferEmittedCountInMs?: number;
	jitterBufferMinimumDelay?: number;
	jitterBufferMinimumDelayPerJitterBufferEmittedCountInMs?: number;
	jitterBufferEmittedCount?: number;
	framesReceived?: number;
	framesReceivedPerS?: number;
	frameWidth?: number;
	frameHeight?: number;
	framesPerSecond?: number;
	framesDecoded?: number;
	framesDecodedPerS?: number;
	keyFramesDecoded?: number;
	keyFramesDecodedPerS?: number;
	framesDropped?: number;
	totalDecodeTime?: number;
	totalDecodeTimePerFramesDecodedInMs?: number;
	totalProcessingDelay?: number;
	totalProcessingDelayPerJitterBufferEmittedCountInMs?: number;
	totalAssemblyTime?: number;
	totalAssemblyTimePerFramesAssembledFromMultiplePacketsInMs?: number;
	framesAssembledFromMultiplePackets?: number;
	totalInterFrameDelay?: number;
	totalInterFrameDelayPerFramesDecodedInMs?: number;
	totalSquaredInterFrameDelay?: number;
	interFrameDelayStDevInMs?: number;
	pauseCount?: number;
	totalPausesDuration?: number;
	freezeCount?: number;
	totalFreezesDuration?: number;
	decoderImplementation?: string;
	firCount?: number;
	pliCount?: number;
	nackCount?: number;
	googTimingFrameInfo?: string;
	powerEfficientDecoder?: boolean;
	minPlayoutDelay?: number;
}

export interface WebRTCMetrics {
	dataChannelMetrics: DataChannelMetric[];
	audioMetrics: AudioMetric[];
	videoMetrics: VideoMetric[];
	candidatePairMetrics: CandidatePairMetric[];
}

export class WebrtcDumpParser {
	private data: WebrtcInternalsDump;

	constructor(fileContents: string) {
		this.data = JSON.parse(fileContents);
	}

	private parseStats(
		key: string,
		stats: {
			[key: string]: {
				values: string;
				startTime: string;
			};
		},
		timeSeriesMap: Array<BaseWebRTCMetric>,
	) {
		const [_, statName] = key.split("-");
		let statNameSanitized = statName!
			.replace(/\[/g, "")
			.replace(/\]/g, "")
			//.replace(/\//g, "Per");

		statNameSanitized = statNameSanitized.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
		statNameSanitized = statNameSanitized.replace(/\/([a-z])/g, (match, letter) => `Per${letter.toUpperCase()}`);

		if (statNameSanitized === "estimatedPlayoutTimestamp") {
			return;
		}

		const values = JSON.parse(stats[key]!.values);

		values.forEach((value: unknown, index: number) => {
			const entry = timeSeriesMap[index];
			if (entry) {
				(entry as { [key: string]: unknown })[statNameSanitized] = value;
			}
		});
	}

	private parseTimes(
		key: string,
		stats: {
			[key: string]: {
				values: string;
				startTime: string;
			};
		},
		timeSeriesMap: Array<BaseWebRTCMetric>,
	) {
		const values = JSON.parse(stats[key]!.values);

		values.forEach((value: number, index: number) => {
			timeSeriesMap.push({
				timestamp: new Date(value),
			});
		});
	}

	public parse(): WebRTCMetrics {
		const connectionKey = Object.keys(this.data.PeerConnections)[0];
		const stats = this.data.PeerConnections[connectionKey!]!.stats;

		const dataTimeSeriesMap = new Array<DataChannelMetric>();
		const audioTimeSeriesMap = new Array<AudioMetric>();
		const videoTimeSeriesMap = new Array<VideoMetric>();
		const candidatePairTimeSeriesMap = new Array<CandidatePairMetric>();

    const correctCP = Object.keys(stats).filter((stat) => stat.startsWith("CP") && stat.endsWith("-state") && stats[stat] && stats[stat].values.indexOf("succeeded") !== -1);
    if (correctCP.length === 0) {
      throw new Error("No correct candidate pair found");
    }
    const correctCPKey = correctCP[0]!.replace("-state", "");

		for (const key of Object.keys(stats)) {
			if (key.endsWith("-timestamp")) {
				if (key.startsWith("IT01V")) {
					this.parseTimes(key, stats, videoTimeSeriesMap);
				} else if (key.startsWith("IT01A")) {
					this.parseTimes(key, stats, audioTimeSeriesMap);
				} else if (key.startsWith("D1")) {
					this.parseTimes(key, stats, dataTimeSeriesMap);
				} else if (key.startsWith(correctCPKey)) {
					this.parseTimes(key, stats, candidatePairTimeSeriesMap);
				}
			}
		}

		for (const key of Object.keys(stats)) {
			if (!key.endsWith("-timestamp")) {
				if (key.startsWith("IT01V")) {
					this.parseStats(key, stats, videoTimeSeriesMap);
				} else if (key.startsWith("IT01A")) {
					this.parseStats(key, stats, audioTimeSeriesMap);
				} else if (key.startsWith("D1")) {
					this.parseStats(key, stats, dataTimeSeriesMap);
				} else if (key.startsWith(correctCPKey)) {
					this.parseStats(key, stats, candidatePairTimeSeriesMap);
				}
			}
		}

		return {
			dataChannelMetrics: dataTimeSeriesMap,
			audioMetrics: audioTimeSeriesMap,
			videoMetrics: videoTimeSeriesMap,
			candidatePairMetrics: candidatePairTimeSeriesMap,
		};
	}
}
