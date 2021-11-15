import { fromEvent, map, Observable, merge, of, scan } from "rxjs";
import { geoMercator, geoPath } from "d3-geo";
import world from "world-atlas/countries-110m.json";
import { feature } from "topojson-client";
import { simplify, presimplify } from "topojson-simplify";
import { Objects, Topology } from "topojson-specification";

type Vec3 = [number, number, number];

const $ = document.querySelector.bind(document);
const ACCURACY = 0.2;
const projectionFn = geoMercator;
const rotationVector: Vec3 = [0, 0, 0];

async function main() {
	const canvas: HTMLCanvasElement | null = $("canvas");
	const ctx = canvas?.getContext("2d");
	if (!canvas || !ctx) return;
	const canvasWidth = canvas.width;
	const canvasHeight = canvas.height;

	const projection = projectionFn()
		.rotate(rotationVector)
		.fitSize([canvasWidth, canvasHeight], {
			type: "Sphere",
		});

	const geoPathGenerator = geoPath()
		.projection(projection)
		.context(ctx)
		.pointRadius(1.5);

	// eslint-disable-next-line @typescript-eslint/ban-types
	const topologyJson = world as unknown as Topology<Objects<{}>>;
	let topology = presimplify(topologyJson);
	topology = simplify(topology, ACCURACY);
	const worldGeoJson = feature(topology, topology.objects.land);

	const draw = (rotation = rotationVector, scale = 1) => {
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);

		projection.rotate(rotation);
		projection.scale(scale);

		ctx.beginPath();
		ctx.strokeStyle = "deeppink";
		ctx.fillStyle = "#7a6";
		geoPathGenerator(worldGeoJson);
		ctx.fill();
		ctx.stroke();
		ctx.closePath();
	};

	const sliderX = $("#slider-x") as HTMLInputElement;
	const sliderY = $("#slider-y") as HTMLInputElement;
	const sliderZ = $("#slider-z") as HTMLInputElement;
	const sliderScale = $("#slider-scale") as HTMLInputElement;

	const getValue = (elem: HTMLInputElement | undefined | null) =>
		Number(elem?.value) || 0;
	const extractPosition = (e: Event) => getValue(e.target as HTMLInputElement);
	const toDeg = (position: number) => position * 360;
	const toScale = (position: number) => position * 400 + 115;
	const name = <Name extends string, T>(
		o: Observable<T>,
		n: Name,
	): Observable<[Name, T]> => o.pipe(map((v) => [n, v]));

	const fromSlider = (slider: HTMLInputElement) =>
		merge(
			of(getValue(slider)),
			fromEvent(slider, "input").pipe(map(extractPosition)),
		);

	const initialState = {
		x: getValue(sliderX),
		y: getValue(sliderY),
		z: getValue(sliderZ),
		scale: getValue(sliderScale),
	};
	const x$ = fromSlider(sliderX).pipe(map(toDeg));
	const y$ = fromSlider(sliderY).pipe(map(toDeg));
	const z$ = fromSlider(sliderZ).pipe(map(toDeg));
	const scale$ = fromSlider(sliderScale).pipe(map(toScale));

	merge(name(x$, "x"), name(y$, "y"), name(z$, "z"), name(scale$, "scale"))
		.pipe(
			scan(
				(state, [name, value]) => ({ ...state, [name]: value }),
				initialState,
			),
			map(({ x, y, z, scale }) => ({ rotation: [x, y, z] as Vec3, scale })),
		)
		.subscribe(({ rotation, scale }) => {
			draw(rotation, scale);
		});
}

main();

export {};
