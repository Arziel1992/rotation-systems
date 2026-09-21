/**
 * Rotation maths — pure functions, no DOM, no three.js.
 *
 * ONE FRAME INSIDE, THREE ENGINES OUTSIDE. Every orientation in this tool is
 * held as a quaternion [x, y, z, w] in the DISPLAY frame: right-handed, +X
 * right, +Y up, forward -Z. That is three.js's frame and Godot's frame.
 * Unity and Unreal numbers are produced from it by the `engine*` functions at
 * the bottom, and `rotation.selftest.js` checks those against each engine's
 * own documented composition formula, so a sign slip here cannot hide.
 *
 * The learner-facing angles are SEMANTIC, the way a pilot says them:
 *   yaw   + turns the nose RIGHT
 *   pitch + lifts the nose UP
 *   roll  + drops the RIGHT wing
 * All three engines apply them in the same order - yaw, then pitch about the
 * new right axis, then roll about the new forward axis - and differ only in
 * axis names and signs. That difference is the lesson, so it is computed, not
 * hard-coded into the code samples.
 */

export const DEG = Math.PI / 180;
export const IDENTITY = Object.freeze([0, 0, 0, 1]);

const X = [1, 0, 0];
const Y = [0, 1, 0];
const Z = [0, 0, 1];

/* ----------------------------------------------------------------- vectors */

export const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const len3 = (a) => Math.hypot(a[0], a[1], a[2]);
export const scale3 = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
export const add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const cross = (a, b) => [
	a[1] * b[2] - a[2] * b[1],
	a[2] * b[0] - a[0] * b[2],
	a[0] * b[1] - a[1] * b[0],
];

/** Unit vector, or null for a zero vector - which has no direction to give. */
export function normalize3(a) {
	const n = len3(a);
	return n < 1e-9 ? null : scale3(a, 1 / n);
}

/** Angle between two vectors, in degrees. */
export function angleBetween3(a, b) {
	const na = normalize3(a);
	const nb = normalize3(b);
	if (!na || !nb) return 0;
	return Math.acos(Math.min(1, Math.max(-1, dot3(na, nb)))) / DEG;
}

/* ------------------------------------------------------------- quaternions */

export function fromAxisAngle(axis, rad) {
	const a = normalize3(axis) ?? Y;
	const s = Math.sin(rad / 2);
	return [a[0] * s, a[1] * s, a[2] * s, Math.cos(rad / 2)];
}

/** Hamilton product a * b: apply b first, then a. */
export function mul(a, b) {
	const [ax, ay, az, aw] = a;
	const [bx, by, bz, bw] = b;
	return [
		aw * bx + ax * bw + ay * bz - az * by,
		aw * by - ax * bz + ay * bw + az * bx,
		aw * bz + ax * by - ay * bx + az * bw,
		aw * bw - ax * bx - ay * by - az * bz,
	];
}

export const conj = (q) => [-q[0], -q[1], -q[2], q[3]];
export const neg = (q) => [-q[0], -q[1], -q[2], -q[3]];
export const dot4 = (a, b) =>
	a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
export const length4 = (q) => Math.hypot(q[0], q[1], q[2], q[3]);

export function normalize(q) {
	const n = length4(q);
	return n < 1e-12 ? [...IDENTITY] : q.map((c) => c / n);
}

/**
 * The sandwich product q v q*, written out in full rather than with the
 * unit-quaternion shortcut. For a unit q it is a rotation; for any other q it
 * also scales by |q|², which is exactly what the "not normalised" scenario
 * shows - so the shortcut would hide the thing being taught.
 */
export function rotate(q, v) {
	const r = mul(mul(q, [v[0], v[1], v[2], 0]), conj(q));
	return [r[0], r[1], r[2]];
}

/** Columns of the matrix: where +X, +Y and +Z end up. */
export function toBasis(q) {
	return [rotate(q, X), rotate(q, Y), rotate(q, Z)];
}

/** Rotation matrix (as three columns) to quaternion, Shepperd's method. */
export function fromBasis([c0, c1, c2]) {
	const [m00, m10, m20] = c0;
	const [m01, m11, m21] = c1;
	const [m02, m12, m22] = c2;
	const trace = m00 + m11 + m22;
	let q;
	if (trace > 0) {
		const s = 0.5 / Math.sqrt(trace + 1);
		q = [(m21 - m12) * s, (m02 - m20) * s, (m10 - m01) * s, 0.25 / s];
	} else if (m00 > m11 && m00 > m22) {
		const s = 2 * Math.sqrt(1 + m00 - m11 - m22);
		q = [0.25 * s, (m01 + m10) / s, (m02 + m20) / s, (m21 - m12) / s];
	} else if (m11 > m22) {
		const s = 2 * Math.sqrt(1 + m11 - m00 - m22);
		q = [(m01 + m10) / s, 0.25 * s, (m12 + m21) / s, (m02 - m20) / s];
	} else {
		const s = 2 * Math.sqrt(1 + m22 - m00 - m11);
		q = [(m02 + m20) / s, (m12 + m21) / s, 0.25 * s, (m10 - m01) / s];
	}
	return normalize(q);
}

/** The object's own axes in the display frame. Forward is -Z. */
export function axesOf(q) {
	const [right, up, back] = toBasis(q);
	return { right, up, forward: scale3(back, -1) };
}

/** Axis and angle (degrees, 0..360) of a quaternion. */
export function toAxisAngle(q) {
	const u = normalize(q);
	const w = Math.min(1, Math.max(-1, u[3]));
	const angle = (2 * Math.acos(w)) / DEG;
	const axis = normalize3([u[0], u[1], u[2]]) ?? [...Y];
	return { axis, angle };
}

/**
 * How far apart two ORIENTATIONS are, in degrees (0..180). Uses |dot| because
 * q and -q are the same orientation - without it, a 360° quaternion would
 * report itself as far from the identity it looks identical to.
 */
export function orientationAngle(a, b) {
	const d = Math.min(1, Math.abs(dot4(normalize(a), normalize(b))));
	return (2 * Math.acos(d)) / DEG;
}

export const sameOrientation = (a, b, tolDeg = 1e-3) =>
	orientationAngle(a, b) < tolDeg;

/**
 * Spherical interpolation. `shortest` flips b when the two are more than a
 * hemisphere apart, which is what every engine's default Slerp does. With it
 * off this is Godot's `slerpni` and Unreal's `SlerpFullPath`: the numbers are
 * followed faithfully and the object can take the long way round.
 */
export function slerp(a, b, t, shortest = true) {
	let target = b;
	let cos = dot4(a, b);
	if (shortest && cos < 0) {
		target = neg(b);
		cos = -cos;
	}
	if (cos > 0.9995) {
		return normalize(a.map((c, i) => c + (target[i] - c) * t));
	}
	const theta = Math.acos(Math.min(1, Math.max(-1, cos)));
	const s = Math.sin(theta);
	const wa = Math.sin((1 - t) * theta) / s;
	const wb = Math.sin(t * theta) / s;
	return a.map((c, i) => c * wa + target[i] * wb);
}

/** Turn from `from` towards `to` by at most `maxDeg` - Unity's RotateTowards. */
export function rotateTowards(from, to, maxDeg) {
	const angle = orientationAngle(from, to);
	if (angle <= maxDeg || angle < 1e-6) return [...to];
	return slerp(from, to, maxDeg / angle);
}

/* ------------------------------------------------------------ Euler angles */

const wrap180 = (d) => {
	const r = ((((d + 180) % 360) + 360) % 360) - 180;
	return r === -180 ? 180 : r;
};
const wrap360 = (d) => ((d % 360) + 360) % 360;
const clean = (d) => (Math.abs(d) < 1e-9 ? 0 : d);

/** Semantic yaw/pitch/roll (degrees) to a display-frame quaternion. */
export function fromEuler({ yaw, pitch, roll }) {
	return mul(
		mul(fromAxisAngle(Y, -yaw * DEG), fromAxisAngle(X, pitch * DEG)),
		fromAxisAngle(Z, -roll * DEG),
	);
}

/**
 * Change a turn already applied to q from delta `from` to delta `to` (both
 * semantic Euler), about the object's own axes (`local`) or the world's: undo
 * the old delta, apply the new one. What dragging the basis tab's code does.
 */
export function retuneTurn(q, from, to, local) {
	const undo = conj(fromEuler(from));
	const redo = fromEuler(to);
	return local ? mul(mul(q, undo), redo) : mul(mul(redo, undo), q);
}

/**
 * Display-frame quaternion back to semantic yaw/pitch/roll, pitch in
 * [-90, 90] - the same branch every engine's read-back uses.
 *
 * At exactly ±90° pitch, yaw and roll turn about one axis and only their
 * difference is defined. Roll is then reported as 0 and everything goes into
 * yaw. That is not a rounding choice, it is gimbal lock: the information to
 * split them is gone.
 */
export function toEuler(q) {
	const [c0, c1, c2] = toBasis(normalize(q));
	const m12 = c2[1];
	const pitch = Math.asin(Math.min(1, Math.max(-1, -m12)));
	let a;
	let c;
	if (Math.abs(m12) < 0.999999) {
		a = Math.atan2(c2[0], c2[2]);
		c = Math.atan2(c0[1], c1[1]);
	} else {
		a = Math.atan2(-c0[2], c0[0]);
		c = 0;
	}
	return {
		yaw: clean(wrap180(-a / DEG)),
		pitch: clean(pitch / DEG),
		roll: clean(wrap180(-c / DEG)),
	};
}

/** Degrees of freedom still independent: the angle between yaw and roll axes. */
export const freedomLeft = (pitch) => 90 - Math.min(90, Math.abs(pitch));

/** Component-wise interpolation of three numbers - the thing not to do. */
export const lerpEuler = (a, b, t) => ({
	yaw: a.yaw + (b.yaw - a.yaw) * t,
	pitch: a.pitch + (b.pitch - a.pitch) * t,
	roll: a.roll + (b.roll - a.roll) * t,
});

/* ----------------------------------------------------------------- look-at */

/**
 * The orientation whose forward points along `dir` and whose up is as close
 * to `up` as it can be. Returns null when `dir` is zero, or parallel to `up` -
 * the two cases every engine's look-at is undefined for.
 */
export function lookRotation(dir, up = Y) {
	const f = normalize3(dir);
	if (!f) return null;
	const back = scale3(f, -1);
	const right = normalize3(cross(up, back));
	if (!right) return null;
	return fromBasis([right, cross(back, right), back]);
}

/** Angle between the look direction and the up hint, in degrees (0..180). */
export const upHintAngle = (dir, up = Y) => angleBetween3(dir, up);

/* ------------------------------------------------------------------- basis */

/** Gram-Schmidt, in the order Godot's `Basis.orthonormalized()` uses. */
export function orthonormalize([c0, c1, c2]) {
	const x = normalize3(c0) ?? [...X];
	const y = normalize3(sub3(c1, scale3(x, dot3(x, c1)))) ?? [...Y];
	const z =
		normalize3(
			sub3(sub3(c2, scale3(x, dot3(x, c2))), scale3(y, dot3(y, c2))),
		) ?? cross(x, y);
	return [x, y, z];
}

/**
 * One frame of spinning a basis about its own up column, plus a rounding
 * error. The error is deterministic and EXAGGERATED - real float32 drift takes
 * minutes to show - and the UI says so. It shears and stretches the columns,
 * which is what accumulated drift actually does to a basis.
 */
export function driftStep([c0, c1, c2], rad, error) {
	const spin = fromAxisAngle(c1, rad);
	const r0 = rotate(spin, c0);
	const r1 = c1;
	const r2 = rotate(spin, c2);
	return [
		add3(scale3(r0, 1 + error), scale3(r2, error * 0.6)),
		add3(r1, scale3(r0, error * 0.4)),
		add3(scale3(r2, 1 - error * 0.3), scale3(r1, error)),
	];
}

/** How far a basis is from a clean rotation: column lengths and angles. */
export function basisHealth([c0, c1, c2]) {
	return {
		lengths: [len3(c0), len3(c1), len3(c2)],
		angles: [
			angleBetween3(c0, c1),
			angleBetween3(c1, c2),
			angleBetween3(c2, c0),
		],
	};
}

/* ------------------------------------------------------------ hypersphere */

/**
 * Stereographic projection of a unit quaternion from the pole at -1.
 * The identity lands at the origin, every 180° turn on the unit sphere
 * (w = 0), and -1 at infinity. Returns null near that pole.
 *
 * A rotation of θ about an axis lands at distance tan(θ/4) along that axis,
 * which is why 360° is not back where it started: it is at infinity, and
 * only 720° returns to the centre.
 */
export function stereographic(q) {
	const [x, y, z, w] = normalize(q);
	const d = 1 + w;
	return d < 1e-6 ? null : [x / d, y / d, z / d];
}

/** Points of a great circle through 1 and a unit imaginary `axis` (w = 0). */
export function greatCircle(a, b, samples = 160) {
	const out = [];
	for (let i = 0; i <= samples; i++) {
		const t = (i / samples) * 2 * Math.PI;
		out.push(a.map((c, k) => c * Math.cos(t) + b[k] * Math.sin(t)));
	}
	return out;
}

/**
 * Inverse of `stereographic`: a point in the projected space back to the unit
 * quaternion it came from. Used when the learner drags q in the 4D view.
 */
export function fromStereographic([px, py, pz]) {
	const r2 = px * px + py * py + pz * pz;
	const k = 2 / (1 + r2);
	return [px * k, py * k, pz * k, (1 - r2) / (1 + r2)];
}

/** q^s: the fraction s of the way from the identity to q, along the short arc. */
export const power = (q, s) => slerp([...IDENTITY], q, s);

/* ---------------------------------------------------------- gimbal rings */

/**
 * The axis each Euler ring turns about, in the display frame, for a pose:
 * yaw about world up, pitch about the right axis after yaw, roll about the
 * forward axis after yaw and pitch. Dragging a ring turns about this axis.
 */
export function ringAxes({ yaw, pitch }) {
	const qYaw = fromAxisAngle(Y, -yaw * DEG);
	const qYawPitch = mul(qYaw, fromAxisAngle(X, pitch * DEG));
	return {
		yaw: [...Y],
		pitch: rotate(qYaw, X),
		roll: rotate(qYawPitch, [0, 0, -1]),
	};
}

/**
 * A drag of `deg` degrees around a ring's axis (right-hand rule) as a change
 * to that ring's semantic angle. Yaw is the odd one out: + yaw turns RIGHT,
 * which is clockwise about world up, so the sign flips.
 */
export const ringToAngle = (kind, deg) => (kind === "yaw" ? -deg : deg);

/** The same for the object's own axes (the basis tab's gizmo rings). */
export const RING_OF_AXIS = { right: "pitch", up: "yaw", forward: "roll" };

/* ------------------------------------------------------------------ engines */

export const ENGINES = ["godot", "unity", "unreal"];

/**
 * Semantic yaw/pitch/roll as each engine wants them typed.
 *   Godot  rotation_degrees = Vector3(x, y, z)   +x nose up, +y turn LEFT, +z bank LEFT
 *   Unity  Quaternion.Euler(x, y, z)             +x nose DOWN, +y turn right, +z bank LEFT
 *   Unreal FRotator(Pitch, Yaw, Roll)             +Pitch up, +Yaw right, +Roll bank right
 */
export function engineEuler(engine, { yaw, pitch, roll }) {
	if (engine === "unity") return [clean(-pitch), clean(yaw), clean(-roll)];
	if (engine === "unreal") return [clean(pitch), clean(yaw), clean(roll)];
	return [clean(pitch), clean(-yaw), clean(-roll)];
}

/** Inverse of engineEuler. */
export function semanticFromEngine(engine, [a, b, c]) {
	if (engine === "unity") return { pitch: -a, yaw: b, roll: -c };
	if (engine === "unreal") return { pitch: a, yaw: b, roll: c };
	return { pitch: a, yaw: -b, roll: -c };
}

/**
 * What the engine hands back when you READ the rotation: the same
 * orientation, decomposed on the engine's own branch. Unity reports 0..360,
 * the other two -180..180. Often not the numbers you typed.
 */
export function readBack(engine, q) {
	const values = engineEuler(engine, toEuler(q));
	return values.map((v) => clean(engine === "unity" ? wrap360(v) : wrap180(v)));
}

/**
 * Quaternion components in each engine's own axes.
 * Unity mirrors Z (left-handed, +Z forward); Unreal relabels to
 * X forward, Y right, Z up (also left-handed). Both maps are rotations of the
 * imaginary part, so products and slerps agree in every frame.
 */
export function engineQuat(engine, [x, y, z, w]) {
	if (engine === "unity") return [clean(-x), clean(-y), clean(z), clean(w)];
	if (engine === "unreal") return [clean(z), clean(-x), clean(-y), clean(w)];
	return [clean(x), clean(y), clean(z), clean(w)];
}

/** A direction or position in each engine's axes (Unreal in metres here). */
export function engineVec(engine, [x, y, z]) {
	if (engine === "unity") return [clean(x), clean(y), clean(-z)];
	if (engine === "unreal") return [clean(-z), clean(x), clean(y)];
	return [clean(x), clean(y), clean(z)];
}

/** Inverse of engineVec: an engine-axes vector drawn in the display frame. */
export function displayVec(engine, [a, b, c]) {
	if (engine === "unity") return [a, b, -c];
	if (engine === "unreal") return [b, c, -a];
	return [a, b, c];
}

/**
 * Which signed engine axis each semantic axis is. Drives the colour (X red,
 * Y green, Z blue in every engine's gizmo) and the text beside it.
 */
export const ENGINE_AXES = {
	godot: { right: "+X", up: "+Y", forward: "−Z" },
	unity: { right: "+X", up: "+Y", forward: "+Z" },
	unreal: { right: "+Y", up: "+Z", forward: "+X" },
};

/**
 * Axis and angle as each engine's constructor wants them. In the two
 * left-handed engines the same turn about the same physical axis is a
 * NEGATIVE angle - handedness decides which way "positive" spins.
 */
export function engineAxisAngle(engine, axis, angle) {
	const a = engineVec(engine, axis);
	return { axis: a, angle: engine === "godot" ? angle : -angle };
}

/** Engine unit for one metre of position. */
export const unitsPerMetre = (engine) => (engine === "unreal" ? 100 : 1);
