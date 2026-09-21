<script>
/**
 * The right rail: the method list, the controls for the current method, and
 * its "Break it" cards - laid out like every house tool's control rail
 * (section headers with a glossary button, control groups, rule cards).
 * Input only: every change goes through `act`, and App.svelte decides what it
 * means.
 */
import { num } from "./code.js";
import { t } from "./i18n/index.svelte.js";
import { DEG, engineEuler, engineQuat, fromAxisAngle, normalize3 } from "./rotation.js";

let {
	method,
	engine,
	euler,
	clamp,
	showRings,
	showAxes,
	showGizmo,
	axisRaw,
	angle,
	negate,
	qLength,
	aligned,
	space,
	orthonormalize,
	driftRunning,
	fireOwn,
	target,
	smooth,
	turnRate,
	clampElevation,
	active,
	progress,
	playing,
	timed,
	act,
} = $props();

const METHODS = ["euler", "quat", "basis", "lookat"];
const METHOD_GLOSSARY = { euler: "euler", quat: "quaternion", basis: "basis", lookat: "look-at" };

const EULER_FIELDS = {
	godot: { pitch: "x", yaw: "y", roll: "z" },
	unity: { pitch: "x", yaw: "y", roll: "z" },
	unreal: { pitch: "Pitch", yaw: "Yaw", roll: "Roll" },
};

const typed = $derived(engineEuler(engine, euler));
const typedOf = (key) => typed[{ pitch: 0, yaw: 1, roll: 2 }[key]];

const displayAxis = $derived(normalize3([axisRaw[0], axisRaw[1], -axisRaw[2]]) ?? [0, 1, 0]);
const qEngine = $derived.by(() => {
	const q = fromAxisAngle(displayAxis, angle * DEG);
	return engineQuat(engine, negate ? q.map((c) => -c) : q);
});

const BREAKS = {
	euler: ["gimbal", "longway"],
	quat: ["fullpath", "negate", "unnormalised"],
	basis: ["drift", "worldconst"],
	lookat: ["overhead"],
};

const ICONS = {
	gimbal: "fa-lock",
	longway: "fa-route",
	fullpath: "fa-arrows-rotate",
	negate: "fa-circle-half-stroke",
	unnormalised: "fa-ruler-combined",
	drift: "fa-arrows-spin",
	worldconst: "fa-compass",
	overhead: "fa-location-crosshairs",
	slerp: "fa-play",
	apply: "fa-layer-group",
};

const TURNS = [
	["pitch", 15, "turnPitchUp"],
	["pitch", -15, "turnPitchDown"],
	["yaw", -15, "turnYawLeft"],
	["yaw", 15, "turnYawRight"],
	["roll", -15, "turnRollLeft"],
	["roll", 15, "turnRollRight"],
];
</script>

{#snippet help(section, label)}
	<button type="button" class="glossary-btn" aria-label={t("glossaryFor", { topic: label })} onclick={() => act.glossary(section)}>?</button>
{/snippet}

{#snippet header(id, title, section)}
	<header class="section-header">
		<h2 {id}>{title}</h2>
		{@render help(section, title)}
	</header>
{/snippet}

{#snippet slider(id, label, hint, value, min, max, step, unit, onchange, digits = 1)}
	<div class="control-group">
		<div class="label-row">
			<label for={id}>{label}</label>
			<output for={id}>{num(value, digits)}{unit}</output>
		</div>
		<input
			{id}
			type="range"
			{min}
			{max}
			{step}
			value={Math.max(min, Math.min(max, value))}
			aria-describedby={hint ? `${id}-hint` : undefined}
			oninput={(event) => onchange(Number(event.currentTarget.value))}
		/>
		{#if hint}<p class="hint" id="{id}-hint">{hint}</p>{/if}
	</div>
{/snippet}

{#snippet check(id, label, hint, checked, onchange)}
	<label class="toggle-label" for={id}>
		<input {id} type="checkbox" {checked} aria-describedby={hint ? `${id}-hint` : undefined} onchange={(event) => onchange(event.currentTarget.checked)} />
		<span>
			{label}
			{#if hint}<span class="hint block" id="{id}-hint">{hint}</span>{/if}
		</span>
	</label>
{/snippet}

{#snippet player()}
	<div class="player" role="group" aria-label={t("playerLabel")}>
		<button type="button" class="clear-btn primary" onclick={act.togglePlay}>
			<i class="fa-solid {playing ? 'fa-pause' : 'fa-play'}" aria-hidden="true"></i>
			{playing ? t("pause") : progress >= 1 ? t("replay") : t("play")}
		</button>
		<label class="visually-hidden" for="scrub">{t("progressLabel")}</label>
		<input id="scrub" type="range" min="0" max="1" step="0.005" value={progress} oninput={(event) => act.seek(Number(event.currentTarget.value))} />
		<output for="scrub">{Math.round(progress * 100)}%</output>
	</div>
{/snippet}

{#snippet card(id, explore = false)}
	<article class="rule-card {explore ? 'card-blue' : 'card-red'}" aria-labelledby="card-{id}">
		<div class="rule-icon {explore ? 'icon-blue' : 'icon-red'}">
			<i class="fa-solid {ICONS[id]}" aria-hidden="true"></i>
		</div>
		<div class="rule-body">
			<h3 id="card-{id}" class={explore ? "color-blue" : "color-red"}>{t(`break.${id}.title`)}</h3>
			<p>{t(`break.${id}.body`)}</p>
			{#if active === id}
				{#if timed}{@render player()}{/if}
				{#if id === "unnormalised"}
					{@render slider("qlen", t("qLength"), t("qLengthHint"), qLength, 0.6, 1.4, 0.01, "", act.setQLength, 2)}
				{:else if id === "drift"}
					<button type="button" class="clear-btn" onclick={act.toggleDrift}>
						<i class="fa-solid {driftRunning ? 'fa-pause' : 'fa-play'}" aria-hidden="true"></i>
						{driftRunning ? t("pause") : t("resume")}
					</button>
					{@render check("ortho", t("orthonormalize"), t("orthonormalizeHint"), orthonormalize, act.setOrthonormalize)}
				{:else if id === "worldconst"}
					<fieldset class="choice">
						<legend>{t("fireAlong")}</legend>
						<label class="toggle-label"><input type="radio" name="fire" checked={!fireOwn} onchange={() => act.setFireOwn(false)} /> ✗ {t("rayWorld")}</label>
						<label class="toggle-label"><input type="radio" name="fire" checked={fireOwn} onchange={() => act.setFireOwn(true)} /> ✓ {t("rayOwn")}</label>
					</fieldset>
				{/if}
				{#if !explore}
					<p class="fix"><span aria-hidden="true">✓</span> {t(`break.${id}.fix`)}</p>
				{/if}
				<button type="button" class="clear-btn" onclick={act.stop}>
					<i class="fa-solid fa-stop" aria-hidden="true"></i>
					{t("stop")}
				</button>
			{:else}
				<button type="button" class="clear-btn" onclick={() => act.start(id)}>{t(`break.${id}.action`)}</button>
			{/if}
		</div>
	</article>
{/snippet}

<div class="controls-panel">
	{@render header("controls-title", t("methodsHeading"), "methods")}
	<div class="toggle-list">
		{#each METHODS as id, index (id)}
			<button type="button" aria-pressed={method === id} onclick={() => act.selectMethod(id)}>
				<span class="mode-name"><kbd>{index + 1}</kbd> {t(`tab.${id}`)}</span>
				<span class="mode-sub">{t(`tabSub.${id}`)}</span>
			</button>
		{/each}
	</div>

	{@render header("method-controls", t(`controls.${method}`), METHOD_GLOSSARY[method])}

	{#if method === "euler"}
		{#each ["yaw", "pitch", "roll"] as key (key)}
			{@render slider(
				key,
				t(key),
				`${t(`${key}Hint`)} · ${t(`engineShort.${engine}`)}: ${EULER_FIELDS[engine][key]} = ${num(typedOf(key))}`,
				euler[key],
				key === "pitch" && clamp ? -89 : -180,
				key === "pitch" && clamp ? 89 : 180,
				1,
				"°",
				(v) => act.setEuler(key, v),
			)}
		{/each}
		{@render check("clamp", t("clampPitch"), t("clampPitchHint"), clamp, act.setClamp)}
		{@render check("rings", t("showRings"), t("showRingsHint"), showRings, act.setShowRings)}
		{@render check("axes", t("showAxes"), null, showAxes, act.setShowAxes)}
	{:else if method === "quat"}
		<div class="action-row" role="group" aria-label={t("axisPresets")}>
			<button type="button" class="clear-btn" onclick={() => act.axisPreset([1, 0, 0])}>{t("axisRight")}</button>
			<button type="button" class="clear-btn" onclick={() => act.axisPreset([0, 1, 0])}>{t("axisUp")}</button>
			<button type="button" class="clear-btn" onclick={() => act.axisPreset([0, 0, 1])}>{t("axisForward")}</button>
			<button type="button" class="clear-btn" onclick={() => act.axisPreset([1, 1, 1])}>{t("axisDiagonal")}</button>
		</div>
		{#each [["axisRight", 0], ["axisUp", 1], ["axisForward", 2]] as [key, index] (key)}
			{@render slider(`ax${index}`, `${t("axis")} · ${t(key)}`, null, axisRaw[index], -1, 1, 0.05, "", (v) => act.setAxis(index, v), 2)}
		{/each}
		{@render slider("angle", t("angle"), t("angleHint"), angle, 0, 720, 1, "°", act.setAngle, 0)}
		<div class="formula-block small" aria-label={t("formulaLabel")}>
			<div>w = cos(θ/2) = {num(qEngine[3], 3)}</div>
			<div>(x, y, z) = ({num(qEngine[0], 3)}, {num(qEngine[1], 3)}, {num(qEngine[2], 3)})</div>
		</div>
		<p class="hint">{t("formulaHint", { engine: t(`engineShort.${engine}`) })}</p>
		{@render check("aligned", t("alignViews"), t("alignHint"), aligned, act.toggleAligned)}

		{@render header("slerp-title", t("slerpHeading"), "slerp")}
		<p class="hint">{t("slerpHint")}</p>
		<div class="action-row">
			<button type="button" class="clear-btn" onclick={act.setA}>{t("setA")}</button>
			<button type="button" class="clear-btn" onclick={act.setB}>{t("setB")}</button>
		</div>
		{@render card("slerp", true)}
		{@render card("apply", true)}
	{:else if method === "basis"}
		<fieldset class="choice">
			<legend>{t("spaceLegend")}</legend>
			<label class="toggle-label"><input type="radio" name="space" checked={space === "local"} onchange={() => act.setSpace("local")} /> {t("spaceLocal")}</label>
			<label class="toggle-label"><input type="radio" name="space" checked={space === "world"} onchange={() => act.setSpace("world")} /> {t("spaceWorld")}</label>
		</fieldset>
		<div class="turns" role="group" aria-label={t("turnsLabel")}>
			{#each TURNS as [kind, deg, key] (key)}
				<button type="button" class="clear-btn" onclick={() => act.turn(kind, deg)}>{t(key)}</button>
			{/each}
		</div>
		<p class="hint">{t("turnsHint")}</p>
		{@render check("gizmo", t("showGizmo"), t("showGizmoHint"), showGizmo, act.setShowGizmo)}
		{@render check("axes", t("showAxes"), null, showAxes, act.setShowAxes)}
	{:else}
		{#each [["targetRight", 0, 1], ["targetUp", 1, 1], ["targetForward", 2, -1]] as [key, index, sign] (key)}
			{@render slider(`tg${index}`, t(key), null, sign * target[index], -4.5, 4.5, 0.1, " m", (v) => act.setTarget(index, sign * v))}
		{/each}
		{@render check("smooth", t("smooth"), t("smoothHint"), smooth, act.setSmooth)}
		{#if smooth}
			{@render slider("rate", t("turnRate"), t("turnRateHint"), turnRate, 1, 12, 0.5, "", act.setTurnRate)}
		{/if}
		{@render check("clampel", t("clampElevation"), t("clampElevationHint"), clampElevation, act.setClampElevation)}
	{/if}

	<button type="button" class="reset-btn" onclick={act.reset}>
		<i class="fa-solid fa-rotate-left" aria-hidden="true"></i>
		{t("reset")}
	</button>

	{@render header("break-title", t("breakHeading"), "break-it")}
	<p class="hint">{t("breakIntro")}</p>
	{#each BREAKS[method] as id (id)}
		{@render card(id)}
	{/each}
</div>

<style>
	.toggle-list button {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	/* The house "selected" marker, moved inside the name row: as a flex item
	   of this column it would sit on a line of its own. */
	.toggle-list button[aria-pressed="true"]::before {
		content: none;
	}

	.toggle-list button[aria-pressed="true"] .mode-name::before {
		content: "▸";
		color: var(--accent);
	}

	.mode-name {
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}

	.mode-sub {
		font-size: 0.72rem;
		font-weight: 500;
		color: var(--text-secondary);
		padding-left: 1.6rem;
	}

	.block {
		display: block;
		font-weight: 400;
		margin-top: 0.1rem;
	}

	.formula-block.small {
		font-size: 0.74rem;
		margin: 0.2rem 0 0;
		line-height: 1.7;
		text-align: left;
		overflow-wrap: anywhere;
	}

	.choice {
		border: 1px solid var(--panel-border);
		border-radius: 8px;
		padding: 0.35rem 0.7rem 0.55rem;
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem 1rem;
	}

	.choice legend {
		font-size: 0.78rem;
		font-weight: 700;
		color: var(--text-primary);
		padding: 0 0.25rem;
	}

	.turns {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.35rem;
	}

	.player {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.player input {
		flex: 1;
	}

	.player output {
		font-family: var(--mono);
		font-size: 0.75rem;
		color: var(--text-primary);
	}

	.fix {
		color: var(--good);
		background: var(--green-tint);
		border: 1px solid var(--green);
		border-radius: 6px;
		padding: 0.35rem 0.5rem;
		font-weight: 600;
	}

	.rule-body :global(.clear-btn) {
		align-self: flex-start;
		flex: none;
	}
</style>
