<script>
/**
 * The same orientation, four ways, in the chosen engine's own terms - plus
 * the one number each tab is about. Every value carries a name and a unit.
 */
import { num } from "./code.js";
import { t } from "./i18n/index.svelte.js";
import * as R from "./rotation.js";

let { method, engine, q, cols, target, degenerate, active } = $props();

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
</script>

<section class="readout" aria-labelledby="readout-heading">
	<h2 id="readout-heading" class="rail-heading">{t("readoutHeading")}</h2>
	<p class="hint">{t("readoutIntro", { engine: t(`engineShort.${engine}`) })}</p>

	<dl>
		<dt>{t("readEuler")} <code>{EULER_NAME[engine]}</code></dt>
		<dd>
			{#each back as value, i (i)}
				<span class="pair"><span class="k">{EULER_PARTS[engine][i]}</span> {num(value)}°</span>
			{/each}
		</dd>

		<dt>{t("readQuat")} <code>{QUAT_NAME[engine]}</code></dt>
		<dd>
			{#each ["x", "y", "z", "w"] as key, i (key)}
				<span class="pair"><span class="k">{key}</span> {num(quat[i], 3)}</span>
			{/each}
		</dd>

		<dt>{t("readAxisAngle")}</dt>
		<dd>
			<span class="pair"><span class="k">{t("axis")}</span> {vec(R.engineVec(engine, aa.axis))}</span>
			<span class="pair"><span class="k">θ</span> {num(aa.angle)}°</span>
		</dd>

		<dt>{t("readAxes")}</dt>
		<dd class="stack">
			<span class="pair"><span class="k">{t("axisForward")}</span> {vec(R.engineVec(engine, axes.forward))}</span>
			<span class="pair"><span class="k">{t("axisRight")}</span> {vec(R.engineVec(engine, axes.right))}</span>
			<span class="pair"><span class="k">{t("axisUp")}</span> {vec(R.engineVec(engine, axes.up))}</span>
		</dd>
	</dl>

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
			<p class="health" class:bad={health.lengths.some((l) => Math.abs(l - 1) > 0.005)}>
				{t("healthLengths")}: {health.lengths.map((l) => num(l, 3)).join(" · ")}<br />
				{t("healthCorners")}: {health.angles.map((a) => `${num(a)}°`).join(" · ")}
			</p>
		{/if}
	{/if}

	{#if method === "euler"}
		<p class="extra" class:bad={freedom < 1}>
			<strong>{t("freedom")}:</strong>
			{num(freedom)}°
			{#if freedom < 1}<span>— ✗ {t("freedomLocked")}</span>{/if}
			<br /><span class="hint">{t("freedomHint")}</span>
		</p>
	{:else if method === "quat"}
		<p class="extra" class:bad={Math.abs(R.length4(q) - 1) > 0.005}>
			<strong>{t("qNorm")}:</strong>
			{num(R.length4(q), 3)}
			{#if Math.abs(R.length4(q) - 1) > 0.005}<span>— ✗ {t("qNotUnit")}</span>{/if}
		</p>
	{:else if method === "lookat" && target}
		<p class="extra" class:bad={degenerate || upAngle < 2}>
			<strong>{t("upAngle")}:</strong>
			{num(upAngle)}°
			{#if degenerate}<span>— ✗ {t("degenerateNow")}</span>{/if}
			<br /><strong>{t("distance")}:</strong>
			{num(R.len3(target) * R.unitsPerMetre(engine), engine === "unreal" ? 0 : 2)}
			{engine === "unreal" ? "cm" : "m"}
		</p>
	{/if}
	{#if active}
		<p class="hint">{t("readoutScenario")}</p>
	{/if}
</section>

<style>
	.readout {
		margin-top: 1.25rem;
		border-top: 1px solid var(--line-soft);
		padding-top: 0.25rem;
	}

	.hint {
		margin: 0 0 0.5rem;
		font-size: 0.8rem;
		color: var(--muted);
	}

	dl {
		margin: 0;
		font-size: 0.86rem;
	}

	dt {
		font-weight: 600;
		margin-top: 0.55rem;
	}

	dt code {
		font-size: 0.78rem;
		font-weight: 500;
		color: var(--muted);
	}

	dd {
		margin: 0.1rem 0 0;
		display: flex;
		flex-wrap: wrap;
		gap: 0.2rem 0.8rem;
		font-family: var(--mono);
		font-size: 0.82rem;
	}

	dd.stack {
		flex-direction: column;
	}

	.k {
		color: var(--muted);
		font-family: var(--sans);
	}

	table {
		margin-top: 0.8rem;
		border-collapse: collapse;
		font-size: 0.8rem;
		width: 100%;
	}

	caption {
		text-align: left;
		font-weight: 600;
		margin-bottom: 0.3rem;
	}

	th,
	td {
		border: 1px solid var(--line-soft);
		padding: 0.2rem 0.35rem;
		text-align: right;
	}

	th {
		font-weight: 600;
		font-size: 0.74rem;
	}

	td {
		font-family: var(--mono);
	}

	.health,
	.extra {
		margin: 0.7rem 0 0;
		font-size: 0.86rem;
		border-left: 4px solid var(--good);
		padding: 0.3rem 0.5rem;
		background: var(--good-bg);
		border-radius: 0 6px 6px 0;
	}

	.health.bad,
	.extra.bad {
		border-left-color: var(--bad);
		background: var(--bad-bg);
	}

	.extra .hint {
		margin: 0;
	}
</style>
