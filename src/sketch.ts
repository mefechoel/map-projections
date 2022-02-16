import type p5 from "p5";
import type { DrawingConfig } from "./util//types";
import { matchToSize } from "./util/misc";
import { createDrawingFunctions } from "./util/drawFns";
import {
	dropOut,
	dropOutRandom,
	extractEdgePoints,
	sortByDistance2d,
} from "./util/points";

export const draw = (
	p: p5,
	imgWidth: number,
	imgHeight: number,
	imgPixels: number[],
	config: DrawingConfig,
) => {
	const {
		edgeDetectionBitDepth,
		maxDist,
		dropOutPercentage,
		bgAlpha,
		colAlpha,
		strokeWeight,
		drawingFnName,
		randomDropout,
		seed,
	} = config;

	const imgAspect = imgWidth / imgHeight;
	const screenAspect = window.innerWidth / window.innerHeight;
	const isImgWider = imgAspect > screenAspect;
	const maxDim = isImgWider ? imgWidth : imgHeight;
	const maxSize = isImgWider ? window.innerWidth : window.innerHeight;
	const scale = maxSize / maxDim;
	const desiredWidth = Math.round(imgWidth * scale);
	const desiredHeight = Math.round(imgHeight * scale);
	if (p.width !== desiredWidth || p.height !== desiredHeight) {
		p.resizeCanvas(desiredWidth, desiredHeight);
	}

	if (!randomDropout) {
		p.randomSeed(seed);
	}
	function dropOutP5Random<T>(l: T[], percentage: number) {
		return dropOutRandom(l, percentage, () => p.random(1));
	}
	const dropOutFn = randomDropout ? dropOutP5Random : dropOut;
	const drawingFns = createDrawingFunctions(p, maxDist);
	const drawingFn = {
		points: drawingFns.drawPoints,
		curve: drawingFns.drawCurve,
		pipes: drawingFns.drawPipes,
		lines: drawingFns.drawLines,
	}[drawingFnName];

	const edgePoints = extractEdgePoints(
		(x, y) => {
			const i = (x + y * imgWidth) * 4;
			// For some reason d3 creates the grayscale by adjusting the alpha value
			// of a black pixel
			const alpha = imgPixels[i + 3];
			return alpha;
		},
		imgWidth,
		imgHeight,
		edgeDetectionBitDepth,
	);
	const points = dropOutFn(edgePoints, dropOutPercentage);
	const sortedPoints = sortByDistance2d(points, p.width, p.height);
	const sorted = matchToSize(sortedPoints, {
		sourceWidth: imgWidth,
		sourceHeight: imgHeight,
		targetWidth: p.width,
		targetHeight: p.height,
	});

	p.background(0, bgAlpha);
	p.stroke(255, colAlpha);
	p.strokeWeight(strokeWeight);
	drawingFn?.(sorted);
};
