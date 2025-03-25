import { relations } from "drizzle-orm/relations";
import { runs, performanceMetrics, delayMeasurements, webrtcDataMetrics, webrtcAudioMetrics, webrtcVideoMetrics, webrtcCandidatePairMetrics } from "./schema";

export const performanceMetricsRelations = relations(performanceMetrics, ({one}) => ({
	run: one(runs, {
		fields: [performanceMetrics.runId],
		references: [runs.id]
	}),
}));

export const runsRelations = relations(runs, ({many}) => ({
	performanceMetrics: many(performanceMetrics),
	delayMeasurements: many(delayMeasurements),
	webrtcDataMetrics: many(webrtcDataMetrics),
	webrtcAudioMetrics: many(webrtcAudioMetrics),
	webrtcVideoMetrics: many(webrtcVideoMetrics),
	webrtcCandidatePairMetrics: many(webrtcCandidatePairMetrics),
}));

export const delayMeasurementsRelations = relations(delayMeasurements, ({one}) => ({
	run: one(runs, {
		fields: [delayMeasurements.runId],
		references: [runs.id]
	}),
}));

export const webrtcDataMetricsRelations = relations(webrtcDataMetrics, ({one}) => ({
	run: one(runs, {
		fields: [webrtcDataMetrics.runId],
		references: [runs.id]
	}),
}));

export const webrtcAudioMetricsRelations = relations(webrtcAudioMetrics, ({one}) => ({
	run: one(runs, {
		fields: [webrtcAudioMetrics.runId],
		references: [runs.id]
	}),
}));

export const webrtcVideoMetricsRelations = relations(webrtcVideoMetrics, ({one}) => ({
	run: one(runs, {
		fields: [webrtcVideoMetrics.runId],
		references: [runs.id]
	}),
}));

export const webrtcCandidatePairMetricsRelations = relations(webrtcCandidatePairMetrics, ({one}) => ({
	run: one(runs, {
		fields: [webrtcCandidatePairMetrics.runId],
		references: [runs.id]
	}),
}));