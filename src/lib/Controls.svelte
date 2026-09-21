<script>
/**
 * The right rail: the controls for the current tab, and its "Break it" cards.
 * Input only - every change goes through `act`, and App.svelte decides what
 * it means. Nothing here touches the orientation directly.
 */
import { num } from "./code.js";
import { t } from "./i18n/index.svelte.js";
import { engineEuler, engineQuat, fromAxisAngle, DEG, normalize3 } from "./rotation.js";

let {
	method,
	engine,
	euler,
	clamp,
	showRings,
	showAxes,
	axisRaw,
	angle,
	negate,
	qLength,
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

const TURNS = [
	["pitch", 15, "turnPitchUp"],
	["pitch", -15, "turnPitchDown"],
	["yaw", -15, "turnYawLeft"],
	["yaw", 15, "turnYawRight"],
	["roll", -15, "turnRollLeft"],
	["roll", 15, "turnRollRight"],
];
</script>

{#snippet slider(id, label, hint, value, min, max, step, unit, onchange, digits = 1)}
	<div class="field">
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
	<div class="check">
		<input {id} type="checkbox" {checked} aria-describedby={hint ? `${id}-hint` : undefined} onchange={(event) => onchange(event.currentTarget.checked)} />
		<div>
			<label for={id}>{label}</label>
			{#if hint}<p class="hint" id="{id}-hint">{hint}</p>{/if}
		</div>
	</div>
{/snippet}

{#snippet player()}
	<div class="player" role="group" aria-label={t("playerLabel")}>
		<button type="button" class="primary" onclick={act.togglePlay}>
			{playing ? t("pause") : progress >= 1 ? t("replay") : t("play")}
		</button>
		<label class="visually-hidden" for="scrub">{t("progressLabel")}</label>
		<input id="scrub" type="range" min="0" max="1" step="0.005" value={progress} oninput={(event) => act.seek(Number(event.currentTarget.value))} />
		<output for="scrub">{Math.round(progress * 100)}%</output>
	</div>
{/snippet}

{#snippet card(id, explore = false)}
	<article class="card" class:on={active === id} class:explore aria-labelledby="card-{id}">
		<h3 id="card-{id}">
			<span aria-hidden="true">{explore ? "▸" : "✗"}</span>
			{t(`break.${id}.title`)}
		</h3>
		<p>{t(`break.${id}.body`)}</p>
		{#if active === id}
			{#if timed}{@render player()}{/if}
			{#if id === "unnormalised"}
				{@render slider("qlen", t("qLength"), t("qLengthHint"), qLength, 0.6, 1.4, 0.01, "", act.setQLength, 2)}
			{:else if id === "drift"}
				<button type="button" onclick={act.toggleDrift}>{driftRunning ? t("pause") : t("resume")}</button>
				{@render check("ortho", t("orthonormalize"), t("orthonormalizeHint"), orthonormalize, act.setOrthonormalize)}
			{:else if id === "worldconst"}
				<fieldset class="choice">
					<legend>{t("fireAlong")}</legend>
					<label><input type="radio" name="fire" checked={!fireOwn} onchange={() => act.setFireOwn(false)} /> ✗ {t("rayWorld")}</label>
					<label><input type="radio" name="fire" checked={fireOwn} onchange={() => act.setFireOwn(true)} /> ✓ {t("rayOwn")}</label>
				</fieldset>
			{/if}
			{#if !explore}
				<p class="fix"><span aria-hidden="true">✓</span> {t(`break.${id}.fix`)}</p>
			{/if}
			<button type="button" onclick={act.stop}>{t("stop")}</button>
		{:else}
			<button type="button" onclick={() => act.start(id)}>{t(`break.${id}.action`)}</button>
		{/if}
	</article>
{/snippet}

<h2 id="controls-heading" class="rail-heading">{t(`controls.${method}`)}</h2>

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
	<div class="presets" role="group" aria-label={t("axisPresets")}>
		<span class="preset-label" aria-hidden="true">{t("axisPresets")}</span>
		<button type="button" onclick={() => act.axisPreset([1, 0, 0])}>{t("axisRight")}</button>
		<button type="button" onclick={() => act.axisPreset([0, 1, 0])}>{t("axisUp")}</button>
		<button type="button" onclick={() => act.axisPreset([0, 0, 1])}>{t("axisForward")}</button>
		<button type="button" onclick={() => act.axisPreset([1, 1, 1])}>{t("axisDiagonal")}</button>
	</div>
	{#each [["axisRight", 0], ["axisUp", 1], ["axisForward", 2]] as [key, index] (key)}
		{@render slider(`ax${index}`, `${t("axis")} · ${t(key)}`, null, axisRaw[index], -1, 1, 0.05, "", (v) => act.setAxis(index, v), 2)}
	{/each}
	{@render slider("angle", t("angle"), t("angleHint"), angle, 0, 720, 1, "°", act.setAngle, 0)}
	<div class="formula" aria-label={t("formulaLabel")}>
		<p><code>w = cos(θ/2) = {num(qEngine[3], 3)}</code></p>
		<p><code>(x, y, z) = axis · sin(θ/2) = ({num(qEngine[0], 3)}, {num(qEngine[1], 3)}, {num(qEngine[2], 3)})</code></p>
		<p class="hint">{t("formulaHint", { engine: t(`engineShort.${engine}`) })}</p>
	</div>
	<h3 class="sub">{t("slerpHeading")}</h3>
	<p class="hint">{t("slerpHint")}</p>
	<div class="row">
		<button type="button" onclick={act.setA}>{t("setA")}</button>
		<button type="button" onclick={act.setB}>{t("setB")}</button>
	</div>
	{@render card("slerp", true)}
	{@render card("apply", true)}
{:else if method === "basis"}
	<fieldset class="choice">
		<legend>{t("spaceLegend")}</legend>
		<label><input type="radio" name="space" checked={space === "local"} onchange={() => act.setSpace("local")} /> {t("spaceLocal")}</label>
		<label><input type="radio" name="space" checked={space === "world"} onchange={() => act.setSpace("world")} /> {t("spaceWorld")}</label>
	</fieldset>
	<div class="turns" role="group" aria-label={t("turnsLabel")}>
		{#each TURNS as [kind, deg, key] (key)}
			<button type="button" onclick={() => act.turn(kind, deg)}>{t(key)}</button>
		{/each}
	</div>
	<p class="hint">{t("turnsHint")}</p>
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

<button type="button" class="reset" onclick={act.reset}>{t("reset")}</button>

<h2 class="rail-heading">{t("breakHeading")}</h2>
<p class="hint">{t("breakIntro")}</p>
{#each BREAKS[method] as id (id)}
	{@render card(id)}
{/each}

<style>
	.field {
		margin-bottom: 0.7rem;
	}

	.label-row {
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
		font-weight: 600;
		font-size: 0.9rem;
	}

	output {
		font-family: var(--mono);
		font-weight: 600;
		color: var(--accent);
		white-space: nowrap;
	}

	.hint {
		margin: 0.15rem 0 0;
		font-size: 0.8rem;
		color: var(--muted);
	}

	.check {
		display: flex;
		gap: 0.5rem;
		align-items: flex-start;
		margin: 0.55rem 0;
		font-size: 0.9rem;
	}

	.check input {
		margin-top: 0.2rem;
		flex-shrink: 0;
	}

	.check label {
		font-weight: 600;
	}

	.presets,
	.row,
	.turns {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		align-items: center;
		margin-bottom: 0.7rem;
	}

	.turns {
		display: grid;
		grid-template-columns: 1fr 1fr;
	}

	.preset-label {
		font-size: 0.85rem;
		font-weight: 600;
		margin-right: 0.2rem;
	}

	.formula {
		background: var(--code-bg);
		border: 1px solid var(--line-soft);
		border-radius: 8px;
		padding: 0.5rem 0.65rem;
		margin: 0.4rem 0 0.8rem;
		font-size: 0.8rem;
	}

	.formula p {
		margin: 0.15rem 0;
	}

	.formula code {
		color: var(--text);
		overflow-wrap: anywhere;
	}

	.sub {
		font-size: 0.92rem;
		margin: 1rem 0 0.25rem;
	}

	.choice {
		border: 1px solid var(--line-soft);
		border-radius: 8px;
		padding: 0.35rem 0.7rem 0.55rem;
		margin: 0 0 0.7rem;
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem 1rem;
		font-size: 0.9rem;
	}

	.choice legend {
		font-weight: 600;
		padding: 0 0.25rem;
	}

	.choice label {
		display: flex;
		gap: 0.35rem;
		align-items: center;
	}

	.reset {
		margin-top: 0.3rem;
	}

	.card {
		border: 1px solid var(--line-soft);
		border-left: 4px solid var(--bad);
		border-radius: 8px;
		padding: 0.55rem 0.75rem 0.7rem;
		margin: 0.6rem 0;
		background: var(--surface);
	}

	.card.explore {
		border-left-color: var(--accent);
	}

	.card.on {
		background: var(--bad-bg);
	}

	.card.explore.on {
		background: var(--surface-2);
	}

	.card h3 {
		margin: 0 0 0.25rem;
		font-size: 0.93rem;
	}

	.card h3 span {
		color: var(--bad);
	}

	.card.explore h3 span {
		color: var(--accent);
	}

	.card p {
		margin: 0 0 0.5rem;
		font-size: 0.86rem;
	}

	.fix {
		color: var(--good);
		background: var(--good-bg);
		border-radius: 6px;
		padding: 0.35rem 0.5rem;
		font-weight: 600;
	}

	.player {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		margin: 0.4rem 0 0.6rem;
	}

	.player input {
		flex: 1;
	}
</style>
