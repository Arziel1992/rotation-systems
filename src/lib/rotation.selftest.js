/**
 * Runnable self-check for the pure logic: rotation.js, code.js and the i18n
 * lookup.
 *
 *   pnpm run selftest            (Node, exits non-zero on failure)
 *   open the tool with ?selftest (browser, prints a console table)
 *
 * No framework and no dependency. VERIFIED IN BOTH DIRECTIONS (global §15):
 * every positive case has a negative control beside it, so a check that
 * passes everything is caught by its own twin.
 *
 * THE REFERENCE IS INDEPENDENT (MISTAKES.md, 2026-09-01). The engine
 * conversions in rotation.js are compared against each engine's OWN
 * composition formula - Unity's Quaternion.Euler order, Godot's YXZ basis,
 * and Unreal's FRotator::Quaternion() transcribed from the engine source -
 * applied in that engine's own axes. The conversions cannot influence them.
 */

import { generate, MARKER, plain, TURN } from "./code.js";
import { highlight } from "./highlight.js";
import { lookupIn, missingIn } from "./i18n/core.js";
import en from "./i18n/en.js";
import es from "./i18n/es.js";
import * as R from "./rotation.js";
import { axisOf, scrub } from "./scrub.js";

const near = (a, b, eps = 1e-6) => Math.abs(a - b) < eps;
const nearVec = (a, b, eps = 1e-6) => a.every((c, i) => near(c, b[i], eps));
const sameQ = (a, b) =>
	Math.abs(R.dot4(R.normalize(a), R.normalize(b))) > 1 - 1e-9;
const qAxis = (axis, deg) => R.fromAxisAngle(axis, deg * R.DEG);

/* Each engine's own formula, in its own axes. */

// Unity: "rotates z degrees around the z axis, x degrees around the x axis,
// and y degrees around the y axis; applied in that order".
const unityEuler = ([x, y, z]) =>
	R.mul(R.mul(qAxis([0, 1, 0], y), qAxis([1, 0, 0], x)), qAxis([0, 0, 1], z));

// Godot: Basis.from_euler(v, EULER_ORDER_YXZ) composes Y * X * Z.
const godotEuler = ([x, y, z]) =>
	R.mul(R.mul(qAxis([0, 1, 0], y), qAxis([1, 0, 0], x)), qAxis([0, 0, 1], z));

// Unreal: FRotator::Quaternion(), UnrealMath.cpp.
function unrealRotator([pitch, yaw, roll]) {
	const h = R.DEG / 2;
	const [SP, CP] = [Math.sin(pitch * h), Math.cos(pitch * h)];
	const [SY, CY] = [Math.sin(yaw * h), Math.cos(yaw * h)];
	const [SR, CR] = [Math.sin(roll * h), Math.cos(roll * h)];
	return [
		CR * SP * SY - SR * CP * CY,
		-CR * SP * CY - SR * CP * SY,
		CR * CP * SY - SR * SP * CY,
		CR * CP * CY + SR * SP * SY,
	];
}

const REFERENCE = {
	unity: unityEuler,
	godot: godotEuler,
	unreal: unrealRotator,
};

// Each engine's own forward, right and up, in its own axes.
const AXES = {
	godot: { forward: [0, 0, -1], right: [1, 0, 0], up: [0, 1, 0] },
	unity: { forward: [0, 0, 1], right: [1, 0, 0], up: [0, 1, 0] },
	unreal: { forward: [1, 0, 0], right: [0, 1, 0], up: [0, 0, 1] },
};

/**
 * Did a JavaScript value leak into a code sample? Every generated number is a
 * ⟦live⟧ value, so each of those must parse as a finite number. Outside them,
 * "undefined" is legitimate English in two look-at warnings, which are removed
 * before looking for a leaked `undefined`, `null`, `NaN` or `Infinity`.
 */
export function leaks(text) {
	const values = [...text.matchAll(MARKER)].map((m) => m[2]);
	if (values.some((v) => !Number.isFinite(Number(v)))) return true;
	const prose = text
		.replaceAll("roll undefined", "")
		.replaceAll("yaw is undefined", "");
	return /undefined|null|NaN|Infinity/.test(prose);
}

const POSES = [
	{ yaw: 35, pitch: 20, roll: 10 },
	{ yaw: -120, pitch: -45, roll: 70 },
	{ yaw: 170, pitch: 60, roll: -150 },
	{ yaw: 5, pitch: -80, roll: 30 },
];

export function run() {
	const results = [];
	const check = (name, pass) => results.push({ name, pass: Boolean(pass) });

	/* --- engine conversions against each engine's own formula --- */
	for (const engine of R.ENGINES) {
		const agree = POSES.every((e) =>
			sameQ(
				REFERENCE[engine](R.engineEuler(engine, e)),
				R.engineQuat(engine, R.fromEuler(e)),
			),
		);
		check(
			`${engine}: typed Euler numbers give the engine's own quaternion`,
			agree,
		);

		// What the numbers MEAN, checked in the engine's own axes.
		const a = AXES[engine];
		const turn = (e, v) =>
			R.rotate(REFERENCE[engine](R.engineEuler(engine, e)), v);
		check(
			`${engine}: +yaw 90 turns forward to RIGHT`,
			nearVec(turn({ yaw: 90, pitch: 0, roll: 0 }, a.forward), a.right),
		);
		check(
			`${engine}: +pitch 90 lifts forward to UP`,
			nearVec(turn({ yaw: 0, pitch: 90, roll: 0 }, a.forward), a.up),
		);
		check(
			`${engine}: +roll 90 drops the right wing DOWN`,
			nearVec(
				turn({ yaw: 0, pitch: 0, roll: 90 }, a.right),
				R.scale3(a.up, -1),
			),
		);
		// Negative control: the opposite yaw must NOT also pass.
		check(
			`${engine}: -yaw 90 does not turn forward to right`,
			!nearVec(turn({ yaw: -90, pitch: 0, roll: 0 }, a.forward), a.right),
		);

		// engineVec and engineQuat must describe the same frame.
		const q = R.fromEuler(POSES[1]);
		check(
			`${engine}: engineVec(forward) == engine quaternion applied to engine forward`,
			nearVec(
				R.engineVec(engine, R.axesOf(q).forward),
				R.rotate(R.engineQuat(engine, q), a.forward),
			),
		);

		// The axis letters the view prints must name the engine's real axes.
		const letter = (s) => {
			const v = [0, 0, 0];
			v["XYZ".indexOf(s.slice(-1))] = s.startsWith("−") ? -1 : 1;
			return v;
		};
		const ident = R.axesOf(R.IDENTITY);
		check(
			`${engine}: the printed axis letters point where the engine's axes do`,
			["right", "up", "forward"].every((k) =>
				nearVec(
					R.displayVec(engine, letter(R.ENGINE_AXES[engine][k])),
					ident[k],
				),
			),
		);
		check(
			`${engine}: displayVec undoes engineVec`,
			nearVec(
				R.displayVec(engine, R.engineVec(engine, [0.2, -0.7, 0.4])),
				[0.2, -0.7, 0.4],
			),
		);

		// Axis-angle, including the left-handed sign flip.
		const axis = R.normalize3([0.3, -0.5, 0.8]);
		const aa = R.engineAxisAngle(engine, axis, 75);
		check(
			`${engine}: axis-angle constructor matches the engine quaternion`,
			sameQ(qAxis(aa.axis, aa.angle), R.engineQuat(engine, qAxis(axis, 75))),
		);
	}

	// Negative control for the whole family: a Unity mapping with the pitch
	// sign NOT flipped must fail against Unity's own formula.
	const e0 = POSES[0];
	check(
		"unity: an unflipped pitch is caught",
		!sameQ(
			unityEuler([e0.pitch, e0.yaw, -e0.roll]),
			R.engineQuat("unity", R.fromEuler(e0)),
		),
	);
	check(
		"unity: an unflipped axis-angle is caught",
		!sameQ(
			qAxis(R.engineVec("unity", [0, 0.6, 0.8]), 75),
			R.engineQuat("unity", qAxis([0, 0.6, 0.8], 75)),
		),
	);

	/* --- Euler round trip and read-back --- */
	const trips = POSES.every((e) => {
		const back = R.toEuler(R.fromEuler(e));
		return (
			near(back.yaw, e.yaw, 1e-6) &&
			near(back.pitch, e.pitch, 1e-6) &&
			near(back.roll, e.roll, 1e-6)
		);
	});
	check("Euler: decompose(compose(e)) returns e away from the lock", trips);
	check(
		"Euler: Unity reads back pitch-up 20 as x = 340",
		near(
			R.readBack("unity", R.fromEuler({ yaw: 0, pitch: 20, roll: 0 }))[0],
			340,
		),
	);
	const over = R.toEuler(R.fromEuler({ yaw: 0, pitch: 120, roll: 0 }));
	check(
		"Euler: pitch 120 reads back as a DIFFERENT triple, same orientation",
		near(over.pitch, 60) &&
			near(Math.abs(over.yaw), 180) &&
			sameQ(R.fromEuler(over), R.fromEuler({ yaw: 0, pitch: 120, roll: 0 })),
	);

	/* --- gimbal lock, both directions --- */
	const lockA = R.fromEuler({ yaw: 30, pitch: 90, roll: 0 });
	const lockB = R.fromEuler({ yaw: 0, pitch: 90, roll: -30 });
	const lockC = R.fromEuler({ yaw: 40, pitch: 90, roll: 10 });
	check(
		"gimbal: at pitch 90, yaw and roll do the same job",
		sameQ(lockA, lockB) && sameQ(lockA, lockC),
	);
	check(
		"gimbal: at pitch 0 they do not (negative control)",
		!sameQ(
			R.fromEuler({ yaw: 30, pitch: 0, roll: 0 }),
			R.fromEuler({ yaw: 0, pitch: 0, roll: -30 }),
		),
	);
	const locked = R.toEuler(lockC);
	check(
		"gimbal: decomposing at the lock returns roll 0 and the same orientation",
		near(locked.roll, 0) && sameQ(R.fromEuler(locked), lockC),
	);
	check(
		"gimbal: freedom left is 90 - |pitch|",
		near(R.freedomLeft(60), 30) && near(R.freedomLeft(-95), 0),
	);

	/* --- slerp, both directions --- */
	const far = qAxis([0, 1, 0], 270); // w < 0: the short way is 90° the other way
	check(
		"slerp: shortest path halfway is 45°",
		near(
			R.orientationAngle(R.IDENTITY, R.slerp([...R.IDENTITY], far, 0.5)),
			45,
			1e-6,
		),
	);
	check(
		"slerp: full path halfway is 135° (the long way)",
		near(
			R.orientationAngle(R.IDENTITY, R.slerp([...R.IDENTITY], far, 0.5, false)),
			135,
			1e-6,
		),
	);
	const close = qAxis([0, 1, 0], 60);
	check(
		"slerp: when the dot is positive both agree (negative control)",
		sameQ(
			R.slerp([...R.IDENTITY], close, 0.5),
			R.slerp([...R.IDENTITY], close, 0.5, false),
		),
	);
	check(
		"q and -q are the same orientation",
		R.sameOrientation(far, R.neg(far)),
	);
	check(
		"q and a genuinely different q are not (negative control)",
		!R.sameOrientation(far, close),
	);

	/* --- stereographic projection --- */
	check(
		"4D: the identity projects to the origin",
		nearVec(R.stereographic(R.IDENTITY), [0, 0, 0]),
	);
	check(
		"4D: every 180° turn lands on the unit sphere",
		near(R.len3(R.stereographic(qAxis([1, 2, 3], 180))), 1),
	);
	check(
		"4D: a θ turn lands at tan(θ/4)",
		near(R.len3(R.stereographic(qAxis([0, 0, 1], 90))), Math.tan(22.5 * R.DEG)),
	);
	check(
		"4D: 360° is at infinity, not back at the start",
		R.stereographic(qAxis([0, 1, 0], 360)) === null,
	);
	check(
		"4D: 720° is back at the start",
		nearVec(R.stereographic(qAxis([0, 1, 0], 720)), [0, 0, 0]),
	);

	/* --- look-at --- */
	const look = R.lookRotation([1, 0, 0]);
	check(
		"look-at: forward points at the target",
		nearVec(R.axesOf(look).forward, [1, 0, 0]),
	);
	check(
		"look-at: up stays up when it can",
		nearVec(R.axesOf(look).up, [0, 1, 0]),
	);
	check(
		"look-at: straight ahead is the identity",
		sameQ(R.lookRotation([0, 0, -1]), R.IDENTITY),
	);
	check(
		"look-at: a target straight up is undefined",
		R.lookRotation([0, 1, 0]) === null,
	);
	check(
		"look-at: a target on top of you is undefined",
		R.lookRotation([0, 0, 0]) === null,
	);
	check(
		"look-at: nearly straight up is still defined (negative control)",
		R.lookRotation([0.02, 1, 0]) !== null,
	);

	/* --- basis drift --- */
	const skewed = [
		[1.2, 0.1, 0],
		[0.2, 0.9, 0.1],
		[0, 0.3, 1.1],
	];
	const clean = R.basisHealth(R.orthonormalize(skewed));
	check(
		"basis: orthonormalize gives lengths 1 and corners 90°",
		clean.lengths.every((l) => near(l, 1)) &&
			clean.angles.every((a) => near(a, 90, 1e-6)),
	);
	const unit = R.toBasis(R.fromEuler(POSES[0]));
	check(
		"basis: a clean basis is left unchanged",
		R.orthonormalize(unit).every((c, i) => nearVec(c, unit[i])),
	);
	let dirty = unit;
	let kept = unit;
	for (let i = 0; i < 120; i++) {
		dirty = R.driftStep(dirty, 0.02, 0.002);
		kept = R.orthonormalize(R.driftStep(kept, 0.02, 0.002));
	}
	const dirtyHealth = R.basisHealth(dirty);
	const keptHealth = R.basisHealth(kept);
	check(
		"basis: drift really does skew the basis",
		dirtyHealth.lengths.some((l) => Math.abs(l - 1) > 0.01),
	);
	check(
		"basis: orthonormalising each frame keeps it clean",
		keptHealth.lengths.every((l) => near(l, 1, 1e-9)) &&
			keptHealth.angles.every((a) => near(a, 90, 1e-6)),
	);

	/* --- the turn buttons' engine code turns the way its words say --- */
	for (const engine of ["godot", "unity"]) {
		const a = AXES[engine];
		const apply = (kind, deg, v) => {
			const [name, sign] = TURN[engine][kind];
			const axis = {
				"Vector3.RIGHT": [1, 0, 0],
				"Vector3.UP": [0, 1, 0],
				"Vector3.FORWARD": [0, 0, -1],
				"Vector3.right": [1, 0, 0],
				"Vector3.up": [0, 1, 0],
				"Vector3.forward": [0, 0, 1],
			}[name];
			return R.rotate(qAxis(axis, sign * deg), v);
		};
		check(
			`${engine}: 'pitch up' code lifts the nose`,
			R.dot3(apply("pitch", 20, a.forward), a.up) > 0.3,
		);
		check(
			`${engine}: 'turn right' code turns right`,
			R.dot3(apply("yaw", 20, a.forward), a.right) > 0.3,
		);
		check(
			`${engine}: 'bank right' code drops the right wing`,
			R.dot3(apply("roll", 20, a.right), a.up) < -0.3,
		);
		check(
			`${engine}: 'pitch up' with the sign flipped would dip it (negative control)`,
			R.dot3(apply("pitch", -20, a.forward), a.up) < -0.3,
		);
	}

	/* --- code generation --- */
	const base = {
		engine: "unity",
		method: "euler",
		scenario: null,
		euler: { yaw: 35, pitch: 20, roll: 10 },
		clamp: true,
		q: R.fromEuler({ yaw: 35, pitch: 20, roll: 10 }),
		axis: [0, 1, 0],
		angle: 120,
		slerpA: [...R.IDENTITY],
		slerpB: far,
		t: 0.4,
		longway: { t: 0.4, from: 350, to: 10 },
		lastTurn: { kind: "yaw", deg: 15, space: "local" },
		cols: dirty,
		orthonormalize: false,
		fireOwn: true,
		target: [2, 1, -3],
		smooth: true,
		turnRate: 5,
	};
	const scenarios = {
		euler: [null, "gimbal", "longway"],
		quat: [null, "apply", "slerp", "fullpath", "unnormalised", "negate"],
		basis: [null, "drift", "worldconst"],
		lookat: [null, "overhead"],
	};
	// The detector is tested before it is trusted: it must flag a leaked JS
	// value AND pass the look-at warnings, which say "undefined" in English.
	// The first version flagged those warnings (MISTAKES.md, 2026-09-21).
	check(
		"code: the leak detector flags a leaked value",
		leaks("Vector3(undefined, ⟦1.0⟧)") && leaks("x = ⟦NaN⟧"),
	);
	check(
		"code: the leak detector passes English prose (negative control)",
		!leaks(
			"// ✗ toTarget ∥ Vector3.up leaves the roll undefined, so it flips ⟦2.0⟧",
		),
	);
	const bad = [];
	for (const engine of R.ENGINES) {
		for (const [method, list] of Object.entries(scenarios)) {
			for (const scenario of list) {
				const text = generate({ ...base, engine, method, scenario });
				if (leaks(text) || text.length < 40)
					bad.push(`${engine}/${method}/${scenario}`);
			}
		}
	}
	check(
		`code: every method x engine x scenario renders cleanly${bad.length ? ` (bad: ${bad.join(", ")})` : ""}`,
		bad.length === 0,
	);
	check(
		"code: Unity types pitch-up 20 as x = -20",
		generate(base).includes("_x = ⟦e0|-20.0⟧f"),
	);
	check(
		"code: Godot types the same pose as x = +20",
		generate({ ...base, engine: "godot" }).includes(
			"Vector3(⟦e0|20.0⟧, ⟦e1|-35.0⟧, ⟦e2|-10.0⟧)",
		),
	);
	check(
		"code: Unreal types it by name",
		generate({ ...base, engine: "unreal" }).includes(
			"Angles(⟦e0|20.0⟧f, ⟦e1|35.0⟧f, ⟦e2|10.0⟧f)",
		),
	);

	/* --- comments are comments, code values are code --- */
	const godotLines = highlight(
		generate({ ...base, engine: "godot" }),
		"gdscript",
	);
	const liveInComments = godotLines
		.flat()
		.filter((tk) => tk.cls === "com" && /⟦/.test(tk.text));
	const poseLine = godotLines.find((l) =>
		l.some((tk) => tk.cls === "com" && tk.text.includes("Pose:")),
	);
	check(
		"code: a value inside a comment renders as comment text, not as a live value",
		liveInComments.length === 0 &&
			poseLine &&
			!poseLine.some((tk) => tk.cls === "live"),
	);
	const typedLine = godotLines.find((l) =>
		l.some((tk) => tk.text === "Vector3"),
	);
	check(
		"code: a value in code IS live and carries its drag id (negative control)",
		typedLine
			?.filter((tk) => tk.cls === "live")
			.map((tk) => tk.id)
			.join() === "e0,e1,e2",
	);
	check(
		"code: plain() strips markers and ids for copying",
		plain("x = ⟦e0|-20.0⟧f; // ⟦0.5⟧") === "x = -20.0f; // 0.5",
	);

	/* --- scrubbing a printed engine number moves that number, and only it --- */
	const scrubState = {
		...base,
		axisRaw: [1, 1, 1],
		angle: 120,
		turnRate: 4,
		progress: 0.3,
		target: [2, 1, -3],
	};
	for (const engine of R.ENGINES) {
		const st = { ...scrubState, engine };
		const before = R.engineEuler(engine, st.euler);
		const moved = [0, 1, 2].every((i) => {
			const after = R.engineEuler(engine, scrub(st, `e${i}`, 7).euler);
			return after.every((v, k) =>
				near(v, before[k] + (k === i ? 7 : 0), 1e-9),
			);
		});
		check(
			`${engine}: dragging a typed Euler number moves exactly that number`,
			moved,
		);

		const ang0 = R.engineAxisAngle(engine, axisOf(st.axisRaw), st.angle).angle;
		const ang1 = R.engineAxisAngle(
			engine,
			axisOf(st.axisRaw),
			scrub(st, "ang", 5).angle,
		).angle;
		check(
			`${engine}: dragging the printed angle up moves it up`,
			near(ang1, ang0 + 5, 1e-9),
		);

		const unit = R.unitsPerMetre(engine);
		const tgBefore = R.engineVec(engine, st.target).map((c) => c * unit);
		const tgAfter = R.engineVec(
			engine,
			scrub(st, "tg1", (10 * unit) / 100).target,
		).map((c) => c * unit);
		check(
			`${engine}: dragging the printed target Y moves only Y`,
			tgAfter.every((v, k) =>
				near(v, tgBefore[k] + (k === 1 ? (10 * unit) / 100 : 0), 1e-9),
			),
		);

		const axBefore = R.engineAxisAngle(
			engine,
			axisOf(st.axisRaw),
			st.angle,
		).axis;
		const axUp = R.engineAxisAngle(
			engine,
			axisOf(scrub(st, "ax0", 0.2).axisRaw),
			st.angle,
		).axis;
		const axDown = R.engineAxisAngle(
			engine,
			axisOf(scrub(st, "ax0", -0.2).axisRaw),
			st.angle,
		).axis;
		check(
			`${engine}: dragging the printed axis x up raises it, down lowers it`,
			axUp[0] > axBefore[0] + 1e-6 && axDown[0] < axBefore[0] - 1e-6,
		);
	}
	for (const [engine, kind] of [
		["unity", "pitch"],
		["godot", "yaw"],
		["unreal", "roll"],
	]) {
		const st = {
			...scrubState,
			engine,
			lastTurn: { kind, deg: 15, space: "local" },
		};
		const next = {
			...st,
			lastTurn: { ...st.lastTurn, deg: scrub(st, "turn", 4).turnDeg },
		};
		const printedTurn = (s) =>
			[
				...generate({ ...s, method: "basis", scenario: null }).matchAll(MARKER),
			].find((m) => m[1] === "turn")[2];
		check(
			`${engine}: dragging the printed turn by +4 prints 4 more (${kind})`,
			near(Number(printedTurn(next)), Number(printedTurn(st)) + 4, 1e-9),
		);
	}
	check(
		"scrub: the fraction stays inside 0..1",
		scrub(scrubState, "t", 5).progress === 1 &&
			scrub(scrubState, "t", -5).progress === 0,
	);
	check(
		"scrub: an id it does not own changes nothing (negative control)",
		scrub(scrubState, "nope", 1) === null,
	);

	/* --- dragging a gimbal ring turns about that ring's own axis --- */
	const ringPose = { yaw: 35, pitch: 20, roll: 10 };
	const axesNow = R.ringAxes(ringPose);
	const ringOk = ["yaw", "pitch", "roll"].every((kind) => {
		const next = {
			...ringPose,
			[kind]: ringPose[kind] + R.ringToAngle(kind, 12),
		};
		return sameQ(
			R.fromEuler(next),
			R.mul(qAxis(axesNow[kind], 12), R.fromEuler(ringPose)),
		);
	});
	check(
		"rings: a 12° drag about each ring's axis is that ring's angle changing",
		ringOk,
	);
	check(
		"rings: the yaw sign flip is needed (negative control)",
		!sameQ(
			R.fromEuler({ ...ringPose, yaw: ringPose.yaw + 12 }),
			R.mul(qAxis(axesNow.yaw, 12), R.fromEuler(ringPose)),
		),
	);

	/* --- dragging q in the 4D view --- */
	const back4 = POSES.every((e) => {
		const qe = R.fromEuler(e);
		const p = R.stereographic(qe);
		return !p || sameQ(R.fromStereographic(p), qe);
	});
	check("4D: un-projecting a projected q returns q", back4);
	check(
		"4D: the centre un-projects to no turn",
		sameQ(R.fromStereographic([0, 0, 0]), R.IDENTITY),
	);
	check(
		"4D: a point on the unit sphere un-projects to a 180° turn (negative control: not 90°)",
		near(
			R.orientationAngle(R.IDENTITY, R.fromStereographic([0, 1, 0])),
			180,
			1e-6,
		),
	);
	check(
		"code: the clamp line disappears when the clamp is off",
		!generate({ ...base, clamp: false }).includes("Mathf.Clamp"),
	);
	// One source of truth per snippet: hand the generator a q that disagrees
	// with its axis and angle, and the printed q must still follow the axis
	// and angle it prints. The caller's q once leaked in (MISTAKES.md).
	const tabQ = R.fromAxisAngle([0, 1, 0], 120 * R.DEG);
	const printed = (engine, scenario) =>
		generate({
			...base,
			engine,
			method: "quat",
			scenario,
			axis: [0, 1, 0],
			angle: 120,
			q: R.fromEuler({ yaw: 5, pitch: 5, roll: 5 }),
		});
	const expect = (engine) =>
		R.engineQuat(engine, tabQ)
			.map((c) => `⟦${c.toFixed(3)}⟧`)
			.join(", ");
	check(
		"code: the printed q follows the printed axis and angle, not the caller's q",
		R.ENGINES.every(
			(e) =>
				printed(e, null).includes(expect(e)) &&
				printed(e, "apply").includes(expect(e)),
		),
	);
	check(
		"code: ... and the caller's inconsistent q is NOT printed (negative control)",
		!printed("godot", null).includes(
			R.engineQuat("godot", R.fromEuler({ yaw: 5, pitch: 5, roll: 5 }))
				.map((c) => `⟦${c.toFixed(3)}⟧`)
				.join(", "),
		),
	);
	// C++ needs a decimal point before the f: "300f" does not compile. C# does
	// NOT - "89f" is a valid C# float - so this applies to Unreal only. The
	// first version ran it on C# as well and condemned correct code.
	const floatLiteral = /(?<![0-9.])[0-9]+⟧?f(?![A-Za-z])/;
	check(
		"code: the C++ float detector catches 300f",
		floatLiteral.test("Target(⟦300⟧f)"),
	);
	check(
		"code: ... and passes 300.0f and 89.f (negative control)",
		!floatLiteral.test("Target(⟦300.0⟧f, -89.f)"),
	);
	const integerFloats = Object.entries(scenarios).flatMap(([method, list]) =>
		list
			.filter((scenario) =>
				floatLiteral.test(
					generate({ ...base, engine: "unreal", method, scenario }),
				),
			)
			.map((s) => `unreal/${method}/${s}`),
	);
	check(
		`code: no C++ float literal lacks its decimal point${integerFloats.length ? ` (${integerFloats.join(", ")})` : ""}`,
		integerFloats.length === 0,
	);

	/* --- i18n, both directions --- */
	const locales = { en, es };
	const gaps = missingIn(locales, "es");
	check(
		`i18n: es covers every en key${gaps.length ? ` (missing: ${gaps.join(", ")})` : ""}`,
		gaps.length === 0,
	);
	const extra = Object.keys(es).filter((k) => !Object.hasOwn(en, k));
	check(
		`i18n: es has no keys en lacks${extra.length ? ` (${extra.join(", ")})` : ""}`,
		extra.length === 0,
	);
	const holes = Object.entries({ ...en, ...es }).filter(
		([, v]) => typeof v !== "string" || !v.trim(),
	);
	check("i18n: no empty strings", holes.length === 0);
	const params = (s) =>
		[...s.matchAll(/\{(\w+)\}/g)]
			.map((m) => m[1])
			.sort()
			.join(",");
	const drift2 = Object.keys(en).filter(
		(k) => es[k] !== undefined && params(en[k]) !== params(es[k]),
	);
	check(
		`i18n: placeholders match between en and es${drift2.length ? ` (${drift2.join(", ")})` : ""}`,
		drift2.length === 0,
	);
	check(
		"i18n: an absent key is reported missing",
		lookupIn(locales, "es", "__nope__").missing === true,
	);
	check(
		"i18n: a present key is not flagged (negative control)",
		lookupIn(locales, "es", "title").missing === false,
	);
	check(
		"i18n: a key only in en is flagged in es",
		lookupIn({ en: { k: "x" }, es: {} }, "es", "k").missing === true,
	);

	return results;
}

export function report(results = run()) {
	const failed = results.filter((r) => !r.pass);
	if (typeof console.table === "function") console.table(results);
	console.log(
		failed.length
			? `selftest: ${failed.length} FAILED of ${results.length}`
			: `selftest: all ${results.length} passed`,
	);
	return failed.length === 0;
}

// Under Node, `pnpm run selftest` runs this file directly.
if (
	typeof process !== "undefined" &&
	process.argv?.[1]?.replaceAll("\\", "/").endsWith("rotation.selftest.js")
) {
	if (!report()) process.exitCode = 1;
}
