import p5 from "p5";
import drawMap from "./drawMap";
import { draw } from "./sketch";
import type { DrawingConfig } from "./util/types";

const $ = document.querySelector.bind(document);

const SIZE = 400;
const config: DrawingConfig = {
	inputResolutionWidth: SIZE,
	inputResolutionHeight: SIZE,
	edgeDetectionBitDepth: 2,
	maxDist: 100,
	dropOutPercentage: 0.05,
	bgAlpha: 20,
	colAlpha: 160,
	strokeWeight: 1,
	drawingFnName: "lines",
	randomDropout: false,
	seed: 72,
	speed: 0.003,
};

async function main() {
	const canvas: HTMLCanvasElement | null = $("canvas");
	const ctx = canvas?.getContext("2d");
	const p5Wrapper: HTMLDivElement | null = $("#p5-wrapper");
	if (!canvas || !ctx || !p5Wrapper) {
		throw new Error("Could not find canvas");
	}

	ctx.imageSmoothingEnabled = false;

	const width = config.inputResolutionWidth;
	const height = config.inputResolutionHeight;
	canvas.width = width;
	canvas.height = height;

	drawMap(canvas, ctx, config.speed);

	const sketch = (p: p5) => {
		p.setup = () => {
			p.createCanvas(window.innerWidth, window.innerHeight).parent(p5Wrapper);
			p.randomSeed(72);
			p.background(0);
		};

		p.draw = () => {
			const imgdata = ctx.getImageData(0, 0, width, height);
			const pixels = imgdata.data;
			draw(p, width, height, pixels as unknown as number[], config);
		};
	};

	new p5(sketch);
}

main();

export {};
