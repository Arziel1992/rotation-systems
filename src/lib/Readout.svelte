<script>
/**
 * The live read-out, laid out like every house tool's telemetry panel: the
 * same orientation four ways, in the chosen engine's own terms, plus the one
 * number the current method is about. Every value carries a name and a unit.
 */
import { num } from "./code.js";
import { t } from "./i18n/index.svelte.js";
import * as R from "./rotation.js";

let { method, engine, q, cols, target, degenerate, active, onglossary } = $props();

const EULER_NAME = {
	godot: "rotation_degrees",
	unity: "transform.eulerAngles",
	unreal: "GetActorRotation()",
};
const EULER_PARTS = { godot: ["x", "y", "z"], unity: ["x", "y", "z"], unreal: ["P", "Y", "R"] };
const QUAT_NAME = { godot: "quaternion", unity: "transform.rotation", unreal: "GetActorQuat()" };

// Which semantic axis each engine letter is, for the matrix headings.
const LETTER_MEANING = {
	godot: ["axisRight", "axisUp", "axisBack"],
	unity: ["axisRight", "axisUp", "axisForward"],
	unreal: ["axisForward", "axisRight", "axisUp"],
};

const unit = $derived(R.normalize(q));
const back = $derived(R.readBack(engine, unit));
const quat = $derived(R.engineQuat(engine, q));
const aa = $derived(R.toAxisAngle(unit));
const axes = $derived(R.axesOf(unit));

// Columns of the engine's matrix: where the engine's own X, Y and Z end up.
// With an explicit basis (drift, a non-unit quaternion) the dirty columns
// are shown as they are - that is the thing being demonstrated.
const matrix = $derived.by(() => {
	const image = (d) => {
		if (!cols) return R.rotate(q, d);
		return [0, 1, 2].map((r) => cols[0][r] * d[0] + cols[1][r] * d[1] + cols[2][r] * d[2]);
	};
	return [0, 1, 2].map((i) => {
		const e = [0, 0, 0];
		e[i] = 1;
		return R.engineVec(engine, image(R.displayVec(engine, e)));
	});
});
const health = $derived(cols ? R.basisHealth(matrix) : null);

const vec = (v, d = 2) => `(${v.map((c) => num(c, d)).join(", ")})`;
const freedom = $derived(R.freedomLeft(R.toEuler(unit).pitch));
const upAngle = $derived(target ? R.upHintAngle(target) : 0);
const length = $derived(R.length4(q));
</script>

<section class="telemetry-panel" aria-labelledby="readout-heading">
	<header class="telem-header">
		<h2 id="readout-heading">{t("readoutHeading")}</h2>
		<button type="button" class="glossary-btn" aria-label={t("glossaryFor", { topic: t("readoutHeading") })} onclick={() => onglossary("read-back")}>?</button>
	</header>
	<p class="hint intro">{t("readoutIntro", { engine: t(`engineShort.${engine}`) })}</p>

	<div class="telem-grid">
		<div class="telem-item wide">
			<span class="label">{t("readEuler")} · <code>{EULER_NAME[engine]}</code></span>
			<span class="value mono">
				{#each back as value, i (i)}<span class="pair"><span class="k">{EULER_PARTS[engine][i]}</span>{num(value)}°</span>{/each}
			</span>
		</div>

		<div class="telem-item wide">
			<span class="label">{t("readQuat")} · <code>{QUAT_NAME[engine]}</code></span>
			<span class="value mono">
				{#each ["x", "y", "z", "w"] as key, i (key)}<span class="pair"><span class="k">{key}</span>{num(quat[i], 3)}</span>{/each}
			</span>
		</div>

		<div class="telem-item">
			<span class="label">{t("axis")}</span>
			<span class="value mono">{vec(R.engineVec(engine, aa.axis))}</span>
		</div>
		<div class="telem-item">
			<span class="label">{t("angle")}</span>
			<span class="value mono accent">{num(aa.angle)}°</span>
		</div>

		{#each [["axisForward", axes.forward], ["axisRight", axes.right], ["axisUp", axes.up]] as [key, v] (key)}
			<div class="telem-item">
				<span class="label">{t(key)}</span>
				<span class="value mono">{vec(R.engineVec(engine, v))}</span>
			</div>
		{/each}

		{#if method === "euler"}
			<div class="telem-item" class:bad={freedom < 1}>
				<span class="label">{t("freedom")}</span>
				<span class="value mono">{num(freedom)}°{#if freedom < 1} ✗{/if}</span>
			</div>
		{:else if method === "quat"}
			<div class="telem-item" class:bad={Math.abs(length - 1) > 0.005}>
				<span class="label">{t("qNorm")}</span>
				<span class="value mono">{num(length, 3)}{#if Math.abs(length - 1) > 0.005} ✗{/if}</span>
			</div>
		{:else if method === "lookat" && target}
			<div class="telem-item" class:bad={degenerate || upAngle < 2}>
				<span class="label">{t("upAngle")}</span>
				<span class="value mono">{num(upAngle)}°{#if degenerate} ✗{/if}</span>
			</div>
		{/if}
	</div>

	{#if method === "euler"}
		<p class="note" class:bad={freedom < 1}>
			{#if freedom < 1}✗ {t("freedomLocked")}.{/if}
			{t("freedomHint")}
		</p>
	{:else if method === "quat" && Math.abs(length - 1) > 0.005}
		<p class="note bad">✗ {t("qNotUnit")}</p>
	{:else if method === "lookat" && target}
		<p class="note" class:bad={degenerate}>
			{#if degenerate}✗ {t("degenerateNow")}. {/if}{t("distance")}:
			{num(R.len3(target) * R.unitsPerMetre(engine), engine === "unreal" ? 0 : 2)}
			{engine === "unreal" ? "cm" : "m"}
		</p>
	{/if}

	{#if method === "basis"}
		<table>
			<caption>{t("matrixCaption", { engine: t(`engineShort.${engine}`) })}</caption>
			<thead>
				<tr>
					<td></td>
					{#each ["X", "Y", "Z"] as letter, i (letter)}
						<th scope="col">{letter} · {t(LETTER_MEANING[engine][i])}</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each ["x", "y", "z"] as row, r (row)}
					<tr>
						<th scope="row">{row}</th>
						{#each matrix as column, c (c)}
							<td>{num(column[r], 3)}</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
		{#if health}
			<p class="note" class:bad={health.lengths.some((l) => Math.abs(l - 1) > 0.005)}>
				{t("healthLengths")}: {health.lengths.map((l) => num(l, 3)).join(" · ")}<br />
				{t("healthCorners")}: {health.angles.map((a) => `${num(a)}°`).join(" · ")}
			</p>
		{/if}
	{/if}
	{#if active}
		<p class="hint">{t("readoutScenario")}</p>
	{/if}
</section>

<style>
	.telemetry-panel {
		margin-top: 1.25rem;
	}

	.telem-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid var(--panel-border);
		padding-bottom: 0.4rem;
		margin-bottom: 0.6rem;
	}

	.telem-header h2 {
		font-size: 0.72rem;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 1.5px;
		margin: 0;
		font-weight: 700;
	}

	.intro {
		margin-bottom: 0.7rem;
	}

	.telem-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.8rem 0.8rem;
	}

	.telem-item {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		min-width: 0;
	}

	.telem-item.wide {
		grid-column: 1 / -1;
	}

	.label {
		font-size: 0.68rem;
		color: var(--text-secondary);
		font-weight: 500;
	}

	.label code {
		font-size: 0.66rem;
	}

	.value {
		font-size: 0.95rem;
		font-weight: 800;
		color: var(--text-primary);
		display: flex;
		flex-wrap: wrap;
		gap: 0.1rem 0.7rem;
	}

	.mono {
		font-family: var(--mono);
		font-size: 0.8rem;
	}

	.accent {
		color: var(--accent);
	}

	.k {
		color: var(--text-secondary);
		font-weight: 500;
		margin-right: 0.3rem;
	}

	.bad .value,
	.note.bad {
		color: var(--bad);
	}

	.note {
		margin: 0.8rem 0 0;
		font-size: 0.76rem;
		color: var(--text-secondary);
		border-left: 3px solid var(--green);
		padding: 0.25rem 0.5rem;
		background: var(--green-tint);
		border-radius: 0 6px 6px 0;
	}

	.note.bad {
		border-left-color: var(--red);
		background: var(--red-tint);
		font-weight: 600;
	}

	table {
		margin-top: 0.9rem;
		border-collapse: collapse;
		font-size: 0.75rem;
		width: 100%;
		table-layout: fixed;
	}

	caption {
		text-align: left;
		font-size: 0.72rem;
		color: var(--text-secondary);
		margin-bottom: 0.3rem;
	}

	th,
	td {
		border: 1px solid var(--panel-border);
		padding: 0.2rem 0.3rem;
		text-align: right;
		color: var(--text-primary);
	}

	th {
		font-weight: 600;
		font-size: 0.68rem;
	}

	td {
		font-family: var(--mono);
	}
</style>
