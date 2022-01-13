import type { Observable } from "rxjs";
import { animationFrames, fromEvent, map, merge, of, scan } from "rxjs";
import { geoMercator, geoPath } from "d3-geo";
// import world from "world-atlas/countries-110m.json";
import world from "sane-topojson/dist/world_110m.json";
import { feature } from "topojson-client";
import { simplify, presimplify } from "topojson-simplify";
import type { Objects, Topology } from "topojson-specification";
import { downloadString } from "./helpers";

type Vec3 = [number, number, number];

const $ = document.querySelector.bind(document);
const ACCURACY = 0;
const projectionFn = geoMercator;
const rotationVector: Vec3 = [0, 0, 0];

async function main() {
	const svgElem: SVGSVGElement | null = $("#svg");
	let svgStr = "";
	const canvas: HTMLCanvasElement | null = $("canvas");
	const downloadButton: HTMLButtonElement | null = $("#download");
	const svgWrapper: HTMLDivElement | null = $("#svg-wrapper");
	const ctx = canvas?.getContext("2d");
	if (!canvas || !ctx || !svgElem || !svgWrapper) {
		throw new Error("Could not find canvas or svg");
	}

	const width = window.innerWidth;
	const height = window.innerHeight;
	canvas.width = width;
	canvas.height = height;
	const canvasWidth = canvas.width;
	const canvasHeight = canvas.height;

	svgElem.setAttribute("width", width + "");
	svgElem.setAttribute("height", height + "");
	svgElem.setAttribute("viewbox", `0 0 ${width} ${height}`);
	svgElem.style.setProperty("display", "none");

	console.log(downloadButton);

	downloadButton?.addEventListener("click", () =>
		downloadString(svgStr, "image/svg+xml", "map.svg"),
	);

	const projection = projectionFn()
		.rotate(rotationVector)
		.fitSize([canvasWidth, canvasHeight], {
			type: "Sphere",
		});

	const canvasGeoPathGenerator = geoPath()
		.projection(projection)
		.context(ctx)
		.pointRadius(1.5);
	const svgGeoPathGenerator = geoPath().projection(projection).pointRadius(1.5);

	// eslint-disable-next-line @typescript-eslint/ban-types
	const topologyJson = world as unknown as Topology<Objects<{}>>;

	// const country
	function filterCountry(code: string) {
		(topologyJson.objects.countries as any).geometries = (
			topologyJson.objects.countries as any
		).geometries.filter((g: { id: string }) => g.id === code);
	}
	filterCountry("RUS");

	let topology = presimplify(topologyJson);
	topology = simplify(topology, ACCURACY);
	// console.log(topologyJson);

	const worldGeoJson = feature(topology, topology.objects.countries);

	const draw = (rotation = rotationVector, scale = 1) => {
		const width = window.innerWidth;
		const height = window.innerHeight;
		// canvas.width = width;
		// canvas.height = height;

		ctx.clearRect(0, 0, width, height);

		projection.rotate(rotation);
		projection.scale(scale);
		// projection.fitSize([width, height], {
		// 	type: "Sphere",
		// });

		ctx.beginPath();
		ctx.strokeStyle = "hotpink";
		ctx.fillStyle = "#7a6";
		ctx.fillStyle = "transparent";
		canvasGeoPathGenerator(worldGeoJson);
		const svg = svgGeoPathGenerator(worldGeoJson);
		const geometry = `
			<g class="countries">
				<path
					id="svg-path"
					d="${svg}"
					class="svg-path"
					fill="transparent"
					stroke="hotpink"
					strokeWidth="1.5"
				/>
			</g>`;
		svgStr = `
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="${width}"
				height="${height}"
				viewBox="0 0 ${width} ${height}"
			>
				${geometry}
			</svg>
		`;
		svgWrapper.innerHTML = svgStr;
		const path = $("#svg-path") as SVGPathElement;
		const bbox = path.getBBox();
		const centerX = (width - bbox.width) * 0.5;
		const centerY = (height - bbox.height) * 0.5;
		const deltaX = centerX - bbox.x;
		const deltaY = centerY - bbox.y;
		const size = width * height;
		const boxSize = bbox.width * bbox.height;
		const aspectRatio = bbox.width / bbox.height;
		const targetRatio = 0.8;
		const sizeRatio = (targetRatio * boxSize) / size;
		const targetWidth = targetRatio * width;
		const targetHeight = targetRatio * height;
		const targetSize = targetWidth * targetHeight;
		const scaleRatio = 1; // boxSize / targetSize;
		path.style.setProperty(
			"transform",
			`scale(${scaleRatio}) translate(${deltaX}px, ${deltaY}px)`,
		);
		// console.log(scaleRatio);

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
	const rot$ = animationFrames().pipe(
		map(({ elapsed }) => (elapsed * 0.05) % 360),
	);
	const initialState = {
		x: getValue(sliderX),
		y: getValue(sliderY),
		z: getValue(sliderZ),
		scale: getValue(sliderScale),
	};
	const x$ = fromSlider(sliderX).pipe(map(toDeg));
	const y$ = rot$; // fromSlider(sliderY).pipe(map(toDeg));
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
