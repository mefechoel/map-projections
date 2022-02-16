import type { Vec3 } from "./types";

export function vecLength([a, b, c]: Vec3): number {
	return Math.sqrt(a * a + b * b + c * c);
}
export function multVec([a, b, c]: Vec3, factor: number): Vec3 {
	const f = factor;
	return [a * f, b * f, c * f];
}
export function normVec(vec: Vec3): Vec3 {
	const l = vecLength(vec);
	const factor = 1 / l;
	return multVec(vec, factor);
}
export function addVec([a0, b0, c0]: Vec3, [a1, b1, c1]: Vec3): Vec3 {
	return [a0 + a1, b0 + b1, c0 + c1];
}

export function clampDegrees(deg: number): number {
	return deg % 360;
}
