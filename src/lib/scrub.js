/**
 * Scrubbing a number in the code panel: drag it up or down, or focus it and
 * use the arrow keys, and the pose follows - the code is a control, not only
 * a read-out.
 *
 * The number the learner drags is the ENGINE's number, exactly as printed
 * (Unity's x is minus the pitch; Unreal's target is in centimetres). Each id
 * below maps that number back to the tool's own state, so dragging a Unity
 * `x` upwards pitches the nose DOWN, as Unity would. Pure, so the self-check
 * can prove the round trip for every engine.
 *
 * Ids, as code.js prints them:
 *   e0 e1 e2     the three typed Euler numbers
 *   ax0 ax1 ax2  the axis components     ang   the angle
 *   tg0 tg1 tg2  the look-at target       rate  the turn rate
 *   t            the scenario fraction    turn  the basis tab's last turn
 */

import { TURN } from "./code.js";
import {
	displayVec,
	engineAxisAngle,
	engineEuler,
	engineVec,
	normalize3,
	semanticFromEngine,
	unitsPerMetre,
} from "./rotation.js";

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/** How far one arrow-key press moves a value, in the value's own units. */
export function scrubStep(id, engine) {
	if (id.startsWith("ax")) return 0.02;
	if (id.startsWith("tg")) return engine === "unreal" ? 5 : 0.05;
	if (id === "rate") return 0.25;
	if (id === "t") return 0.01;
	return 1; // degrees: e*, ang, turn
}

/** How many pixels of drag make one step. */
export const PIXELS_PER_STEP = 3;

/** The display-frame axis the quaternion tab is using. */
export const axisOf = (axisRaw) =>
	normalize3([axisRaw[0], axisRaw[1], -axisRaw[2]]) ?? [0, 1, 0];

/**
 * The state change that moves engine value `id` by `delta`, in that value's
 * printed units. Returns a partial state, or null for an id it does not own.
 */
export function scrub(state, id, delta) {
	const { engine } = state;
	const index = Number(id.at(-1));

	if (/^e[0-2]$/.test(id)) {
		const typed = engineEuler(engine, state.euler);
		typed[index] += delta;
		return { euler: semanticFromEngine(engine, typed) };
	}
	if (/^ax[0-2]$/.test(id)) {
		const { axis } = engineAxisAngle(
			engine,
			axisOf(state.axisRaw),
			state.angle,
		);
		axis[index] += delta;
		const d = displayVec(engine, axis);
		return { axisRaw: [d[0], d[1], -d[2]].map((c) => clamp(c, -1, 1)) };
	}
	if (id === "ang") {
		// The left-handed engines print the angle negated (rotation.js).
		const sign = engine === "godot" ? 1 : -1;
		return { angle: clamp(state.angle + sign * delta, 0, 720) };
	}
	if (/^tg[0-2]$/.test(id)) {
		const unit = unitsPerMetre(engine);
		const printed = engineVec(engine, state.target).map((c) => c * unit);
		printed[index] += delta;
		const next = displayVec(
			engine,
			printed.map((c) => c / unit),
		).map((c) => clamp(c, -4.5, 4.5));
		return { target: next };
	}
	if (id === "rate") return { turnRate: clamp(state.turnRate + delta, 1, 12) };
	if (id === "t") return { progress: clamp(state.progress + delta, 0, 1) };
	if (id === "turn") {
		// Printed as sign × degrees (Unity's pitch-up is Rotate(right, -15)).
		const sign = engine === "unreal" ? 1 : TURN[engine][state.lastTurn.kind][1];
		return { turnDeg: state.lastTurn.deg + sign * delta };
	}
	return null;
}
