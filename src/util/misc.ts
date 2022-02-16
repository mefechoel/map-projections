import type { Point } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function throttle<Fn extends (...args: any[]) => any>(
	callback: Fn,
	limit: number,
): Fn {
	let waiting = false;
	const throttled = ((...args) => {
		if (!waiting) {
			callback(...args);
			waiting = true;
			setTimeout(function () {
				waiting = false;
			}, limit);
		}
	}) as Fn;
	return throttled;
}

export function bench(fn: () => void, label = "", log = false) {
	if (log) {
		// eslint-disable-next-line no-console
		console.log(label, "start");
	}
	const start = performance.now();
	fn();
	if (log) {
		// eslint-disable-next-line no-console
		console.log(label, "took ", performance.now() - start, "ms");
	}
}

export function downloadString(
	text: string,
	fileType: string,
	fileName: string,
) {
	const blob = new Blob([text], { type: fileType });
	const a = document.createElement("a");
	a.download = fileName;
	a.href = URL.createObjectURL(blob);
	a.dataset.downloadurl = [fileType, a.download, a.href].join(":");
	a.style.display = "none";
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	setTimeout(function () {
		URL.revokeObjectURL(a.href);
	}, 1500);
}

export function matchToSize(
	list: Point[],
	{
		sourceWidth,
		sourceHeight,
		targetWidth,
		targetHeight,
	}: {
		sourceWidth: number;
		sourceHeight: number;
		targetWidth: number;
		targetHeight: number;
	},
): Point[] {
	const widthScale = targetWidth / sourceWidth;
	const heightScale = targetHeight / sourceHeight;
	return list.map(({ x, y }) => ({
		x: x * widthScale,
		y: y * heightScale,
	}));
}
