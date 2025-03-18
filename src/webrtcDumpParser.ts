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
	messagesSent_per_s?: number;
	bytesSent?: number;
	bytesSent_in_bits_per_s?: number;
	messagesReceived?: number;
	messagesReceived_per_s?: number;
	bytesReceived?: number;
	bytesReceived_in_bits_per_s?: number;
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
	packetsSent_per_s?: number;
	bytesSent?: number;
	bytesSent_in_bits_per_s?: number;
	packetsReceived?: number;
	packetsReceived_per_s?: number;
	bytesReceived?: number;
	bytesReceived_in_bits_per_s?: number;
	totalRoundTripTime?: number;
	totalRoundTripTime_per_responsesReceived?: number;
	currentRoundTripTime?: number;
	availableOutgoingBitrate?: number;
	requestsReceived?: number;
	requestsSent?: number;
	responsesReceived?: number;
	responsesSent?: number;
	consentRequestsSent?: number;
	packetsDiscardedOnSend?: number;
	bytesDiscardedOnSend?: number;
	lastPacketReceivedTimestamp?: number;
	lastPacketSentTimestamp?: number;
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
	packetsReceived_per_s?: number;
	packetsDiscarded?: number;
	packetsDiscarded_per_s?: number;
	fecPacketsReceived?: number;
	fecPacketsReceived_per_s?: number;
	fecPacketsDiscarded?: number;
	fecPacketsDiscarded_per_s?: number;
	bytesReceived?: number;
	bytesReceived_in_bits_per_s?: number;
	headerBytesReceived?: number;
	headerBytesReceived_in_bits_per_s?: number;
	lastPacketReceivedTimestamp?: string;
	jitterBufferDelay?: number;
	jitterBufferDelay_per_jitterBufferEmittedCount_in_ms?: number;
	jitterBufferTargetDelay?: number;
	jitterBufferTargetDelay_per_jitterBufferEmittedCount_in_ms?: number;
	jitterBufferMinimumDelay?: number;
	jitterBufferMinimumDelay_per_jitterBufferEmittedCount_in_ms?: number;
	jitterBufferEmittedCount?: number;
	totalSamplesReceived?: number;
	totalSamplesReceived_per_s?: number;
	concealedSamples?: number;
	concealedSamples_per_s?: number;
	concealedSamples_per_totalSamplesReceived?: number;
	silentConcealedSamples?: number;
	silentConcealedSamples_per_s?: number;
	concealmentEvents?: number;
	insertedSamplesForDeceleration?: number;
	insertedSamplesForDeceleration_per_s?: number;
	removedSamplesForAcceleration?: number;
	removedSamplesForAcceleration_per_s?: number;
	audioLevel?: number;
	totalAudioEnergy?: number;
	Audio_Level_in_RMS?: number;
	totalSamplesDuration?: number;
	totalProcessingDelay?: number;
	totalProcessingDelay_per_jitterBufferEmittedCount_in_ms?: number;
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
	packetsReceived_per_s?: number;
	bytesReceived?: number;
	bytesReceived_in_bits_per_s?: number;
	headerBytesReceived?: number;
	headerBytesReceived_in_bits_per_s?: number;
	retransmittedPacketsReceived?: number;
	retransmittedPacketsReceived_per_s?: number;
	retransmittedBytesReceived?: number;
	retransmittedBytesReceived_in_bits_per_s?: number;
	rtxSsrc?: number;
	lastPacketReceivedTimestamp?: string;
	jitterBufferDelay?: number;
	jitterBufferDelay_per_jitterBufferEmittedCount_in_ms?: number;
	jitterBufferTargetDelay?: number;
	jitterBufferTargetDelay_per_jitterBufferEmittedCount_in_ms?: number;
	jitterBufferMinimumDelay?: number;
	jitterBufferMinimumDelay_per_jitterBufferEmittedCount_in_ms?: number;
	jitterBufferEmittedCount?: number;
	framesReceived?: number;
	framesReceived_per_s?: number;
	frameWidth?: number;
	frameHeight?: number;
	framesPerSecond?: number;
	framesDecoded?: number;
	framesDecoded_per_s?: number;
	keyFramesDecoded?: number;
	keyFramesDecoded_per_s?: number;
	framesDropped?: number;
	totalDecodeTime?: number;
	totalDecodeTime_per_framesDecoded_in_ms?: number;
	totalProcessingDelay?: number;
	totalProcessingDelay_per_jitterBufferEmittedCount_in_ms?: number;
	totalAssemblyTime?: number;
	totalAssemblyTime_per_framesAssembledFromMultiplePackets_in_ms?: number;
	framesAssembledFromMultiplePackets?: number;
	totalInterFrameDelay?: number;
	totalInterFrameDelay_per_framesDecoded_in_ms?: number;
	totalSquaredInterFrameDelay?: number;
	interFrameDelayStDev_in_ms?: number;
	pauseCount?: number;
	totalPausesDuration?: number;
	freezeCount?: number;
	totalFreezesDuration?: number;
	decoderImplementation?: string;
	firCount?: number;
	pliCount?: number;
	nackCount?: number;
	googTimingFrameInfo?: string;
	powerEfficientDecoder?: number;
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
		const statNameSanitized = statName!
			.replace(/\[/g, "")
			.replace(/\]/g, "")
			.replace(/\//g, "_per_");

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
