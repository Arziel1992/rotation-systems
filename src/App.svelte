<script>
/**
 * Rotation Systems — the shell and the owner of all state.
 *
 * One orientation, `q`, shared by every tab and held in the display frame
 * (see rotation.js). Each tab is a different way of SETTING it - three angles,
 * an axis and an angle, turns about the object's own axes, or a direction to
 * look along - and the code panel writes the same pose in the chosen engine.
 *
 * "Break it" scenarios are driven from here: a timed one plays over a few
 * seconds and can be paused and scrubbed; with reduced motion it does not
 * autoplay, and the learner scrubs it instead.
 */
import { onMount } from "svelte";
import { version } from "../package.json";
import CodePanel from "./lib/CodePanel.svelte";
import Controls from "./lib/Controls.svelte";
import Hypersphere from "./lib/Hypersphere.svelte";
import { LOCALE_NAMES, locale, setLocale, t } from "./lib/i18n/index.svelte.js";
import Readout from "./lib/Readout.svelte";
import * as R from "./lib/rotation.js";
import Theory from "./lib/Theory.svelte";
import Viewport from "./lib/Viewport.svelte";

const METHODS = ["euler", "quat", "basis", "lookat"];
const POSE = { yaw: 35, pitch: 20, roll: 10 };
const TARGET = [2, 1, -3];
/** Scenarios that play over time, and how long each takes, in seconds. */
const TIMED = { gimbal: 9, longway: 4, apply: 4, slerp: 3, fullpath: 4, overhead: 6 };
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
let theoryOpen = $state(document.documentElement.dataset.theory !== "hidden");
// Held as state, not read from the DOM in the template, so the button's
// pressed state re-renders when it changes (a lesson from the trace player).
let dark = $state(document.documentElement.dataset.theme === "dark");

/* The one orientation every tab sets. */
let q = $state(R.fromEuler(POSE));

/* Euler tab */
let euler = $state({ ...POSE });
let clamp = $state(true);
let showRings = $state(true);
let showAxes = $state(true);

/* Quaternion tab. The axis sliders are right / up / forward. */
let axisRaw = $state([1, 1, 1]);
let angle = $state(120);
let negate = $state(false);
let slerpA = $state([...R.IDENTITY]);
let slerpB = $state(R.fromAxisAngle([1, 1, 1], 120 * R.DEG));
let qLength = $state(1.3);

/* Basis tab */
let space = $state("local");
let lastTurn = $state({ kind: "yaw", deg: 15, space: "local" });
let cols = $state(null);
let driftRunning = $state(false);
let orthonormalize = $state(false);
let fireOwn = $state(false);

/* Look-at tab */
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

/** A new orientation from a drag or a key, reflected back into the tab. */
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

function setEuler(key, value) {
	stopScenario();
	const next = { ...euler, [key]: value };
	if (clamp) next.pitch = Math.max(-89, Math.min(89, next.pitch));
	euler = next;
	q = R.fromEuler(next);
}

function setAxis(index, value) {
	stopScenario();
	const next = [...axisRaw];
	next[index] = value;
	axisRaw = next;
	q = quatFromTab();
}

function axisPreset(raw) {
	stopScenario();
	axisRaw = raw;
	q = quatFromTab();
}

function setAngle(value) {
	stopScenario();
	angle = value;
	q = quatFromTab();
}

function turn(kind, deg) {
	stopScenario();
	const step = R.fromEuler({ yaw: 0, pitch: 0, roll: 0, [kind]: deg });
	lastTurn = { kind, deg, space };
	setOrientation(space === "local" ? R.mul(q, step) : R.mul(step, q));
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
}

function onTabKey(event, index) {
	const moves = { ArrowRight: 1, ArrowLeft: -1, Home: -index, End: METHODS.length - 1 - index };
	if (!(event.key in moves)) return;
	event.preventDefault();
	const next = METHODS[(index + moves[event.key] + METHODS.length) % METHODS.length];
	selectMethod(next);
	document.getElementById(`tab-${next}`)?.focus();
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
	} else if (method === "basis") {
		space = "local";
		lastTurn = { kind: "yaw", deg: 15, space: "local" };
		q = R.fromEuler(POSE);
	} else {
		smooth = false;
		clampElevation = false;
		target = [...TARGET];
		aimAtTarget(true);
	}
	announce(t("resetDone"));
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

function onDragTurn(dq) {
	stopScenario();
	setOrientation(R.mul(dq, q));
}

function toggleTheme() {
	dark = !dark;
	const next = dark ? "dark" : "light";
	document.documentElement.dataset.theme = next;
	persist("theme", next);
}

function toggleTheory() {
	theoryOpen = !theoryOpen;
	if (theoryOpen) delete document.documentElement.dataset.theory;
	else document.documentElement.dataset.theory = "hidden";
	persist("theory", theoryOpen ? "shown" : "hidden");
}

/* ------------------------------------------------------ derived for views */

const qShown = $derived(active === "unnormalised" ? q.map((c) => c * qLength) : q);

const noseOf = (quat) => R.scale3(R.axesOf(quat).forward, 1.08);
const nosePath = (at, n = 72) => Array.from({ length: n + 1 }, (_, i) => noseOf(at(i / n)));
const quatPath = (at, n = 96) =>
	Array.from({ length: n + 1 }, (_, i) => R.engineQuat(engine, at(i / n)));

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
	t("viewLabel", {
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
	axis,
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
	setEuler,
	setClamp(on) {
		if (active === "gimbal") stopScenario();
		clamp = on;
		if (on) setEuler("pitch", euler.pitch);
	},
	setShowRings: (on) => (showRings = on),
	setShowAxes: (on) => (showAxes = on),
	setAxis,
	axisPreset,
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

	if (new URLSearchParams(location.search).has("selftest")) {
		import("./lib/rotation.selftest.js").then((m) => m.report());
	}
	return () => cancelAnimationFrame(frame);
});
</script>

<a class="skip-link" href="#main">{t("skipToContent")}</a>

<header class="topbar">
	<div class="brand">
		<h1>{t("title")}</h1>
		<p class="tagline">{t("tagline")}</p>
	</div>
	<div class="toolbar">
		<button type="button" class="toggle" aria-pressed={theoryOpen} onclick={toggleTheory}>
			{t("theoryToggle")}
		</button>
		<label class="visually-hidden" for="locale">{t("languageLabel")}</label>
		<select id="locale" value={locale.current} onchange={(event) => setLocale(event.currentTarget.value)}>
			{#each Object.entries(LOCALE_NAMES) as [code, name] (code)}
				<option value={code} lang={code}>{name}</option>
			{/each}
		</select>
		<button type="button" class="toggle" aria-pressed={dark} onclick={toggleTheme}>
			{t("themeToggle")}
		</button>
	</div>
</header>

<div class="methods">
	<div class="tabs" role="tablist" aria-label={t("methodsLabel")}>
		{#each METHODS as id, index (id)}
			<button
				type="button"
				role="tab"
				id="tab-{id}"
				aria-selected={method === id}
				aria-controls="stage"
				tabindex={method === id ? 0 : -1}
				onclick={() => selectMethod(id)}
				onkeydown={(event) => onTabKey(event, index)}
			>
				{t(`tab.${id}`)}
			</button>
		{/each}
	</div>
</div>

<main id="main" class="layout" class:no-theory={!theoryOpen}>
	{#if theoryOpen}
		<aside class="theory" aria-labelledby="theory-heading">
			<Theory {method} {engine} />
		</aside>
	{/if}

	<div id="stage" class="stage" role="tabpanel" aria-labelledby="tab-{method}">
		<div class="views" class:split={method === "quat"}>
			<div class="view">
				{#if method === "quat"}<h2 class="view-title">{t("objectTitle")}</h2>{/if}
				<Viewport
					{q}
					cols={viewCols}
					{engine}
					{reducedMotion}
					gimbal={method === "euler" && showRings ? euler : null}
					{showAxes}
					{ghosts}
					{trails}
					{axisArrow}
					target={method === "lookat" ? target : null}
					{rays}
					dragObject={method !== "lookat"}
					labels={viewLabels}
					ariaLabel={viewName}
					describedBy="view-hint"
					onturn={onDragTurn}
					ontarget={setTarget}
					onkeydown={onViewKey}
				/>
				<p id="view-hint" class="hint">
					{method === "lookat" ? t("viewHintLookat") : t("viewHint")}
				</p>
			</div>
			{#if method === "quat"}
				<div class="view">
					<h2 class="view-title">{t("hyperTitle")}</h2>
					<Hypersphere
						q={R.engineQuat(engine, qShown)}
						paths={hyperPaths}
						motion={active === "apply" ? progress : null}
						{reducedMotion}
						labels={hyperLabels}
						ariaLabel={t("hyperLabel")}
						describedBy="hyper-hint"
					/>
					<p id="hyper-hint" class="hint">{t("hyperHint")}</p>
				</div>
			{/if}
		</div>
		<div class="code">
			<CodePanel state={codeState} {engine} onengine={setEngine} onannounce={announce} />
		</div>
	</div>

	<aside class="rail" aria-labelledby="controls-heading">
		<Controls
			{method}
			{engine}
			{euler}
			{clamp}
			{showRings}
			{showAxes}
			{axisRaw}
			{angle}
			{negate}
			{qLength}
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
		/>
	</aside>
</main>

<footer class="footer">
	<span>{t("footerMadeWith")} — {t("footerSubject")} — By E. Ketterer</span>
	<span class="badge" title={t("versionTitle")}>v{version}</span>
</footer>

<p class="visually-hidden" role="status" aria-live="polite">{announcement}</p>

<style>
	:global(html),
	:global(body) {
		height: 100%;
	}

	.topbar {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1rem;
		align-items: center;
		justify-content: space-between;
		padding: 0.55rem 1rem;
		background: var(--surface);
		border-bottom: 1px solid var(--line-soft);
	}

	h1 {
		font-size: 1.25rem;
		margin: 0;
	}

	.tagline {
		margin: 0;
		color: var(--muted);
		font-size: 0.88rem;
	}

	.toolbar {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		align-items: center;
	}

	/* Pressed toggles: filled AND a tick, so the state is not colour alone. */
	.toggle[aria-pressed="true"] {
		background: var(--accent);
		color: var(--accent-text);
		border-color: var(--accent);
	}

	.toggle[aria-pressed="true"]::before {
		content: "✓ ";
	}

	.methods {
		padding: 0.35rem 1rem 0;
		background: var(--bg);
		border-bottom: 1px solid var(--line-soft);
	}

	.layout {
		flex: 1;
		min-height: 0;
		display: grid;
		grid-template-columns: minmax(15rem, 21rem) minmax(0, 1fr) minmax(17rem, 23rem);
	}

	.layout.no-theory {
		grid-template-columns: minmax(0, 1fr) minmax(17rem, 23rem);
	}

	.theory,
	.rail {
		min-height: 0;
		overflow-y: auto;
		background: var(--surface);
		padding: 1rem;
	}

	.theory {
		border-right: 1px solid var(--line-soft);
	}

	.rail {
		border-left: 1px solid var(--line-soft);
	}

	.stage {
		min-width: 0;
		min-height: 0;
		display: grid;
		grid-template-rows: minmax(16rem, 1fr) minmax(13rem, 42%);
		/* An explicit column. The implicit one is `auto`, and a code line (pre,
		   no wrapping) then widens the whole stage past its track - the canvas,
		   being positioned, was painting over the controls rail. */
		grid-template-columns: minmax(0, 1fr);
	}

	.views {
		min-height: 0;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
	}

	.views.split {
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 1px;
		background: var(--line-soft);
	}

	.view {
		position: relative;
		min-width: 0;
		min-height: 0;
	}

	.view-title {
		position: absolute;
		top: 0.5rem;
		left: 0.6rem;
		z-index: 2;
		margin: 0;
		font-size: 0.82rem;
		font-weight: 600;
		background: color-mix(in srgb, var(--surface) 88%, transparent);
		border: 1px solid var(--line-soft);
		border-radius: 6px;
		padding: 0.1rem 0.5rem;
		pointer-events: none;
	}

	.hint {
		position: absolute;
		right: 0.6rem;
		bottom: 0.6rem;
		max-width: calc(100% - 9rem);
		margin: 0;
		font-size: 0.75rem;
		color: var(--muted);
		background: color-mix(in srgb, var(--surface) 90%, transparent);
		border: 1px solid var(--line-soft);
		border-radius: 8px;
		padding: 0.2rem 0.6rem;
		pointer-events: none;
	}

	.code {
		min-height: 0;
		min-width: 0;
	}

	.footer {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: 0.4rem 1rem;
		padding: 0.4rem 1rem;
		font-size: 0.8rem;
		color: var(--muted);
		background: var(--surface);
		border-top: 1px solid var(--line-soft);
	}

	/* Desktop: the tool fills the window and each rail scrolls on its own. */
	@media (min-width: 1100px) {
		:global(#app) {
			height: 100vh;
		}
	}

	/* Narrow: one column, page scrolls. The views keep a usable height. */
	@media (max-width: 1099px) {
		.layout,
		.layout.no-theory {
			display: flex;
			flex-direction: column;
		}

		.stage {
			order: 1;
			grid-template-rows: auto auto;
		}

		.views {
			height: 62vh;
			min-height: 20rem;
		}

		.views.split {
			grid-template-columns: minmax(0, 1fr);
			grid-template-rows: 1fr 1fr;
			height: 110vh;
		}

		.code {
			height: 60vh;
			min-height: 18rem;
		}

		.rail {
			order: 2;
			border-left: 0;
			border-top: 1px solid var(--line-soft);
		}

		.theory {
			order: 3;
			border-right: 0;
			border-top: 1px solid var(--line-soft);
		}
	}
</style>
