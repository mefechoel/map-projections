export interface Point {
	x: number;
	y: number;
}

export type Vec3 = [number, number, number];

export interface DrawingConfig {
	inputResolutionWidth: number;
	inputResolutionHeight: number;
	edgeDetectionBitDepth: number;
	maxDist: number;
	dropOutPercentage: number;
	bgAlpha: number;
	colAlpha: number;
	strokeWeight: number;
	drawingFnName: "pipes" | "lines" | "curve" | "points";
	randomDropout: boolean;
	seed: number;
	speed: number;
}
