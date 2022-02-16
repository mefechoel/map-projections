import { animationFrames, map } from "rxjs";
import { geoMercator, geoPath } from "d3-geo";
import type { Feature, Geometry } from "geojson";
import worldGeoJson from "./worldGeoJson.json";
import { normVec, multVec, clampDegrees, addVec } from "./util/vec";
import type { Vec3 } from "./util/types";

const STROKE_WEIGHT = 2;

// eslint-disable-next-line @typescript-eslint/ban-types
const worldGeo = worldGeoJson as unknown as Feature<Geometry, {}>;

const projectionFn = geoMercator;
const rotationVec: Vec3 = normVec([
	Math.random(),
	Math.random(),
	Math.random(),
]);
const initialRotation: Vec3 = [
	clampDegrees(Math.round(Math.random() * 360)),
	clampDegrees(Math.round(Math.random() * 360)),
	clampDegrees(Math.round(Math.random() * 360)),
];

function drawMap(
	canvas: HTMLCanvasElement,
	ctx: CanvasRenderingContext2D,
	speed: number,
) {
	const width = canvas.width;
	const height = canvas.height;

	const projection = projectionFn()
		.rotate(initialRotation)
		.fitSize([width, height], { type: "Sphere" });

	const canvasGeoPathGenerator = geoPath()
		.projection(projection)
		.context(ctx)
		.pointRadius(STROKE_WEIGHT);

	const draw = (rotation: Vec3) => {
		ctx.clearRect(0, 0, width, height);

		projection.rotate(rotation);

		ctx.beginPath();
		ctx.strokeStyle = "black";
		ctx.fillStyle = "transparent";
		canvasGeoPathGenerator(worldGeo);

		ctx.fill();
		ctx.stroke();
		ctx.closePath();
	};

	const rotate = (rotSpeed = 0.01) =>
		animationFrames().pipe(
			map(({ elapsed }) => clampDegrees(elapsed * rotSpeed)),
		);
	const rotation$ = rotate(speed).pipe(
		map((deg) => multVec(rotationVec, deg)),
		map((vec) => addVec(vec, initialRotation)),
		map((vec) => vec.map((component) => clampDegrees(component)) as Vec3),
	);

	rotation$.subscribe((rotation) => {
		draw(rotation);
	});
}

export default drawMap;
