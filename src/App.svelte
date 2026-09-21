<script>
/**
 * Rotation Systems — the shell and the owner of all state.
 *
 * One orientation, `q`, shared by every method and held in the display frame
 * (see rotation.js). Each method is a different way of SETTING it - three
 * angles, an axis and an angle, turns about the object's own axes, or a
 * direction to look along - and the code panel writes the same pose in the
 * chosen engine. Everything the learner can drag (the aircraft, the gimbal
 * rings, the basis gizmo, the quaternion's axis and angle, q in the 4D view,
 * the numbers in the code) routes through a handler here.
 *
 * Layout follows the house tools: a textbook rail on the left, the stage in
 * the middle, controls and a live read-out on the right, both rails
 * collapsible and remembered.
 */
import "@fortawesome/fontawesome-free/css/fontawesome.min.css";
import "@fortawesome/fontawesome-free/css/solid.min.css";
import "@fortawesome/fontawesome-free/css/brands.min.css";
import { onMount } from "svelte";
import { version } from "../package.json";
import CodePanel from "./lib/CodePanel.svelte";
import Controls from "./lib/Controls.svelte";
import Glossary from "./lib/Glossary.svelte";
import Hypersphere from "./lib/Hypersphere.svelte";
import { LOCALE_NAMES, locale, setLocale, t } from "./lib/i18n/index.svelte.js";
import Readout from "./lib/Readout.svelte";
import * as R from "./lib/rotation.js";
import { scrub } from "./lib/scrub.js";
import Theory from "./lib/Theory.svelte";
import Viewport from "./lib/Viewport.svelte";

const METHODS = ["euler", "quat", "basis", "lookat"];
const POSE = { yaw: 35, pitch: 20, roll: 10 };
const TARGET = [2, 1, -3];
/** Scenarios that play over time, and how long each takes, in seconds. */
const TIMED = { gimbal: 9, longway: 4, apply: 4, slerp: 3, fullpath: 4, overhead: 6 };
/** Where both 3D cameras start, and share while the views are aligned. */
const START_VIEW = R.normalize3([6.3, 3.8, 5.6]);
/** Verified with `git ls-remote` on 2026-09-21 before being written here. */
const REPOSITORY = "https://github.com/Arziel1992/rotation-systems";
/**
 * The easter egg: one page load in a hundred, the aircraft is a capybara.
 * Chosen once per load, so it stays for the visit. `?model=capybara` (or
 * `?model=aircraft`) forces it, for testing and for anyone who asks.
 */
const CAPYBARA_CHANCE = 0.01;
const model = (() => {
	const forced = new URLSearchParams(location.search).get("model");
	if (forced === "capybara" || forced === "aircraft") return forced;
	return Math.random() < CAPYBARA_CHANCE ? "capybara" : "aircraft";
})();
const reducedMotion =
	typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

function saved(key, allowed, fallback) {
	try {
		const value = localStorage.getItem(`rotation-systems.${key}`);
		return allowed.includes(value) ? value : fallback;
	} catch {
		return fallback;
	}
}

function persist(key, value) {
	try {
		localStorage.setItem(`rotation-systems.${key}`, value);
	} catch {
		/* not persisted this session; the tool still works */
	}
}

let method = $state(saved("method", METHODS, "euler"));
let engine = $state(saved("engine", R.ENGINES, "unity"));
// The inline script in index.html has already applied these before paint.
let leftOpen = $state(document.documentElement.dataset.theory !== "hidden");
let rightOpen = $state(document.documentElement.dataset.controls !== "hidden");
let dark = $state(document.documentElement.dataset.theme === "dark");
/* The code panel: open, or folded to its header; and its height in percent of
   the window, never more than a third. Saved as a whole percent, so the saved
   value is checked against a list like every other setting. */
const CODE_MIN = 15;
const CODE_MAX = 33;
const CODE_SIZES = Array.from({ length: CODE_MAX - CODE_MIN + 1 }, (_, i) => String(CODE_MIN + i));
let codeOpen = $state(saved("code", ["shown", "hidden"], "shown") === "shown");
let codeSize = $state(Number(saved("codeSize", CODE_SIZES, String(CODE_MAX))));
let glossaryOpen = $state(false);
let glossarySection = $state("manual");

/* The one orientation every method sets. */
let q = $state(R.fromEuler(POSE));

/* Euler */
let euler = $state({ ...POSE });
let clamp = $state(true);
let showRings = $state(true);
let showAxes = $state(true);

/* Quaternion. The axis sliders are right / up / forward. */
let axisRaw = $state([1, 1, 1]);
let angle = $state(120);
let negate = $state(false);
let slerpA = $state([...R.IDENTITY]);
let slerpB = $state(R.fromAxisAngle([1, 1, 1], 120 * R.DEG));
let qLength = $state(1.3);
let aligned = $state(saved("aligned", ["on", "off"], "on") === "on");
let viewDir = $state([...START_VIEW]);

/* Basis. The last turn is one delta, three Euler numbers; a button or a
   gizmo drag starts a new one about a single axis. */
const NO_TURN = { yaw: 0, pitch: 0, roll: 0 };
const FIRST_TURN = { ...NO_TURN, yaw: 15, space: "local" };
let space = $state("local");
let lastTurn = $state({ ...FIRST_TURN });
let cols = $state(null);
let driftRunning = $state(false);
let orthonormalize = $state(false);
let fireOwn = $state(false);
let showGizmo = $state(true);

/* Look-at */
let target = $state([...TARGET]);
let wanted = $state(null);
let smooth = $state(false);
let turnRate = $state(4);
let clampElevation = $state(false);
let degenerate = $state(false);

/* Break-it scenarios */
let active = $state(null);
let progress = $state(0);
let playing = $state(false);
let announcement = $state("");
let base = null; // the state a scenario started from; not reactive on purpose
let dragTurn = null; // the basis gizmo turn being dragged

const axis = $derived(R.normalize3([axisRaw[0], axisRaw[1], -axisRaw[2]]) ?? [0, 1, 0]);

function announce(text) {
	// Clear first, so the same message twice is still announced twice.
	announcement = "";
	setTimeout(() => {
		announcement = text;
	}, 40);
}

/* ------------------------------------------------------------ setting q */

function quatFromTab() {
	const next = R.fromAxisAngle(axis, angle * R.DEG);
	return negate ? R.neg(next) : next;
}

/** A new orientation from a drag or a key, reflected back into the method. */
function setOrientation(next) {
	q = R.normalize(next);
	if (method === "euler") euler = R.toEuler(q);
	if (method === "quat") syncAxisFromQ();
}

function syncAxisFromQ() {
	const aa = R.toAxisAngle(q);
	axisRaw = [aa.axis[0], aa.axis[1], -aa.axis[2]];
	angle = aa.angle;
	negate = false;
}

function setEulerAll(next) {
	stopScenario();
	const e = { ...next };
	if (clamp) e.pitch = Math.max(-89, Math.min(89, e.pitch));
	euler = e;
	q = R.fromEuler(e);
}

const setEuler = (key, value) => setEulerAll({ ...euler, [key]: value });

function setAxisRaw(next) {
	stopScenario();
	axisRaw = next;
	q = quatFromTab();
}

function setAngle(value) {
	stopScenario();
	angle = Math.max(0, Math.min(720, value));
	q = quatFromTab();
}

const turnStep = (kind, deg) => R.fromEuler({ yaw: 0, pitch: 0, roll: 0, [kind]: deg });

function turn(kind, deg) {
	stopScenario();
	lastTurn = { ...NO_TURN, [kind]: deg, space };
	setOrientation(space === "local" ? R.mul(q, turnStep(kind, deg)) : R.mul(turnStep(kind, deg), q));
}

/** Reshape the last basis turn: undo the old delta, apply the new. */
function retune(next) {
	const where = lastTurn.space;
	const turned = R.retuneTurn(q, lastTurn, next, where === "local");
	lastTurn = { ...next, space: where };
	setOrientation(turned);
}

/* ------------------------------------------------------ direct manipulation */

function onDragTurn(dq) {
	stopScenario();
	setOrientation(R.mul(dq, q));
}

/** A gimbal ring dragged by `deg` about its own axis (right-hand rule). */
function onRing(kind, deg) {
	setEuler(kind, euler[kind] + R.ringToAngle(kind, deg));
}

/** The basis gizmo: one ring per axis of the object (or of the world). */
function onGizmo(axisName, deg, phase) {
	const kind = R.RING_OF_AXIS[axisName];
	if (phase === "start") {
		stopScenario();
		dragTurn = { kind, deg: 0 };
		return;
	}
	if (!dragTurn) return;
	const step = R.ringToAngle(kind, deg);
	dragTurn.deg += step;
	lastTurn = { ...NO_TURN, [kind]: dragTurn.deg, space };
	setOrientation(space === "local" ? R.mul(q, turnStep(kind, step)) : R.mul(turnStep(kind, step), q));
}

function onAxisDrag(displayAxis) {
	setAxisRaw([displayAxis[0], displayAxis[1], -displayAxis[2]]);
}

function onHyperDrag(next) {
	stopScenario();
	setOrientation(next);
}

/** A number dragged in the code panel, in that engine's printed units. */
function onScrub(id, delta) {
	const patch = scrub(
		{ engine, euler, axisRaw, angle, target, turnRate, progress, lastTurn },
		id,
		delta,
	);
	if (!patch) return;
	if (patch.euler) setEulerAll(patch.euler);
	if (patch.axisRaw) setAxisRaw(patch.axisRaw);
	if (patch.angle !== undefined) setAngle(patch.angle);
	if (patch.target) setTarget(patch.target);
	if (patch.turnRate !== undefined) turnRate = patch.turnRate;
	if (patch.progress !== undefined) seek(patch.progress);
	if (patch.turn) retune(patch.turn);
}

function onView(dir) {
	if (aligned) viewDir = dir;
}

/* ------------------------------------------------------------- look-at */

/** Hold the target below 89° of elevation - the look-at twin of clamping pitch. */
function clampTarget(p) {
	const d = R.len3(p);
	const top = d * Math.sin(89 * R.DEG);
	if (!clampElevation || d < 1e-6 || p[1] <= top) return p;
	const flat = R.normalize3([p[0], 0, p[2]]) ?? [0, 0, -1];
	const across = d * Math.cos(89 * R.DEG);
	return [flat[0] * across, top, flat[2] * across];
}

function aimAtTarget(instant) {
	const look = R.lookRotation(target);
	if (!look) {
		if (!degenerate) announce(t("lookDegenerate"));
		degenerate = true;
		return; // every engine's look-at is undefined here: keep what we had
	}
	degenerate = false;
	if (!instant) {
		wanted = look;
		return;
	}
	if (active === "overhead" && R.orientationAngle(q, look) > 90) announce(t("lookFlipped"));
	q = look;
}

function setTarget(next) {
	if (active !== "overhead") stopScenario();
	target = clampTarget(next);
	aimAtTarget(!smooth);
}

/* ------------------------------------------------------------ scenarios */

function startScenario(id) {
	stopScenario();
	base = { euler: { ...euler }, q: [...q], phase: 0 };
	active = id;
	progress = 0;
	if (id === "gimbal") clamp = false;
	if (id === "apply") base.q = quatFromTab();
	if (id === "fullpath" && R.dot4(slerpA, slerpB) > 0) slerpB = R.neg(slerpB);
	if (id === "negate") {
		negate = true;
		q = quatFromTab();
	}
	if (id === "drift") {
		cols = R.toBasis(q);
		driftRunning = true;
	}
	if (id in TIMED) {
		playing = !reducedMotion;
		applyScenario(0);
	}
	announce(t(`break.${id}.started`));
}

function stopScenario() {
	if (!active) return;
	const was = active;
	active = null;
	playing = false;
	progress = 0;
	if (was === "drift") {
		if (cols) q = R.fromBasis(R.orthonormalize(cols));
		cols = null;
		driftRunning = false;
	}
	if (was === "negate") {
		negate = false;
		q = quatFromTab();
	}
	if (was === "apply" || was === "unnormalised") q = quatFromTab();
	if (method === "euler") euler = R.toEuler(q);
}

const smoothstep = (x) => x * x * (3 - 2 * x);

function applyScenario(p) {
	progress = p;
	if (active === "gimbal") {
		const b = base.euler;
		const e = { ...b, pitch: 90 };
		if (p < 0.25) e.pitch = b.pitch + (90 - b.pitch) * smoothstep(p / 0.25);
		else if (p < 0.625) e.yaw = b.yaw + 35 * Math.sin((2 * Math.PI * (p - 0.25)) / 0.375);
		else e.roll = b.roll + 35 * Math.sin((2 * Math.PI * (p - 0.625)) / 0.375);
		const phase = p < 0.25 ? 0 : p < 0.625 ? 1 : 2;
		if (phase !== base.phase) {
			base.phase = phase;
			announce(t(`break.gimbal.phase${phase}`));
		}
		euler = e;
		q = R.fromEuler(e);
	} else if (active === "longway") {
		euler = { yaw: longwayYaw(p), pitch: 0, roll: 0 };
		q = R.fromEuler(euler);
	} else if (active === "apply") {
		q = R.power(base.q, p);
	} else if (active === "slerp") {
		q = R.slerp(slerpA, slerpB, p);
	} else if (active === "fullpath") {
		q = R.slerp(slerpA, slerpB, p, false);
	} else if (active === "overhead") {
		const e = (5 + 110 * p) * R.DEG;
		target = clampTarget([0, 2.6 * Math.sin(e), -2.6 * Math.cos(e)]);
		aimAtTarget(!smooth);
	}
}

// The engine's own yaw number goes 350 -> 10. Godot's +y turns left, so the
// same NUMBERS turn the other way on screen - which is the point.
const longwayYaw = (p) => (engine === "godot" ? -1 : 1) * (350 - 340 * p);

function togglePlay() {
	if (!(active in TIMED)) return;
	if (progress >= 1) applyScenario(0);
	playing = !playing;
}

function seek(p) {
	if (!(active in TIMED)) return;
	playing = false;
	applyScenario(p);
}

/* ----------------------------------------------------------- navigation */

function enterMethod() {
	wanted = null;
	if (method === "euler") euler = R.toEuler(q);
	if (method === "quat") syncAxisFromQ();
	if (method === "lookat") aimAtTarget(true);
}

function selectMethod(next) {
	if (next === method) return;
	stopScenario();
	method = next;
	persist("method", next);
	enterMethod();
	announce(t("methodChosen", { method: t(`tab.${next}`) }));
}

function setEngine(next) {
	engine = next;
	persist("engine", next);
	if (active === "longway") applyScenario(progress);
}

function reset() {
	stopScenario();
	if (method === "euler") {
		clamp = true;
		euler = { ...POSE };
		q = R.fromEuler(POSE);
	} else if (method === "quat") {
		axisRaw = [1, 1, 1];
		angle = 120;
		negate = false;
		slerpA = [...R.IDENTITY];
		slerpB = R.fromAxisAngle([1, 1, 1], 120 * R.DEG);
		q = quatFromTab();
		viewDir = [...START_VIEW];
	} else if (method === "basis") {
		space = "local";
		lastTurn = { ...FIRST_TURN };
		q = R.fromEuler(POSE);
	} else {
		smooth = false;
		clampElevation = false;
		target = [...TARGET];
		aimAtTarget(true);
	}
	announce(t("resetDone"));
}

function openGlossary(section = "manual") {
	glossarySection = section;
	glossaryOpen = true;
}

/** Keys on the focused 3D view. Shift makes the step bigger. */
function onViewKey(event) {
	const big = event.shiftKey;
	if (method === "lookat") {
		const d = big ? 0.75 : 0.25;
		const moves = {
			ArrowLeft: [0, -d],
			ArrowRight: [0, d],
			ArrowUp: [2, -d],
			ArrowDown: [2, d],
			PageUp: [1, d],
			PageDown: [1, -d],
		};
		const move = moves[event.key];
		if (!move) return;
		event.preventDefault();
		const next = [...target];
		next[move[0]] = Math.max(-4.5, Math.min(4.5, next[move[0]] + move[1]));
		setTarget(next);
		return;
	}
	const s = big ? 15 : 5;
	const keys = {
		ArrowLeft: ["yaw", -s],
		ArrowRight: ["yaw", s],
		ArrowUp: ["pitch", s],
		ArrowDown: ["pitch", -s],
		q: ["roll", -s],
		Q: ["roll", -s],
		e: ["roll", s],
		E: ["roll", s],
	};
	const action = keys[event.key];
	if (!action) return;
	event.preventDefault();
	if (method === "euler") setEuler(action[0], euler[action[0]] + action[1]);
	else turn(action[0], action[1]);
}

/** Page-wide shortcuts: 1-4 pick a method, G opens the glossary. */
function onGlobalKey(event) {
	if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
	// Only text entry swallows these keys (a select jumps between options on
	// a letter). Range inputs and the code's sliders never use 1-4 or G; the
	// first version excluded every input, so G did nothing after touching a
	// slider.
	if (event.target.closest?.("select, textarea, input[type='text'], input[type='search'], dialog")) return;
	const index = ["1", "2", "3", "4"].indexOf(event.key);
	if (index >= 0) selectMethod(METHODS[index]);
	else if (event.key === "g" || event.key === "G") openGlossary(method === "quat" ? "quaternion" : method === "lookat" ? "look-at" : method);
}

function toggleTheme() {
	dark = !dark;
	const next = dark ? "dark" : "light";
	document.documentElement.dataset.theme = next;
	persist("theme", next);
}

function toggleLeft() {
	leftOpen = !leftOpen;
	if (leftOpen) delete document.documentElement.dataset.theory;
	else document.documentElement.dataset.theory = "hidden";
	persist("theory", leftOpen ? "shown" : "hidden");
}

function toggleRight() {
	rightOpen = !rightOpen;
	if (rightOpen) delete document.documentElement.dataset.controls;
	else document.documentElement.dataset.controls = "hidden";
	persist("controls", rightOpen ? "shown" : "hidden");
}

function toggleCode() {
	codeOpen = !codeOpen;
	persist("code", codeOpen ? "shown" : "hidden");
}

function setCodeSize(next, save = true) {
	codeSize = Math.min(CODE_MAX, Math.max(CODE_MIN, next));
	if (save) persist("codeSize", String(Math.round(codeSize)));
}

/** The splitter above the code: drag it up or down. */
function startCodeResize(event) {
	if (event.button !== 0) return;
	event.preventDefault();
	event.currentTarget.focus();
	const startY = event.clientY;
	const start = codeSize;
	const move = (e) => setCodeSize(start + ((startY - e.clientY) / window.innerHeight) * 100, false);
	const up = () => {
		setCodeSize(codeSize);
		window.removeEventListener("pointermove", move);
		window.removeEventListener("pointerup", up);
		window.removeEventListener("pointercancel", up);
	};
	window.addEventListener("pointermove", move);
	window.addEventListener("pointerup", up);
	window.addEventListener("pointercancel", up);
}

/** Or focus it: arrows move it 2%, Page keys 5%, Home and End jump. */
function onCodeResizeKey(event) {
	const moves = {
		ArrowUp: 2,
		ArrowDown: -2,
		PageUp: 5,
		PageDown: -5,
		Home: CODE_MIN - codeSize,
		End: CODE_MAX - codeSize,
	};
	if (!(event.key in moves)) return;
	event.preventDefault();
	setCodeSize(Math.round(codeSize + moves[event.key]));
}

function toggleAligned() {
	aligned = !aligned;
	persist("aligned", aligned ? "on" : "off");
	announce(t(aligned ? "alignOn" : "alignOff"));
}

/* ------------------------------------------------------ derived for views */

const qShown = $derived(active === "unnormalised" ? q.map((c) => c * qLength) : q);

const noseOf = (quat) => R.scale3(R.axesOf(quat).forward, 1.08);
const nosePath = (at, n = 72) => Array.from({ length: n + 1 }, (_, i) => noseOf(at(i / n)));
const quatPath = (at, n = 96) => Array.from({ length: n + 1 }, (_, i) => at(i / n));

const longwayAt = (p) => R.fromEuler({ yaw: longwayYaw(p), pitch: 0, roll: 0 });
const shortwayAt = (p) => R.slerp(longwayAt(0), longwayAt(1), p);

const trails = $derived.by(() => {
	if (active === "longway") {
		return [
			{ good: false, points: nosePath(longwayAt), label: t("trailLong") },
			{ good: true, points: nosePath(shortwayAt), label: t("trailShort") },
		];
	}
	if (active === "slerp") {
		return [{ good: true, points: nosePath((p) => R.slerp(slerpA, slerpB, p)), label: t("trailSlerp") }];
	}
	if (active === "fullpath") {
		return [
			{ good: false, points: nosePath((p) => R.slerp(slerpA, slerpB, p, false)), label: t("trailLong") },
			{ good: true, points: nosePath((p) => R.slerp(slerpA, slerpB, p)), label: t("trailShort") },
		];
	}
	return [];
});

const ghosts = $derived.by(() => {
	if (active === "longway") return [{ q: shortwayAt(progress), label: t("ghostShort") }];
	if (active === "slerp") {
		return [
			{ q: slerpA, label: "A" },
			{ q: slerpB, label: "B" },
		];
	}
	if (active === "fullpath") {
		return [
			{ q: R.slerp(slerpA, slerpB, progress), label: t("ghostShort") },
			{ q: slerpB, label: "B" },
		];
	}
	if (active === "apply") return [{ q: base?.q ?? q, label: "q" }];
	return [];
});

const axisArrow = $derived.by(() => {
	if (method !== "quat") return null;
	const shown = active ? R.toAxisAngle(q) : { axis, angle };
	return { axis: shown.axis, angle: shown.angle, label: `θ = ${Math.round(shown.angle)}°` };
});

const rays = $derived.by(() => {
	if (active !== "worldconst") return [];
	const names = {
		godot: ["Vector3.FORWARD", "-transform.basis.z"],
		unity: ["Vector3.forward", "transform.forward"],
		unreal: ["FVector::ForwardVector", "GetActorForwardVector()"],
	}[engine];
	return [
		{ dir: [0, 0, -1], good: false, fire: !fireOwn, label: `✗ ${t("rayWorld")}: ${names[0]}` },
		{ dir: R.axesOf(q).forward, good: true, fire: fireOwn, label: `✓ ${t("rayOwn")}: ${names[1]}` },
	];
});

const viewCols = $derived(
	active === "drift" ? cols : active === "unnormalised" ? R.toBasis(qShown) : null,
);

const viewLabels = $derived({
	forward: t("axisForward"),
	right: t("axisRight"),
	up: t("axisUp"),
	back: t("axisBack"),
	yaw: t("yaw"),
	pitch: t("pitch"),
	roll: t("roll"),
	target: t("target"),
	axis: t("axis"),
	noWebgl: t("noWebgl"),
	worldAxes: t("worldAxes"),
});

const hyperLabels = $derived({
	sphere: t("hyperSphere"),
	identity: t("hyperIdentity"),
	q: "q",
	minusQ: t("hyperMinus"),
	right: t("axisRight"),
	up: t("axisUp"),
	back: t("axisBack"),
	noWebgl: t("noWebgl"),
});

const hyperPaths = $derived.by(() => {
	if (active === "slerp") return [{ good: true, quats: quatPath((p) => R.slerp(slerpA, slerpB, p)) }];
	if (active === "fullpath") {
		return [
			{ good: false, quats: quatPath((p) => R.slerp(slerpA, slerpB, p, false)) },
			{ good: true, quats: quatPath((p) => R.slerp(slerpA, slerpB, p)) },
		];
	}
	if (active === "apply") return [{ good: true, quats: quatPath((p) => R.power(base?.q ?? q, p)) }];
	return [];
});

const pose = $derived(R.toEuler(q));
const viewName = $derived(
	t(`viewLabel.${model}`, {
		yaw: Math.round(pose.yaw),
		pitch: Math.round(pose.pitch),
		roll: Math.round(pose.roll),
	}),
);

const codeState = $derived({
	method,
	scenario: active,
	euler,
	clamp,
	// While q is being applied, the code builds the full q and then slerps
	// from the identity; the fraction applied so far is `t`.
	q: active === "apply" ? (base?.q ?? q) : qShown,
	axisRaw,
	angle,
	slerpA,
	slerpB,
	t: progress,
	longway: { t: progress, from: 350, to: 10 },
	lastTurn,
	cols: cols ?? R.toBasis(q),
	orthonormalize,
	fireOwn,
	target,
	smooth,
	turnRate,
});

const actions = {
	selectMethod,
	setEuler,
	setClamp(on) {
		if (active === "gimbal") stopScenario();
		clamp = on;
		if (on) setEuler("pitch", euler.pitch);
	},
	setShowRings: (on) => (showRings = on),
	setShowAxes: (on) => (showAxes = on),
	setShowGizmo: (on) => (showGizmo = on),
	setAxis(index, value) {
		const next = [...axisRaw];
		next[index] = value;
		setAxisRaw(next);
	},
	axisPreset: setAxisRaw,
	setAngle,
	setA() {
		slerpA = [...q];
		announce(t("setAdone"));
	},
	setB() {
		slerpB = [...q];
		announce(t("setBdone"));
	},
	setQLength: (v) => (qLength = v),
	toggleAligned,
	turn,
	setSpace: (s) => (space = s),
	setOrthonormalize: (on) => (orthonormalize = on),
	toggleDrift: () => (driftRunning = !driftRunning),
	setFireOwn: (on) => (fireOwn = on),
	setTarget(index, value) {
		const next = [...target];
		next[index] = value;
		setTarget(next);
	},
	setSmooth(on) {
		smooth = on;
		wanted = null;
		aimAtTarget(!on);
	},
	setTurnRate: (v) => (turnRate = v),
	setClampElevation(on) {
		clampElevation = on;
		setTarget(target);
	},
	start: startScenario,
	stop() {
		stopScenario();
		announce(t("scenarioStopped"));
	},
	togglePlay,
	seek,
	reset,
	glossary: openGlossary,
};

enterMethod();

// The document title and meta description are learner-visible text too.
$effect(() => {
	document.title = t("documentTitle");
	document.querySelector('meta[name="description"]')?.setAttribute("content", t("documentDescription"));
});

onMount(() => {
	let frame;
	let last = performance.now();
	const tick = (now) => {
		const dt = Math.min(0.1, (now - last) / 1000);
		last = now;
		if (playing && active in TIMED) {
			const next = Math.min(1, progress + dt / TIMED[active]);
			applyScenario(next);
			if (next >= 1) {
				playing = false;
				announce(t(`break.${active}.done`));
			}
		}
		if (active === "drift" && driftRunning && cols) {
			let next = R.driftStep(cols, 1.5 * dt, 0.09 * dt);
			if (orthonormalize) next = R.orthonormalize(next);
			cols = next;
			// Stop before the shape is unrecognisable; the point is made.
			if (R.basisHealth(next).lengths.some((l) => l > 1.7 || l < 0.6)) {
				driftRunning = false;
				announce(t("driftHalted"));
			}
		}
		if (smooth && wanted && method === "lookat") {
			const next = R.slerp(q, wanted, Math.min(1, turnRate * dt));
			q = R.orientationAngle(next, wanted) < 0.05 ? wanted : next;
		}
		frame = requestAnimationFrame(tick);
	};
	frame = requestAnimationFrame(tick);
	window.addEventListener("keydown", onGlobalKey);

	if (model === "capybara") announce(t("capybaraFound"));

	if (new URLSearchParams(location.search).has("selftest")) {
		import("./lib/rotation.selftest.js").then((m) => m.report());
	}
	return () => {
		cancelAnimationFrame(frame);
		window.removeEventListener("keydown", onGlobalKey);
	};
});
</script>

<!-- One footer, not two: it lives in the control rail, and moves to the
     textbook rail only while the control rail is folded away. -->
{#snippet footer()}
	<div class="app-footer">
		{t("footerMadeWith")} — {t("footerSubject")} — By E. Ketterer
		<br />
		<a href={REPOSITORY} rel="noopener">
			<i class="fa-brands fa-github" aria-hidden="true"></i>
			{t("repository")}
		</a>
		<a class="badge" href="{REPOSITORY}/blob/main/CHANGELOG.md" rel="noopener" title={t("versionTitle")}>v{version}</a>
	</div>
{/snippet}

<a class="skip-link" href="#main">{t("skipToContent")}</a>

<div class="app-layout">
	{#if leftOpen}
		<aside class="sidebar-left" aria-labelledby="theory-title">
			<div class="sidebar-inner">
				<Theory {method} {engine} onglossary={openGlossary} />
			</div>
			{#if !rightOpen}{@render footer()}{/if}
		</aside>
	{/if}

	<main id="main" class="canvas-panel" aria-label={t("stageLabel")}>
		<!-- The page keeps its h1 when the textbook rail that holds it is closed. -->
		{#if !leftOpen}<h1 class="visually-hidden">{t("title")}</h1>{/if}
		<button
			type="button"
			class="toggle-btn toggle-left"
			aria-expanded={leftOpen}
			aria-label={leftOpen ? t("hideTheory") : t("showTheory")}
			onclick={toggleLeft}
		>
			<i class="fa-solid {leftOpen ? 'fa-chevron-left' : 'fa-chevron-right'}" aria-hidden="true"></i>
		</button>
		<button
			type="button"
			class="toggle-btn toggle-right"
			aria-expanded={rightOpen}
			aria-label={rightOpen ? t("hideControls") : t("showControls")}
			onclick={toggleRight}
		>
			<i class="fa-solid {rightOpen ? 'fa-chevron-right' : 'fa-chevron-left'}" aria-hidden="true"></i>
		</button>

		<div class="stage">
			<div class="views" class:split={method === "quat"}>
				<div class="view">
					{#if method === "quat"}<h2 class="view-title">{t(`objectTitle.${model}`)}</h2>{/if}
					{#if model === "capybara"}
						<!-- CC BY 3.0 asks for title, author, source and licence. -->
						<p class="model-credit">
							{t("modelCredit")}:
							<a href="https://poly.pizza/m/66d-mKAgF17" rel="noopener">Capybara</a>
							· Poly by Google ·
							<a href="https://creativecommons.org/licenses/by/3.0/" rel="noopener license">CC BY 3.0</a>
						</p>
					{/if}
					<Viewport
						{q}
						{model}
						cols={viewCols}
						{engine}
						{reducedMotion}
						gimbal={method === "euler" && showRings ? euler : null}
						gizmo={method === "basis" && showGizmo && !active ? { space } : null}
						{showAxes}
						{ghosts}
						{trails}
						{axisArrow}
						target={method === "lookat" ? target : null}
						{rays}
						dragObject={method !== "lookat"}
						alignDir={method === "quat" && aligned ? viewDir : null}
						labels={viewLabels}
						ariaLabel={viewName}
						describedBy="view-hint"
						onturn={onDragTurn}
						ontarget={setTarget}
						onring={onRing}
						ongizmo={onGizmo}
						onaxis={onAxisDrag}
						onangle={(deg) => setAngle(angle + deg)}
						onview={onView}
						onkeydown={onViewKey}
					/>
				</div>
				{#if method === "quat"}
					<div class="view">
						<div class="view-title with-toggle">
							<h2>{t("hyperTitle")}</h2>
							<button type="button" class="align" aria-pressed={aligned} onclick={toggleAligned}>
								<i class="fa-solid fa-link" aria-hidden="true"></i>
								{t("alignViews")}
							</button>
						</div>
						<Hypersphere
							q={qShown}
							{engine}
							paths={hyperPaths}
							motion={active === "apply" ? progress : null}
							{reducedMotion}
							alignDir={aligned ? viewDir : null}
							labels={hyperLabels}
							ariaLabel={t("hyperLabel")}
							describedBy="hyper-hint"
							onq={onHyperDrag}
							onview={onView}
						/>
						<p id="hyper-hint" class="view-hint">{t("hyperHint")}</p>
					</div>
				{/if}

				<div class="float-toolbar" role="toolbar" aria-label={t("toolbarLabel")}>
					<button type="button" onclick={() => openGlossary("manual")}>
						<i class="fa-solid fa-book-open" aria-hidden="true"></i>
						{t("manualButton")}
					</button>
					<label class="visually-hidden" for="locale">{t("languageLabel")}</label>
					<select id="locale" value={locale.current} onchange={(event) => setLocale(event.currentTarget.value)}>
						{#each Object.entries(LOCALE_NAMES) as [code, name] (code)}
							<option value={code} lang={code}>{name}</option>
						{/each}
					</select>
					<button type="button" aria-pressed={dark} onclick={toggleTheme}>
						<i class="fa-solid fa-circle-half-stroke" aria-hidden="true"></i>
						{t("themeToggle")}
					</button>
				</div>

				<p id="view-hint" class="kb-hint">
					{t(`kbHint.${method}`)}
				</p>
			</div>
			<div class="code" class:closed={!codeOpen} style:--code-size="{codeSize}vh">
				{#if codeOpen}
					<!-- WAI-ARIA window splitter: a FOCUSABLE separator is a widget,
					     with a value, arrow keys and Home/End (ARIA 1.2, "separator").
					     Svelte's role table files every separator as structural, so
					     its two warnings below are wrong for this one and silenced. -->
					<!-- svelte-ignore a11y_no_noninteractive_element_interactions, a11y_no_noninteractive_tabindex -->
					<div
						class="code-resizer"
						role="separator"
						aria-orientation="horizontal"
						aria-controls="code-body"
						aria-label={t("resizeCode")}
						aria-valuemin={CODE_MIN}
						aria-valuemax={CODE_MAX}
						aria-valuenow={Math.round(codeSize)}
						aria-valuetext={t("codeSizeValue", { n: Math.round(codeSize) })}
						tabindex="0"
						onpointerdown={startCodeResize}
						onkeydown={onCodeResizeKey}
					></div>
				{/if}
				<CodePanel
					snapshot={codeState}
					{engine}
					open={codeOpen}
					ontoggle={toggleCode}
					onengine={setEngine}
					onannounce={announce}
					onscrub={onScrub}
					onglossary={openGlossary}
				/>
			</div>
		</div>
	</main>

	{#if rightOpen}
		<aside class="sidebar-right" aria-labelledby="controls-title">
			<div class="sidebar-inner">
				<Controls
					{method}
					{engine}
					{euler}
					{clamp}
					{showRings}
					{showAxes}
					{showGizmo}
					{axisRaw}
					{angle}
					{negate}
					{qLength}
					{aligned}
					{space}
					{orthonormalize}
					{driftRunning}
					{fireOwn}
					{target}
					{smooth}
					{turnRate}
					{clampElevation}
					{active}
					{progress}
					{playing}
					timed={active in TIMED}
					act={actions}
				/>
				<Readout
					{method}
					{engine}
					q={qShown}
					cols={viewCols}
					{target}
					{degenerate}
					{active}
					onglossary={openGlossary}
				/>
			</div>
			{@render footer()}
		</aside>
	{/if}
</div>

<Glossary bind:isOpen={glossaryOpen} bind:section={glossarySection} />

<p class="visually-hidden" role="status" aria-live="polite">{announcement}</p>

<style>
	.stage {
		height: 100%;
		display: grid;
		/* The code row is as tall as the code panel says: --code-size, at
		   most a third of the window, or just its header when folded. */
		grid-template-rows: minmax(16rem, 1fr) auto;
		/* An explicit column. The implicit one is `auto`, and a code line (pre,
		   no wrapping) then widens the whole stage past its track - the canvas,
		   being positioned, painted over the controls rail (MISTAKES.md). */
		grid-template-columns: minmax(0, 1fr);
	}

	.views {
		position: relative;
		min-height: 0;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
	}

	.views.split {
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 1px;
		background: var(--panel-border);
	}

	.view {
		position: relative;
		min-width: 0;
		min-height: 0;
	}

	.view-title {
		position: absolute;
		top: 0.6rem;
		left: 2.4rem;
		z-index: 2;
		margin: 0;
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--text-primary);
		background: var(--glass-bg);
		border: 1px solid var(--panel-border);
		border-radius: 99px;
		padding: 0.2rem 0.75rem;
		pointer-events: none;
	}

	.view-title.with-toggle {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		pointer-events: auto;
		left: 0.6rem;
		padding-right: 0.3rem;
	}

	.view-title h2 {
		font-size: inherit;
		margin: 0;
	}

	.align {
		border: 1px solid var(--control-border);
		background: var(--bg-secondary);
		border-radius: 99px;
		padding: 0.1rem 0.6rem;
		font-size: 0.74rem;
		font-weight: 600;
		color: var(--text-secondary);
	}

	.align[aria-pressed="true"] {
		background: var(--accent);
		border-color: var(--accent);
		color: var(--accent-text);
	}

	/* The toolbar keeps its place at the top right in every method, so in the
	   split layout the 4D view's title sits below it, and its hint at the
	   bottom, where the toolbar used to go: under the title, a narrow view
	   wrapped the hint over the sphere's "up" label. The toolbar used to drop
	   to the bottom instead, and the learner saw it jump. */
	.views.split .view + .view .view-title {
		top: 3.1rem;
	}

	.view-hint {
		position: absolute;
		left: 0.6rem;
		right: 0.6rem;
		bottom: 0.6rem;
		margin: 0;
		font-size: 0.72rem;
		color: var(--text-secondary);
		text-align: center;
		pointer-events: none;
	}

	.float-toolbar {
		position: absolute;
		top: 0.6rem;
		right: 2.4rem;
		z-index: 5;
		display: flex;
		gap: 0.35rem;
		align-items: center;
	}

	.float-toolbar button,
	.float-toolbar select {
		background: var(--glass-bg);
		backdrop-filter: blur(6px);
		border: 1px solid var(--control-border);
		border-radius: 99px;
		padding: 0.3rem 0.75rem;
		font-size: 0.78rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.float-toolbar button:hover,
	.float-toolbar select:hover {
		border-color: var(--accent);
	}

	.float-toolbar button[aria-pressed="true"] {
		background: var(--accent);
		border-color: var(--accent);
		color: var(--accent-text);
	}

	.kb-hint {
		position: absolute;
		left: 50%;
		bottom: 0.7rem;
		transform: translateX(-50%);
		z-index: 4;
		margin: 0;
		max-width: calc(100% - 9rem);
		text-align: center;
		pointer-events: none;
	}

	.views.split .kb-hint {
		display: none;
	}

	.code {
		position: relative;
		min-height: 0;
		min-width: 0;
		height: var(--code-size);
	}

	.code.closed {
		height: auto;
	}

	/* A 10px grab strip across the panel's top edge, half over the view, with
	   a grip in the middle that turns accent on hover and focus. */
	.code-resizer {
		position: absolute;
		left: 0;
		right: 0;
		top: -5px;
		height: 10px;
		z-index: 6;
		cursor: row-resize;
		touch-action: none;
	}

	.code-resizer::after {
		content: "";
		position: absolute;
		left: 50%;
		top: 3px;
		width: 44px;
		height: 4px;
		margin-left: -22px;
		border-radius: 99px;
		background: var(--control-border);
	}

	.code-resizer:hover::after,
	.code-resizer:focus-visible::after {
		background: var(--accent);
	}

	.model-credit {
		position: absolute;
		top: 0.6rem;
		left: 2.4rem;
		z-index: 2;
		margin: 0;
		font-size: 0.7rem;
		color: var(--text-secondary);
		background: var(--glass-bg);
		border: 1px solid var(--panel-border);
		border-radius: 99px;
		padding: 0.15rem 0.6rem;
	}

	.views.split .model-credit {
		top: 2.6rem;
	}

	.app-footer .badge {
		margin-top: 0.3rem;
	}

	@media (max-width: 899px) {
		.canvas-panel {
			order: 1;
			min-height: 0;
		}

		.sidebar-right {
			order: 2;
		}

		.sidebar-left {
			order: 3;
		}

		.stage {
			grid-template-rows: auto auto;
		}

		.views {
			height: 64vh;
			min-height: 20rem;
		}

		.views.split {
			grid-template-columns: minmax(0, 1fr);
			grid-template-rows: 1fr 1fr;
			height: 115vh;
		}

		.code {
			height: 60vh;
			min-height: 18rem;
		}

		/* The page scrolls on a phone, so the panel keeps its size; it can
		   still fold. And the views stack, so nothing sits above the 4D title. */
		.code.closed {
			height: auto;
			min-height: 0;
		}

		.code-resizer {
			display: none;
		}

		.views.split .view + .view .view-title {
			top: 0.6rem;
		}

		.float-toolbar {
			right: 0.6rem;
			flex-wrap: wrap;
			justify-content: flex-end;
		}

		.kb-hint {
			display: none;
		}
	}
</style>
