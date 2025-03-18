import { Pool } from "pg";
import type { PerformanceMetrics } from "./gamePerformanceMonitor";
import { logger } from "./logger";
import type { WebRTCMetrics } from "./webrtcDumpParser";

export class DatabaseManager {
	private pool: Pool;

	constructor(connectionConfig: {
		host: string;
		port: number;
		database: string;
		user: string;
		password: string;
	}) {
		this.pool = new Pool(connectionConfig);
	}

	public async initialize(): Promise<void> {
		try {
			await this.pool.query(`
        CREATE TABLE IF NOT EXISTS runs (
          id SERIAL PRIMARY KEY,
          clients BIGINT NOT NULL,
          width BIGINT NOT NULL,
          height BIGINT NOT NULL,
          duration BIGINT NOT NULL,
          audio BOOLEAN NOT NULL,
          frame_rate BIGINT NOT NULL,
          hardware BOOLEAN NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
          game_started_at TIMESTAMP WITH TIME ZONE NOT NULL
        )
      `);

			await this.pool.query(`
        CREATE TABLE IF NOT EXISTS performance_metrics (
          id SERIAL PRIMARY KEY,
          run_id BIGINT NOT NULL REFERENCES runs(id),
          timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
          gpu_utilization REAL NOT NULL,
          working_set_private REAL NOT NULL,
          cpu_usage REAL NOT NULL,
          bytes_received REAL NOT NULL,
          bytes_sent REAL NOT NULL,
          packets_received REAL NOT NULL,
          packets_sent REAL NOT NULL,
          nv_gpu_power REAL,
          nv_gpu_temp REAL,
          nv_gpu_mem_temp REAL,
          nv_gpu_sm REAL,
          nv_gpu_mem REAL,
          nv_gpu_enc REAL,
          nv_gpu_dec REAL,
          nv_gpu_jpg REAL,
          nv_gpu_ofa REAL,
          nv_gpu_mem_clock REAL,
          nv_gpu_clock REAL
        )
      `);

			// Create table for WebRTC data channel metrics
			await this.pool.query(`
        CREATE TABLE IF NOT EXISTS webrtc_data_metrics (
          id SERIAL PRIMARY KEY,
          run_id BIGINT NOT NULL REFERENCES runs(id),
          client_id BIGINT NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
          label TEXT,
          protocol TEXT,
          data_channel_identifier BIGINT,
          state TEXT,
          messages_sent BIGINT,
          messages_sent_per_s REAL,
          bytes_sent BIGINT,
          bytes_sent_in_bits_per_s REAL,
          messages_received BIGINT,
          messages_received_per_s REAL,
          bytes_received BIGINT,
          bytes_received_in_bits_per_s REAL
        )
      `);

			// Create table for WebRTC audio metrics
			await this.pool.query(`
        CREATE TABLE IF NOT EXISTS webrtc_audio_metrics (
          id SERIAL PRIMARY KEY,
          run_id BIGINT NOT NULL REFERENCES runs(id),
          client_id BIGINT NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
          ssrc BIGINT,
          kind TEXT,
          transport_id TEXT,
          codec_id TEXT,
          codec TEXT,
          jitter REAL,
          packets_lost BIGINT,
          playout_id TEXT,
          track_identifier TEXT,
          mid BIGINT,
          remote_id TEXT,
          packets_received BIGINT,
          packets_received_per_s REAL,
          packets_discarded BIGINT,
          packets_discarded_per_s REAL,
          fec_packets_received BIGINT,
          fec_packets_received_per_s REAL,
          fec_packets_discarded BIGINT,
          fec_packets_discarded_per_s REAL,
          bytes_received BIGINT,
          bytes_received_in_bits_per_s REAL,
          header_bytes_received BIGINT,
          header_bytes_received_in_bits_per_s REAL,
          last_packet_received_timestamp TEXT,
          jitter_buffer_delay REAL,
          jitter_buffer_delay_per_jitter_buffer_emitted_count_in_ms REAL,
          jitter_buffer_target_delay REAL,
          jitter_buffer_target_delay_per_jitter_buffer_emitted_count_in_ms REAL,
          jitter_buffer_minimum_delay REAL,
          jitter_buffer_minimum_delay_per_jitter_buffer_emitted_count_in_ms REAL,
          jitter_buffer_emitted_count BIGINT,
          total_samples_received BIGINT,
          total_samples_received_per_s REAL,
          concealed_samples BIGINT,
          concealed_samples_per_s REAL,
          concealed_samples_per_total_samples_received REAL,
          silent_concealed_samples BIGINT,
          silent_concealed_samples_per_s REAL,
          concealment_events BIGINT,
          inserted_samples_for_deceleration BIGINT,
          inserted_samples_for_deceleration_per_s REAL,
          removed_samples_for_acceleration BIGINT,
          removed_samples_for_acceleration_per_s REAL,
          audio_level REAL,
          total_audio_energy REAL,
          audio_level_in_rms REAL,
          total_samples_duration REAL,
          total_processing_delay REAL,
          total_processing_delay_per_jitter_buffer_emitted_count_in_ms REAL,
          jitter_buffer_flushes BIGINT,
          delayed_packet_outage_samples BIGINT,
          relative_packet_arrival_delay REAL,
          interruption_count BIGINT,
          total_interruption_duration REAL
        )
      `);

			// Create table for WebRTC video metrics
			await this.pool.query(`
        CREATE TABLE IF NOT EXISTS webrtc_video_metrics (
          id SERIAL PRIMARY KEY,
          run_id BIGINT NOT NULL REFERENCES runs(id),
          client_id BIGINT NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
          ssrc BIGINT,
          kind TEXT,
          transport_id TEXT,
          codec_id TEXT,
          codec TEXT,
          jitter REAL,
          packets_lost BIGINT,
          track_identifier TEXT,
          mid BIGINT,
          packets_received BIGINT,
          packets_received_per_s REAL,
          bytes_received BIGINT,
          bytes_received_in_bits_per_s REAL,
          header_bytes_received BIGINT,
          header_bytes_received_in_bits_per_s REAL,
          retransmitted_packets_received BIGINT,
          retransmitted_packets_received_per_s REAL,
          retransmitted_bytes_received BIGINT,
          retransmitted_bytes_received_in_bits_per_s REAL,
          rtx_ssrc BIGINT,
          last_packet_received_timestamp TEXT,
          jitter_buffer_delay REAL,
          jitter_buffer_delay_per_jitter_buffer_emitted_count_in_ms REAL,
          jitter_buffer_target_delay REAL,
          jitter_buffer_target_delay_per_jitter_buffer_emitted_count_in_ms REAL,
          jitter_buffer_minimum_delay REAL,
          jitter_buffer_minimum_delay_per_jitter_buffer_emitted_count_in_ms REAL,
          jitter_buffer_emitted_count BIGINT,
          frames_received BIGINT,
          frames_received_per_s REAL,
          frame_width BIGINT,
          frame_height BIGINT,
          frames_per_second BIGINT,
          frames_decoded BIGINT,
          frames_decoded_per_s REAL,
          key_frames_decoded BIGINT,
          key_frames_decoded_per_s REAL,
          frames_dropped BIGINT,
          total_decode_time REAL,
          total_decode_time_per_frames_decoded_in_ms REAL,
          total_processing_delay REAL,
          total_processing_delay_per_jitter_buffer_emitted_count_in_ms REAL,
          total_assembly_time REAL,
          total_assembly_time_per_frames_assembled_from_multiple_packets_in_ms REAL,
          frames_assembled_from_multiple_packets BIGINT,
          total_inter_frame_delay REAL,
          total_inter_frame_delay_per_frames_decoded_in_ms REAL,
          total_squared_inter_frame_delay REAL,
          inter_frame_delay_st_dev_in_ms REAL,
          pause_count BIGINT,
          total_pauses_duration REAL,
          freeze_count BIGINT,
          total_freezes_duration REAL,
          decoder_implementation TEXT,
          fir_count BIGINT,
          pli_count BIGINT,
          nack_count BIGINT,
          goog_timing_frame_info TEXT,
          power_efficient_decoder BOOLEAN,
          min_playout_delay REAL
        )
      `);

			// Create table for WebRTC candidate pair metrics
			await this.pool.query(`
        CREATE TABLE IF NOT EXISTS webrtc_candidate_pair_metrics (
          id SERIAL PRIMARY KEY,
          run_id BIGINT NOT NULL REFERENCES runs(id),
          client_id BIGINT NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
          transport_id TEXT,
          local_candidate_id TEXT,
          remote_candidate_id TEXT,
          state TEXT,
          priority BIGINT,
          nominated BOOLEAN,
          writable BOOLEAN,
          packets_sent BIGINT,
          packets_sent_per_s REAL,
          bytes_sent BIGINT,
          bytes_sent_in_bits_per_s REAL,
          packets_received BIGINT,
          packets_received_per_s REAL,
          bytes_received BIGINT,
          bytes_received_in_bits_per_s REAL,
          total_round_trip_time REAL,
          total_round_trip_time_per_responses_received REAL,
          current_round_trip_time REAL,
          available_outgoing_bitrate REAL,
          requests_received BIGINT,
          requests_sent BIGINT,
          responses_received BIGINT,
          responses_sent BIGINT,
          consent_requests_sent BIGINT,
          packets_discarded_on_send BIGINT,
          bytes_discarded_on_send BIGINT,
          last_packet_received_timestamp TEXT,
          last_packet_sent_timestamp TEXT
        )
      `);

			// Create table for delay measurements
			await this.pool.query(`
        CREATE TABLE IF NOT EXISTS delay_measurements (
          id SERIAL PRIMARY KEY,
          run_id BIGINT NOT NULL REFERENCES runs(id),
          client_id BIGINT NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
          delay REAL NOT NULL
        )
      `);

			// Create indexes
			await this.pool.query(`
        CREATE INDEX IF NOT EXISTS idx_performance_metrics_run_id ON performance_metrics(run_id);
        CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);
        CREATE INDEX IF NOT EXISTS idx_webrtc_data_metrics_run_id ON webrtc_data_metrics(run_id);
        CREATE INDEX IF NOT EXISTS idx_webrtc_data_metrics_timestamp ON webrtc_data_metrics(timestamp);
        CREATE INDEX IF NOT EXISTS idx_webrtc_audio_metrics_run_id ON webrtc_audio_metrics(run_id);
        CREATE INDEX IF NOT EXISTS idx_webrtc_audio_metrics_timestamp ON webrtc_audio_metrics(timestamp);
        CREATE INDEX IF NOT EXISTS idx_webrtc_video_metrics_run_id ON webrtc_video_metrics(run_id);
        CREATE INDEX IF NOT EXISTS idx_webrtc_video_metrics_timestamp ON webrtc_video_metrics(timestamp);
        CREATE INDEX IF NOT EXISTS idx_webrtc_candidate_pair_metrics_run_id ON webrtc_candidate_pair_metrics(run_id);
        CREATE INDEX IF NOT EXISTS idx_webrtc_candidate_pair_metrics_timestamp ON webrtc_candidate_pair_metrics(timestamp);
        CREATE INDEX IF NOT EXISTS idx_delay_measurements_run_id ON delay_measurements(run_id);
        CREATE INDEX IF NOT EXISTS idx_delay_measurements_timestamp ON delay_measurements(timestamp);
      `);

			logger.info("Database initialized successfully");
		} catch (error) {
			logger.error("Error initializing database:", error);
			throw error;
		}
	}

	async insertRun(args: {
		clientCount: number;
		width: number;
		height: number;
		duration: number;
		frameRate: number;
		audio: boolean;
		hardware: boolean;
	}): Promise<number> {
		const result = await this.pool.query(
			`
        INSERT INTO runs (clients, width, height, duration, frame_rate, timestamp, audio, hardware, game_started_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `,
			[
				args.clientCount,
				args.width,
				args.height,
				args.duration,
				args.frameRate,
				new Date(),
				args.audio,
				args.hardware,
				new Date(),
			],
		);
		return result.rows[0].id;
	}

	async updateGameStartedAt(runId: number, gameStartedAt: Date): Promise<void> {
		await this.pool.query(
			`
      UPDATE runs
      SET game_started_at = $1
      WHERE id = $2
      `,
			[gameStartedAt, runId],
		);
		logger.info(`Updated game_started_at for run ${runId}`);
	}

	async insertWebRTCMetrics(
		runId: number,
		clientId: number,
		metrics: WebRTCMetrics,
	): Promise<void> {
		const client = await this.pool.connect();

		try {
			await client.query("BEGIN");

			// Insert data channel metrics
			const dataQuery = `
        INSERT INTO webrtc_data_metrics (
          run_id, client_id, timestamp, label, protocol, data_channel_identifier, state,
          messages_sent, messages_sent_per_s, bytes_sent, bytes_sent_in_bits_per_s,
          messages_received, messages_received_per_s, bytes_received, bytes_received_in_bits_per_s
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      `;

			for (const metric of metrics.dataChannelMetrics) {
				await client.query(dataQuery, [
					runId,
					clientId,
					metric.timestamp,
					metric.label,
					metric.protocol,
					metric.dataChannelIdentifier,
					metric.state,
					metric.messagesSent,
					metric.messagesSent_per_s,
					metric.bytesSent,
					metric.bytesSent_in_bits_per_s,
					metric.messagesReceived,
					metric.messagesReceived_per_s,
					metric.bytesReceived,
					metric.bytesReceived_in_bits_per_s,
				]);
			}

			// Insert audio metrics
			const audioQuery = `
        INSERT INTO webrtc_audio_metrics (
          run_id, client_id, timestamp, ssrc, kind, transport_id, codec_id, codec, jitter,
          packets_lost, playout_id, track_identifier, mid, remote_id, packets_received,
          packets_received_per_s, packets_discarded, packets_discarded_per_s,
          fec_packets_received, fec_packets_received_per_s, fec_packets_discarded,
          fec_packets_discarded_per_s, bytes_received, bytes_received_in_bits_per_s,
          header_bytes_received, header_bytes_received_in_bits_per_s,
          last_packet_received_timestamp, jitter_buffer_delay,
          jitter_buffer_delay_per_jitter_buffer_emitted_count_in_ms,
          jitter_buffer_target_delay,
          jitter_buffer_target_delay_per_jitter_buffer_emitted_count_in_ms,
          jitter_buffer_minimum_delay,
          jitter_buffer_minimum_delay_per_jitter_buffer_emitted_count_in_ms,
          jitter_buffer_emitted_count, total_samples_received,
          total_samples_received_per_s, concealed_samples, concealed_samples_per_s,
          concealed_samples_per_total_samples_received, silent_concealed_samples,
          silent_concealed_samples_per_s, concealment_events,
          inserted_samples_for_deceleration, inserted_samples_for_deceleration_per_s,
          removed_samples_for_acceleration, removed_samples_for_acceleration_per_s,
          audio_level, total_audio_energy, audio_level_in_rms,
          total_samples_duration, total_processing_delay,
          total_processing_delay_per_jitter_buffer_emitted_count_in_ms,
          jitter_buffer_flushes, delayed_packet_outage_samples,
          relative_packet_arrival_delay, interruption_count,
          total_interruption_duration
        ) VALUES (${Array.from({ length: 57 }, (_, i) => `$${i + 1}`).join(",")})
      `;

			for (const metric of metrics.audioMetrics) {
				await client.query(audioQuery, [
					runId,
					clientId,
					metric.timestamp,
					metric.ssrc,
					metric.kind,
					metric.transportId,
					metric.codecId,
					metric.codec,
					metric.jitter,
					metric.packetsLost,
					metric.playoutId,
					metric.trackIdentifier,
					metric.mid,
					metric.remoteId,
					metric.packetsReceived,
					metric.packetsReceived_per_s,
					metric.packetsDiscarded,
					metric.packetsDiscarded_per_s,
					metric.fecPacketsReceived,
					metric.fecPacketsReceived_per_s,
					metric.fecPacketsDiscarded,
					metric.fecPacketsDiscarded_per_s,
					metric.bytesReceived,
					metric.bytesReceived_in_bits_per_s,
					metric.headerBytesReceived,
					metric.headerBytesReceived_in_bits_per_s,
					metric.lastPacketReceivedTimestamp,
					metric.jitterBufferDelay,
					metric.jitterBufferDelay_per_jitterBufferEmittedCount_in_ms,
					metric.jitterBufferTargetDelay,
					metric.jitterBufferTargetDelay_per_jitterBufferEmittedCount_in_ms,
					metric.jitterBufferMinimumDelay,
					metric.jitterBufferMinimumDelay_per_jitterBufferEmittedCount_in_ms,
					metric.jitterBufferEmittedCount,
					metric.totalSamplesReceived,
					metric.totalSamplesReceived_per_s,
					metric.concealedSamples,
					metric.concealedSamples_per_s,
					metric.concealedSamples_per_totalSamplesReceived,
					metric.silentConcealedSamples,
					metric.silentConcealedSamples_per_s,
					metric.concealmentEvents,
					metric.insertedSamplesForDeceleration,
					metric.insertedSamplesForDeceleration_per_s,
					metric.removedSamplesForAcceleration,
					metric.removedSamplesForAcceleration_per_s,
					metric.audioLevel,
					metric.totalAudioEnergy,
					metric.Audio_Level_in_RMS,
					metric.totalSamplesDuration,
					metric.totalProcessingDelay,
					metric.totalProcessingDelay_per_jitterBufferEmittedCount_in_ms,
					metric.jitterBufferFlushes,
					metric.delayedPacketOutageSamples,
					metric.relativePacketArrivalDelay,
					metric.interruptionCount,
					metric.totalInterruptionDuration,
				]);
			}

			// Insert video metrics
			const videoQuery = `
        INSERT INTO webrtc_video_metrics (
          run_id, client_id, timestamp, ssrc, kind, transport_id, codec_id, codec, jitter,
          packets_lost, track_identifier, mid, packets_received,
          packets_received_per_s, bytes_received, bytes_received_in_bits_per_s,
          header_bytes_received, header_bytes_received_in_bits_per_s,
          retransmitted_packets_received, retransmitted_packets_received_per_s,
          retransmitted_bytes_received, retransmitted_bytes_received_in_bits_per_s,
          rtx_ssrc, last_packet_received_timestamp, jitter_buffer_delay,
          jitter_buffer_delay_per_jitter_buffer_emitted_count_in_ms,
          jitter_buffer_target_delay,
          jitter_buffer_target_delay_per_jitter_buffer_emitted_count_in_ms,
          jitter_buffer_minimum_delay,
          jitter_buffer_minimum_delay_per_jitter_buffer_emitted_count_in_ms,
          jitter_buffer_emitted_count, frames_received, frames_received_per_s,
          frame_width, frame_height, frames_per_second, frames_decoded,
          frames_decoded_per_s, key_frames_decoded, key_frames_decoded_per_s,
          frames_dropped, total_decode_time,
          total_decode_time_per_frames_decoded_in_ms, total_processing_delay,
          total_processing_delay_per_jitter_buffer_emitted_count_in_ms,
          total_assembly_time,
          total_assembly_time_per_frames_assembled_from_multiple_packets_in_ms,
          frames_assembled_from_multiple_packets, total_inter_frame_delay,
          total_inter_frame_delay_per_frames_decoded_in_ms,
          total_squared_inter_frame_delay, inter_frame_delay_st_dev_in_ms,
          pause_count, total_pauses_duration, freeze_count, total_freezes_duration,
          decoder_implementation, fir_count, pli_count, nack_count,
          goog_timing_frame_info, power_efficient_decoder, min_playout_delay
        ) VALUES (${Array.from({ length: 63 }, (_, i) => `$${i + 1}`).join(",")})
      `;

			for (const metric of metrics.videoMetrics) {
				await client.query(videoQuery, [
					runId,
					clientId,
					metric.timestamp,
					metric.ssrc,
					metric.kind,
					metric.transportId,
					metric.codecId,
					metric.codec,
					metric.jitter,
					metric.packetsLost,
					metric.trackIdentifier,
					metric.mid,
					metric.packetsReceived,
					metric.packetsReceived_per_s,
					metric.bytesReceived,
					metric.bytesReceived_in_bits_per_s,
					metric.headerBytesReceived,
					metric.headerBytesReceived_in_bits_per_s,
					metric.retransmittedPacketsReceived,
					metric.retransmittedPacketsReceived_per_s,
					metric.retransmittedBytesReceived,
					metric.retransmittedBytesReceived_in_bits_per_s,
					metric.rtxSsrc,
					metric.lastPacketReceivedTimestamp,
					metric.jitterBufferDelay,
					metric.jitterBufferDelay_per_jitterBufferEmittedCount_in_ms,
					metric.jitterBufferTargetDelay,
					metric.jitterBufferTargetDelay_per_jitterBufferEmittedCount_in_ms,
					metric.jitterBufferMinimumDelay,
					metric.jitterBufferMinimumDelay_per_jitterBufferEmittedCount_in_ms,
					metric.jitterBufferEmittedCount,
					metric.framesReceived,
					metric.framesReceived_per_s,
					metric.frameWidth,
					metric.frameHeight,
					metric.framesPerSecond,
					metric.framesDecoded,
					metric.framesDecoded_per_s,
					metric.keyFramesDecoded,
					metric.keyFramesDecoded_per_s,
					metric.framesDropped,
					metric.totalDecodeTime,
					metric.totalDecodeTime_per_framesDecoded_in_ms,
					metric.totalProcessingDelay,
					metric.totalProcessingDelay_per_jitterBufferEmittedCount_in_ms,
					metric.totalAssemblyTime,
					metric.totalAssemblyTime_per_framesAssembledFromMultiplePackets_in_ms,
					metric.framesAssembledFromMultiplePackets,
					metric.totalInterFrameDelay,
					metric.totalInterFrameDelay_per_framesDecoded_in_ms,
					metric.totalSquaredInterFrameDelay,
					metric.interFrameDelayStDev_in_ms,
					metric.pauseCount,
					metric.totalPausesDuration,
					metric.freezeCount,
					metric.totalFreezesDuration,
					metric.decoderImplementation,
					metric.firCount,
					metric.pliCount,
					metric.nackCount,
					metric.googTimingFrameInfo,
					metric.powerEfficientDecoder,
					metric.minPlayoutDelay,
				]);
			}

			// Insert candidate pair metrics
			const candidatePairQuery = `
        INSERT INTO webrtc_candidate_pair_metrics (
          run_id, client_id, timestamp, transport_id, local_candidate_id, remote_candidate_id,
          state, priority, nominated, writable, packets_sent, packets_sent_per_s,
          bytes_sent, bytes_sent_in_bits_per_s, packets_received, packets_received_per_s,
          bytes_received, bytes_received_in_bits_per_s, total_round_trip_time,
          total_round_trip_time_per_responses_received, current_round_trip_time,
          available_outgoing_bitrate, requests_received, requests_sent,
          responses_received, responses_sent, consent_requests_sent,
          packets_discarded_on_send, bytes_discarded_on_send,
          last_packet_received_timestamp, last_packet_sent_timestamp
        ) VALUES (${Array.from({ length: 31 }, (_, i) => `$${i + 1}`).join(",")})
      `;

			for (const metric of metrics.candidatePairMetrics) {
				await client.query(candidatePairQuery, [
					runId,
					clientId,
					metric.timestamp,
					metric.transportId,
					metric.localCandidateId,
					metric.remoteCandidateId,
					metric.state,
					metric.priority,
					metric.nominated,
					metric.writable,
					metric.packetsSent,
					metric.packetsSent_per_s,
					metric.bytesSent,
					metric.bytesSent_in_bits_per_s,
					metric.packetsReceived,
					metric.packetsReceived_per_s,
					metric.bytesReceived,
					metric.bytesReceived_in_bits_per_s,
					metric.totalRoundTripTime,
					metric.totalRoundTripTime_per_responsesReceived,
					metric.currentRoundTripTime,
					metric.availableOutgoingBitrate,
					metric.requestsReceived,
					metric.requestsSent,
					metric.responsesReceived,
					metric.responsesSent,
					metric.consentRequestsSent,
					metric.packetsDiscardedOnSend,
					metric.bytesDiscardedOnSend,
					metric.lastPacketReceivedTimestamp,
					metric.lastPacketSentTimestamp,
				]);
			}

			await client.query("COMMIT");
		} catch (error) {
			await client.query("ROLLBACK");
			logger.error("Error inserting WebRTC metrics:", error);
			throw error;
		} finally {
			client.release();
		}
	}

	async insertMetrics(
		runId: number,
		metrics: PerformanceMetrics,
	): Promise<void> {
		try {
			await this.pool.query(
				`
          INSERT INTO performance_metrics (
            run_id,
            timestamp,
            gpu_utilization,
            working_set_private,
            cpu_usage,
            bytes_received,
            bytes_sent,
            packets_received,
            packets_sent,
            nv_gpu_power,
            nv_gpu_temp,
            nv_gpu_mem_temp,
            nv_gpu_sm,
            nv_gpu_mem,
            nv_gpu_enc,
            nv_gpu_dec,
            nv_gpu_jpg,
            nv_gpu_ofa,
            nv_gpu_mem_clock,
            nv_gpu_clock
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        `,
				[
					runId,
					metrics.timestamp,
					metrics.gpuUtilization,
					metrics.workingSetPrivate,
					metrics.cpuUsage,
					metrics.bytesReceived,
					metrics.bytesSent,
					metrics.packetsReceived,
					metrics.packetsSent,
					metrics.nvGpuPower,
					metrics.nvGpuTemp,
					metrics.nvGpuMemTemp,
					metrics.nvGpuSm,
					metrics.nvGpuMem,
					metrics.nvGpuEnc,
					metrics.nvGpuDec,
					metrics.nvGpuJpg,
					metrics.nvGpuOfa,
					metrics.nvGpuMemClock,
					metrics.nvGpuClock,
				],
			);
		} catch (error) {
			logger.error("Error inserting performance metrics:", error);
			throw error;
		}
	}

	async close(): Promise<void> {
		await this.pool.end();
	}

	public async deleteRun(runId: number): Promise<void> {
		try {
			// Delete all related data first (foreign key constraints)
			await this.pool.query(
				`
        DELETE FROM performance_metrics WHERE run_id = $1
      `,
				[runId],
			);

			await this.pool.query(
				`
        DELETE FROM webrtc_data_metrics WHERE run_id = $1
      `,
				[runId],
			);

			await this.pool.query(
				`
        DELETE FROM webrtc_audio_metrics WHERE run_id = $1
      `,
				[runId],
			);

			await this.pool.query(
				`
        DELETE FROM webrtc_video_metrics WHERE run_id = $1
      `,
				[runId],
			);

			await this.pool.query(
				`
        DELETE FROM webrtc_candidate_pair_metrics WHERE run_id = $1
      `,
				[runId],
			);

			await this.pool.query(
				`
        DELETE FROM delay_measurements WHERE run_id = $1
      `,
				[runId],
			);

			// Finally delete the run itself
			await this.pool.query(
				`
        DELETE FROM runs WHERE id = $1
      `,
				[runId],
			);
		} catch (error) {
			throw new Error(`Failed to delete run ${runId}: ${error}`);
		}
	}

	async insertDelayValues(
		runId: number,
		clientId: number,
		delayValues: { delay: number; timestamp: number }[],
	): Promise<void> {
		const client = await this.pool.connect();

		try {
			await client.query("BEGIN");

			const query = `
        INSERT INTO delay_measurements (
          run_id, client_id, timestamp, delay
        ) VALUES ($1, $2, $3, $4)
      `;

			for (const measurement of delayValues) {
				// Convert timestamp (which is in milliseconds) to a JavaScript Date object
				const timestamp = new Date(measurement.timestamp);

				await client.query(query, [
					runId,
					clientId,
					timestamp,
					measurement.delay,
				]);
			}

			await client.query("COMMIT");
			logger.info(
				`Inserted ${delayValues.length} delay measurements for run ${runId}, client ${clientId}`,
			);
		} catch (error) {
			await client.query("ROLLBACK");
			logger.error("Error inserting delay measurements:", error);
			throw error;
		} finally {
			client.release();
		}
	}
}
