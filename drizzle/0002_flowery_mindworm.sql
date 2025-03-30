DROP INDEX "idx_delay_measurements_run_id";--> statement-breakpoint
DROP INDEX "idx_delay_measurements_timestamp";--> statement-breakpoint
DROP INDEX "idx_performance_metrics_run_id";--> statement-breakpoint
DROP INDEX "idx_performance_metrics_timestamp";--> statement-breakpoint
DROP INDEX "idx_webrtc_audio_metrics_run_id";--> statement-breakpoint
DROP INDEX "idx_webrtc_audio_metrics_timestamp";--> statement-breakpoint
DROP INDEX "idx_webrtc_candidate_pair_metrics_run_id";--> statement-breakpoint
DROP INDEX "idx_webrtc_candidate_pair_metrics_timestamp";--> statement-breakpoint
DROP INDEX "idx_webrtc_data_metrics_run_id";--> statement-breakpoint
DROP INDEX "idx_webrtc_data_metrics_timestamp";--> statement-breakpoint
DROP INDEX "idx_webrtc_video_metrics_run_id";--> statement-breakpoint
DROP INDEX "idx_webrtc_video_metrics_timestamp";--> statement-breakpoint
CREATE INDEX "idx_delay_measurements_run_ts" ON "delay_measurements" USING btree ("run_id","client_id","timestamp");--> statement-breakpoint
CREATE INDEX "idx_performance_metrics_run_ts" ON "performance_metrics" USING btree ("run_id","timestamp");--> statement-breakpoint
CREATE INDEX "idx_runs_game_started_date_clients" ON "runs" USING btree ("game_started_at","clients");--> statement-breakpoint
CREATE INDEX "idx_webrtc_audio_metrics_run_ts" ON "webrtc_audio_metrics" USING btree ("run_id","client_id","timestamp");--> statement-breakpoint
CREATE INDEX "idx_webrtc_candidate_pair_metrics_run_ts" ON "webrtc_candidate_pair_metrics" USING btree ("run_id","client_id","timestamp");--> statement-breakpoint
CREATE INDEX "idx_webrtc_data_metrics_run_ts" ON "webrtc_data_metrics" USING btree ("run_id","client_id","timestamp");--> statement-breakpoint
CREATE INDEX "idx_webrtc_video_metrics_run_ts" ON "webrtc_video_metrics" USING btree ("run_id","client_id","timestamp");--> statement-breakpoint
CREATE INDEX "idx_webrtc_video_metrics_gotimingframeinfo" ON "webrtc_video_metrics" USING btree ("run_id","client_id","goog_timing_frame_info");