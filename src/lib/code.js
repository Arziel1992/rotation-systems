/**
 * The code panel's text: what the pose on screen looks like in each engine.
 *
 * Pure: takes the tool's state, returns a string. Every number that comes from
 * the state is wrapped in ⟦ ⟧ so the panel can highlight it as live; `plain()`
 * strips them for copying. Nothing here is translated - code samples, and the
 * comments inside them, stay in English (CLAUDE.md, i18n).
 *
 * Every sign below is derived by `rotation.js` and checked in
 * `rotation.selftest.js` against each engine's own formula. Do not "tidy" a
 * minus sign here without running that check.
 */

import {
	axesOf,
	basisHealth,
	DEG,
	engineAxisAngle,
	engineEuler,
	engineQuat,
	engineVec,
	fromAxisAngle,
	fromEuler,
	length4,
	readBack,
	unitsPerMetre,
	upHintAngle,
} from "./rotation.js";

export const LANGUAGE = { godot: "gdscript", unity: "csharp", unreal: "cpp" };

/** Round without ever printing "-0.0". */
export function num(value, digits = 1) {
	const p = 10 ** digits;
	const r = Math.round(value * p) / p;
	return (r === 0 ? 0 : r).toFixed(digits);
}

const live = (text) => `⟦${text}⟧`;
const g = (v, d = 1) => live(num(v, d));
const f = (v, d = 1) => `${live(num(v, d))}f`;
const gv = (v, d = 2) => v.map((c) => g(c, d)).join(", ");
const fv = (v, d = 2) => v.map((c) => f(c, d)).join(", ");
const tuple = (v, d = 2) => `(${v.map((c) => g(c, d)).join(", ")})`;

export const plain = (text) => text.replaceAll("⟦", "").replaceAll("⟧", "");

function pose({ yaw, pitch, roll }) {
	const w = (v, pos, negative) =>
		`${v >= 0 ? pos : negative} ${live(num(Math.abs(v)))}°`;
	return `${w(pitch, "nose up", "nose down")}, ${w(yaw, "turn right", "turn left")}, ${w(roll, "bank right", "bank left")}`;
}

/* ------------------------------------------------------------------- Euler */

function euler(s) {
	const [a, b, c] = engineEuler(s.engine, s.euler);
	const back = readBack(s.engine, fromEuler(s.euler));
	const locked = Math.abs(s.euler.pitch) >= 89.5;
	const warn = locked
		? "✗ Pitch is at 90°: yaw and roll now turn about the SAME axis (gimbal lock)"
		: null;

	if (s.scenario === "longway") return longWay(s);

	if (s.engine === "godot") {
		return [
			"# Godot 4 · right-handed · Y up · forward is -Z · Euler order YXZ",
			`# Pose: ${pose(s.euler)}`,
			"# Typed as x = pitch, y = -yaw (+y turns LEFT), z = -roll (+z banks LEFT)",
			warn && `# ${warn}`,
			`var angles := Vector3(${g(a)}, ${g(b)}, ${g(c)})  # x, y, z in degrees; set by your input code`,
			"",
			"func _process(_delta: float) -> void:",
			s.clamp
				? "\tangles.x = clampf(angles.x, -89.0, 89.0)  # the one-line gimbal-lock defence"
				: "\t# no clamp: at pitch ±90, yaw and roll turn about one axis",
			"\trotation_degrees = angles",
			"",
			`# Read back: rotation_degrees == ${tuple(back, 1)}`,
		];
	}
	if (s.engine === "unity") {
		return [
			"// Unity 6 · left-handed · Y up · forward is +Z · applies z, then x, then y",
			`// Pose: ${pose(s.euler)}`,
			"// Typed as x = -pitch (+x pitches DOWN), y = yaw, z = -roll (+z banks LEFT)",
			warn && `// ${warn}`,
			`private float _x = ${f(a)}, _y = ${f(b)}, _z = ${f(c)};  // set by your input code`,
			"",
			"private void Update()",
			"{",
			s.clamp
				? "    _x = Mathf.Clamp(_x, -89f, 89f);  // the one-line gimbal-lock defence"
				: "    // no clamp: at pitch ±90, yaw and roll turn about one axis",
			"    transform.rotation = Quaternion.Euler(_x, _y, _z);",
			"}",
			"",
			`// Read back: transform.eulerAngles == ${tuple(back, 1)}`,
		];
	}
	return [
		"// Unreal 5 · left-handed · Z up · forward is +X · FRotator(Pitch, Yaw, Roll)",
		`// Pose: ${pose(s.euler)}`,
		"// Typed as Pitch = up, Yaw = right, Roll = bank right: named, not x/y/z",
		warn && `// ${warn}`,
		`FRotator Angles(${f(a)}, ${f(b)}, ${f(c)});  // set by your input code`,
		"",
		"void ARotationDemo::Tick(float DeltaSeconds)",
		"{",
		"    Super::Tick(DeltaSeconds);",
		s.clamp
			? "    Angles.Pitch = FMath::Clamp(Angles.Pitch, -89.f, 89.f);  // the one-line gimbal-lock defence"
			: "    // no clamp: at pitch ±90, yaw and roll turn about one axis",
		"    SetActorRotation(Angles);",
		"}",
		"",
		`// Read back: GetActorRotation() == (P=${g(back[0], 1)} Y=${g(back[1], 1)} R=${g(back[2], 1)})`,
	];
}

function longWay(s) {
	const t = s.longway.t;
	const from = s.longway.from;
	const to = s.longway.to;
	const now = from + (to - from) * t;
	if (s.engine === "godot") {
		return [
			`# ✗ Lerping the NUMBER: ${g(from, 0)} → ${g(to, 0)} sweeps 340°, the long way round`,
			`rotation_degrees.y = lerpf(${g(from)}, ${g(to)}, t)  # t = ${g(t, 2)} → ${g(now)}`,
			"",
			"# ✓ Lerping the ORIENTATION: 20°, the short way",
			`var from := Quaternion(Vector3.UP, deg_to_rad(${g(from)}))`,
			`var to := Quaternion(Vector3.UP, deg_to_rad(${g(to)}))`,
			"quaternion = from.slerp(to, t)",
			"",
			"# lerp_angle() also goes the short way, for one angle, in radians",
		];
	}
	if (s.engine === "unity") {
		return [
			`// ✗ Lerping the NUMBER: ${g(from, 0)} → ${g(to, 0)} sweeps 340°, the long way round`,
			`float y = Mathf.Lerp(${f(from)}, ${f(to)}, t);  // t = ${g(t, 2)} → ${g(now)}`,
			"transform.rotation = Quaternion.Euler(0f, y, 0f);",
			"",
			"// ✓ Lerping the ORIENTATION: 20°, the short way",
			`Quaternion from = Quaternion.Euler(0f, ${f(from)}, 0f);`,
			`Quaternion to = Quaternion.Euler(0f, ${f(to)}, 0f);`,
			"transform.rotation = Quaternion.Slerp(from, to, t);",
			"",
			"// Mathf.LerpAngle() also goes the short way, for one angle",
		];
	}
	return [
		`// ✗ Lerping the NUMBER: ${g(from, 0)} → ${g(to, 0)} sweeps 340°, the long way round`,
		`const float Yaw = FMath::Lerp(${f(from)}, ${f(to)}, T);  // T = ${g(t, 2)} → ${g(now)}`,
		"SetActorRotation(FRotator(0.f, Yaw, 0.f));",
		"",
		"// ✓ Lerping the ORIENTATION: 20°, the short way",
		`const FQuat From = FRotator(0.f, ${f(from)}, 0.f).Quaternion();`,
		`const FQuat To = FRotator(0.f, ${f(to)}, 0.f).Quaternion();`,
		"SetActorRotation(FQuat::Slerp(From, To, T));",
	];
}

/* -------------------------------------------------------------- quaternion */

function quaternion(s) {
	if (s.scenario === "slerp" || s.scenario === "fullpath") return slerpCode(s);
	if (s.scenario === "unnormalised") return unnormalised(s);
	if (s.scenario === "negate") return negated(s);

	const { axis, angle } = engineAxisAngle(s.engine, s.axis, s.angle);
	// Computed from the SAME axis and angle the constructor line prints, never
	// taken from the caller's q: two sources of truth once printed a q that
	// contradicted the line above it (MISTAKES.md, 2026-09-21).
	const q = engineQuat(s.engine, fromAxisAngle(s.axis, s.angle * DEG));
	const half = "w = cos(θ/2) and (x, y, z) = axis · sin(θ/2)";
	// "Apply q gradually": the same q, reached a fraction s of the way from
	// the identity - so the q line above it still describes the whole turn.
	const apply = s.scenario === "apply";
	const note = "q^s: the fraction s of the turn, along the short arc";
	if (s.engine === "godot") {
		return [
			"# Godot 4 · right-handed · Quaternion(x, y, z, w)",
			`# ${half}, with θ = ${g(s.angle)}°`,
			`var axis := Vector3(${gv(axis, 3)})  # must be normalised`,
			`var q := Quaternion(axis, deg_to_rad(${g(angle)}))`,
			`# q == Quaternion(${gv(q, 3)})`,
			apply
				? `quaternion = Quaternion.IDENTITY.slerp(q, ${g(s.t, 2)})  # ${note}`
				: "quaternion = q",
		];
	}
	if (s.engine === "unity") {
		return [
			"// Unity 6 · left-handed · Quaternion(x, y, z, w)",
			`// ${half}, with θ = ${g(s.angle)}°`,
			"// Left-handed: the same turn about the same axis is a NEGATIVE angle here.",
			`Vector3 axis = new Vector3(${fv(axis, 3)});`,
			`Quaternion q = Quaternion.AngleAxis(${f(angle)}, axis);`,
			`// q == (${gv(q, 3)})`,
			apply
				? `transform.rotation = Quaternion.Slerp(Quaternion.identity, q, ${f(s.t, 2)});  // ${note}`
				: "transform.rotation = q;",
		];
	}
	return [
		"// Unreal 5 · left-handed · X forward, Y right, Z up · FQuat(X, Y, Z, W)",
		`// ${half}, with θ = ${g(s.angle)}°`,
		"// Left-handed: the same turn about the same axis is a NEGATIVE angle here.",
		`const FVector Axis(${fv(axis, 3)});  // must be normalised`,
		`const FQuat Q(Axis, FMath::DegreesToRadians(${f(angle)}));`,
		`// Q == FQuat(${gv(q, 3)})`,
		apply
			? `SetActorRotation(FQuat::Slerp(FQuat::Identity, Q, ${f(s.t, 2)}));  // ${note}`
			: "SetActorRotation(Q);",
	];
}

function slerpCode(s) {
	const a = engineQuat(s.engine, s.slerpA);
	const b = engineQuat(s.engine, s.slerpB);
	const d = a.reduce((sum, c, i) => sum + c * b[i], 0);
	const full = s.scenario === "fullpath";
	if (s.engine === "godot") {
		return [
			`var a := Quaternion(${gv(a, 3)})`,
			`var b := Quaternion(${gv(b, 3)})`,
			`# a.dot(b) = ${g(d, 2)}${d < 0 ? "  (negative: the short way is towards -b)" : ""}`,
			full
				? `quaternion = a.slerpni(b, ${g(s.t, 2)})  # ✗ no shortest-path check: can go the long way`
				: `quaternion = a.slerp(b, ${g(s.t, 2)})  # ✓ flips b when the dot is negative`,
		];
	}
	if (s.engine === "unity") {
		return [
			`Quaternion a = new Quaternion(${fv(a, 3)});`,
			`Quaternion b = new Quaternion(${fv(b, 3)});`,
			`// Quaternion.Dot(a, b) = ${g(d, 2)}${d < 0 ? "  (negative: the short way is towards -b)" : ""}`,
			full
				? "// ✗ A hand-written slerp that skips this line goes the long way round:"
				: "// ✓ Quaternion.Slerp already does this check for you:",
			`${full ? "// " : "// (inside Slerp) "}if (Quaternion.Dot(a, b) < 0f) b = new Quaternion(-b.x, -b.y, -b.z, -b.w);`,
			full
				? `transform.rotation = MySlerp(a, b, ${f(s.t, 2)});  // your own, without the check`
				: `transform.rotation = Quaternion.Slerp(a, b, ${f(s.t, 2)});`,
		];
	}
	return [
		`const FQuat A(${fv(a, 3)});`,
		`const FQuat B(${fv(b, 3)});`,
		`// A | B = ${g(d, 2)}${d < 0 ? "  (negative: the short way is towards -B)" : ""}`,
		full
			? `SetActorRotation(FQuat::SlerpFullPath(A, B, ${f(s.t, 2)}));  // ✗ follows the numbers the long way`
			: `SetActorRotation(FQuat::Slerp(A, B, ${f(s.t, 2)}));  // ✓ takes the shortest path`,
	];
}

function unnormalised(s) {
	const q = engineQuat(s.engine, s.q);
	const n = length4(q);
	const note = `length ${g(n, 2)}: not a rotation. Applied as q·v·q*, it scales by |q|² = ${g(n * n, 2)}`;
	if (s.engine === "godot") {
		return [
			"# Components typed or accumulated by hand drift away from length 1.",
			`var q := Quaternion(${gv(q, 3)})`,
			`# ✗ ${note}`,
			"quaternion = q.normalized()  # ✓ length 1: a pure rotation",
		];
	}
	if (s.engine === "unity") {
		return [
			"// Components typed or accumulated by hand drift away from length 1.",
			`Quaternion q = new Quaternion(${fv(q, 3)});`,
			`// ✗ ${note}`,
			"transform.rotation = q.normalized;  // ✓ length 1: a pure rotation",
		];
	}
	return [
		"// Components typed or accumulated by hand drift away from length 1.",
		`FQuat Q(${fv(q, 3)});`,
		`// ✗ ${note}`,
		"Q.Normalize();  // ✓ length 1: a pure rotation",
		"SetActorRotation(Q);",
	];
}

function negated(s) {
	const q = engineQuat(s.engine, s.q);
	if (s.engine === "godot") {
		return [
			"# q and -q are the SAME orientation: every number flips, the object does not.",
			`var q := Quaternion(${gv(q, 3)})`,
			"print(Basis(q).is_equal_approx(Basis(-q)))  # true: same orientation",
			"print(q.is_equal_approx(-q))                # false: compare orientations, not numbers",
		];
	}
	if (s.engine === "unity") {
		return [
			"// q and -q are the SAME orientation: every number flips, the object does not.",
			`Quaternion q = new Quaternion(${fv(q, 3)});`,
			"Quaternion minusQ = new Quaternion(-q.x, -q.y, -q.z, -q.w);",
			"Debug.Log(Quaternion.Angle(q, minusQ));  // 0: same orientation",
			"Debug.Log(q == minusQ);                  // False: == compares Dot with +1",
		];
	}
	return [
		"// Q and -Q are the SAME orientation: every number flips, the object does not.",
		`const FQuat Q(${fv(q, 3)});`,
		"const FQuat MinusQ = Q * -1.f;",
		"const double Apart = Q.AngularDistance(MinusQ);  // 0: same orientation",
		"const bool bSameNumbers = (Q == MinusQ);          // false",
	];
}

/* ------------------------------------------------------------------- basis */

/** Axis and sign for a semantic turn, per engine. Exported for the self-check. */
export const TURN = {
	godot: {
		pitch: ["Vector3.RIGHT", 1],
		yaw: ["Vector3.UP", -1],
		roll: ["Vector3.FORWARD", 1],
	},
	unity: {
		pitch: ["Vector3.right", -1],
		yaw: ["Vector3.up", 1],
		roll: ["Vector3.forward", -1],
	},
};

function turnWords({ kind, deg }) {
	const pos = { pitch: "pitch up", yaw: "turn right", roll: "bank right" };
	const negative = { pitch: "pitch down", yaw: "turn left", roll: "bank left" };
	return `${deg >= 0 ? pos[kind] : negative[kind]} ${live(num(Math.abs(deg)))}°`;
}

function basis(s) {
	if (s.scenario === "drift") return drift(s);
	if (s.scenario === "worldconst") return worldConstant(s);

	const ax = axesOf(s.q);
	const [right, up, forward] = [ax.right, ax.up, ax.forward].map((v) =>
		engineVec(s.engine, v),
	);
	const turn = s.lastTurn;
	const local = turn.space === "local";
	const where = local ? "its OWN" : "the WORLD's";
	const axisName = { pitch: "right", yaw: "up", roll: "forward" }[turn.kind];

	if (s.engine === "godot") {
		const [axis, sign] = TURN.godot[turn.kind];
		return [
			"# Godot 4 · right-handed · Y up · forward is -Z",
			"# The Basis columns ARE the node's own axes:",
			`var right := transform.basis.x     # ${tuple(right)}`,
			`var up := transform.basis.y        # ${tuple(up)}`,
			`var forward := -transform.basis.z  # ${tuple(forward)}  note the minus`,
			"",
			`# Last turn: ${turnWords(turn)} about ${where} ${axisName} axis`,
			`${local ? "rotate_object_local" : "global_rotate"}(${axis}, deg_to_rad(${g(sign * turn.deg)}))`,
		];
	}
	if (s.engine === "unity") {
		const [axis, sign] = TURN.unity[turn.kind];
		return [
			"// Unity 6 · left-handed · Y up · forward is +Z",
			"// The object's own axes: the columns of its rotation matrix",
			`Vector3 right = transform.right;      // ${tuple(right)}`,
			`Vector3 up = transform.up;            // ${tuple(up)}`,
			`Vector3 forward = transform.forward;  // ${tuple(forward)}`,
			"",
			`// Last turn: ${turnWords(turn)} about ${where} ${axisName} axis`,
			`transform.Rotate(${axis}, ${f(sign * turn.deg)}, Space.${local ? "Self" : "World"});`,
		];
	}
	const r = {
		pitch: [turn.deg, 0, 0],
		yaw: [0, turn.deg, 0],
		roll: [0, 0, turn.deg],
	}[turn.kind];
	return [
		"// Unreal 5 · left-handed · Z up · forward is +X",
		"// The Actor's own axes: the axes of its rotation matrix",
		`const FVector Forward = GetActorForwardVector();  // ${tuple(forward)}`,
		`const FVector Right = GetActorRightVector();      // ${tuple(right)}`,
		`const FVector Up = GetActorUpVector();            // ${tuple(up)}`,
		"",
		`// Last turn: ${turnWords(turn)} about ${where} ${axisName} axis`,
		`${local ? "AddActorLocalRotation" : "AddActorWorldRotation"}(FRotator(${fv(r, 1)}));`,
	];
}

function drift(s) {
	const { lengths, angles } = basisHealth(s.cols);
	const now = `lengths ${lengths.map((v) => g(v, 3)).join(" ")} · corners ${angles.map((v) => `${g(v, 1)}°`).join(" ")}`;
	const fix = s.orthonormalize;
	if (s.engine === "godot") {
		return [
			"# Spinning a basis every frame lets rounding error pile up (exaggerated here).",
			`# Now: ${now}`,
			"func _process(delta: float) -> void:",
			"\ttransform.basis = transform.basis.rotated(transform.basis.y.normalized(), 1.5 * delta)",
			fix
				? "\ttransform.basis = transform.basis.orthonormalized()  # ✓ lengths 1, corners 90°"
				: "\t# ✗ no orthonormalized(): the shear and stretch stay and grow",
		];
	}
	if (s.engine === "unity") {
		return [
			"// Accumulating into your own stored rotation lets rounding error pile up",
			`// (exaggerated here). Now: ${now}`,
			"private Quaternion _q = Quaternion.identity;",
			"",
			"private void Update()",
			"{",
			"    _q *= Quaternion.AngleAxis(90f * Time.deltaTime, Vector3.up);",
			fix
				? "    _q = _q.normalized;  // ✓ back to length 1: a pure rotation"
				: "    // ✗ never renormalised: the error stays and grows",
			"    transform.rotation = _q;",
			"}",
		];
	}
	return [
		"// Accumulating into your own stored rotation lets rounding error pile up",
		`// (exaggerated here). Now: ${now}`,
		"FQuat Q = FQuat::Identity;",
		"",
		"void ARotationDemo::Tick(float DeltaSeconds)",
		"{",
		"    Super::Tick(DeltaSeconds);",
		"    Q = Q * FQuat(FVector::UpVector, FMath::DegreesToRadians(90.f * DeltaSeconds));",
		fix
			? "    Q.Normalize();  // ✓ back to length 1: a pure rotation"
			: "    // ✗ never renormalised: the error stays and grows",
		"    SetActorRotation(Q);",
		"}",
	];
}

function worldConstant(s) {
	const own = engineVec(s.engine, axesOf(s.q).forward);
	const good = s.fireOwn;
	if (s.engine === "godot") {
		return [
			"# ✗ A world constant ignores how the node is turned:",
			"var wrong := Vector3.FORWARD         # always (0, 0, -1)",
			"# ✓ Ask the node for its own forward:",
			`var forward := -transform.basis.z    # ${tuple(own)}`,
			`position += ${good ? "forward" : "wrong"} * speed * delta`,
		];
	}
	if (s.engine === "unity") {
		return [
			"// ✗ A world constant ignores how the object is turned:",
			"Vector3 wrong = Vector3.forward;       // always (0, 0, 1)",
			"// ✓ Ask the object for its own forward:",
			`Vector3 forward = transform.forward;   // ${tuple(own)}`,
			`transform.position += ${good ? "forward" : "wrong"} * speed * Time.deltaTime;`,
		];
	}
	return [
		"// ✗ A world constant ignores how the Actor is turned:",
		"const FVector Wrong = FVector::ForwardVector;      // always (1, 0, 0)",
		"// ✓ Ask the Actor for its own forward:",
		`const FVector Forward = GetActorForwardVector();   // ${tuple(own)}`,
		`AddActorWorldOffset(${good ? "Forward" : "Wrong"} * Speed * DeltaSeconds);`,
	];
}

/* ----------------------------------------------------------------- look-at */

function lookAt(s) {
	const unit = unitsPerMetre(s.engine);
	const target = engineVec(s.engine, s.target).map((c) => c * unit);
	const up = upHintAngle(s.target);
	const overhead =
		s.scenario === "overhead" || up < 2
			? `target is ${g(up, 1)}° from straight up`
			: null;
	const k = s.turnRate;

	if (s.engine === "godot") {
		return [
			"# Build the orientation from a direction, not from angles (metres)",
			`var target := Vector3(${gv(target)})`,
			overhead &&
				`# ✗ ${overhead}: direction ∥ Vector3.UP makes look_at() fail with an error`,
			s.smooth
				? "var wanted := transform.looking_at(target, Vector3.UP).basis"
				: "look_at(target, Vector3.UP)  # forward (-Z) now points at the target",
			s.smooth &&
				`transform.basis = transform.basis.slerp(wanted, ${g(k)} * delta).orthonormalized()`,
			overhead &&
				"# ✓ keep the target below ~89°, or pass a different up hint near the pole",
		];
	}
	if (s.engine === "unity") {
		return [
			"// Build the orientation from a direction, not from angles (metres)",
			`Vector3 target = new Vector3(${fv(target)});`,
			"Vector3 toTarget = target - transform.position;",
			overhead &&
				`// ✗ ${overhead}: toTarget ∥ Vector3.up leaves the roll undefined, so it flips`,
			s.smooth
				? "Quaternion wanted = Quaternion.LookRotation(toTarget, Vector3.up);"
				: "transform.rotation = Quaternion.LookRotation(toTarget, Vector3.up);",
			s.smooth &&
				`transform.rotation = Quaternion.Slerp(transform.rotation, wanted, ${f(k)} * Time.deltaTime);`,
			overhead &&
				"// ✓ keep the target below ~89°, or pass a different up hint near the pole",
		];
	}
	return [
		"// Build the orientation from a direction, not from angles (centimetres)",
		`const FVector Target(${fv(target, 1)});  // X forward, Y right, Z up`,
		"const FRotator Look = UKismetMathLibrary::FindLookAtRotation(GetActorLocation(), Target);",
		overhead &&
			`// ✗ ${overhead}: straight up the yaw is undefined, so it flips 180° as the target passes over`,
		s.smooth
			? `SetActorRotation(FMath::RInterpTo(GetActorRotation(), Look, DeltaSeconds, ${f(k)}));`
			: "SetActorRotation(Look);",
		overhead && "// ✓ keep the target below ~89° of pitch near the pole",
	];
}

const BY_METHOD = { euler, quat: quaternion, basis, lookat: lookAt };

/** The snippet for the current state, as one string with ⟦live⟧ markers. */
export function generate(state) {
	return BY_METHOD[state.method](state)
		.filter((line) => line !== null && line !== false && line !== undefined)
		.join("\n");
}
