<script>
/**
 * The left rail: the tool's textbook, laid out like every house tool's -
 * a formula block with its terms, then one coloured card per idea, then the
 * engines side by side. Pure content; every word goes through the lookup.
 * Formulas, identifiers and axis letters are notation or code, and are not
 * translated.
 */
import { t } from "./i18n/index.svelte.js";
import { ENGINES } from "./rotation.js";

let { method, engine, onglossary } = $props();

const FORMULA = {
	euler: {
		lines: ["orientation = yaw · pitch · roll"],
		terms: ["yaw", "pitch", "roll", "order"],
	},
	quat: {
		lines: ["q = ( axis · sin(θ/2),  cos(θ/2) )", "|q| = 1"],
		terms: ["axis", "theta", "w", "unit"],
	},
	basis: {
		lines: ["R = [ X′ | Y′ | Z′ ]"],
		terms: ["columns", "orthonormal"],
	},
	lookat: {
		lines: ["forward = normalise(target − position)", "right = normalise(up × back)", "up′ = back × right"],
		terms: ["forward", "hint", "cross"],
	},
};

const TERM_NAME = {
	yaw: "yaw",
	pitch: "pitch",
	roll: "roll",
	order: "·",
	axis: "axis",
	theta: "θ",
	w: "w",
	unit: "|q|",
	columns: "X′ Y′ Z′",
	orthonormal: "R",
	forward: "forward",
	hint: "up",
	cross: "×",
};

// One card per idea: [key, colour, icon].
const CARDS = {
	euler: [
		["e1", "blue", "fa-layer-group"],
		["e2", "red", "fa-lock"],
		["e3", "green", "fa-shield-halved"],
		["e4", "orange", "fa-arrow-right-arrow-left"],
	],
	quat: [
		["q1", "blue", "fa-cube"],
		["q2", "purple", "fa-rotate"],
		["q3", "orange", "fa-circle-half-stroke"],
		["q4", "green", "fa-route"],
		["q5", "purple", "fa-circle-nodes"],
		["q6", "blue", "fa-layer-group"],
	],
	basis: [
		["b1", "blue", "fa-table-cells"],
		["b2", "orange", "fa-compass"],
		["b3", "purple", "fa-earth-americas"],
		["b4", "red", "fa-arrows-spin"],
	],
	lookat: [
		["l1", "blue", "fa-bullseye"],
		["l2", "green", "fa-arrow-up-right-dots"],
		["l3", "red", "fa-location-crosshairs"],
		["l4", "purple", "fa-route"],
	],
};

const GLOSSARY_OF = { euler: "euler", quat: "quaternion", basis: "basis", lookat: "look-at" };

// One row per convention; a cell is either code (shown as-is) or a key.
const TABLE = [
	["rowUp", { code: ["+Y", "+Y", "+Z"] }],
	["rowForward", { code: ["−Z", "+Z", "+X"] }],
	["rowHanded", { key: ["handedRight", "handedLeft", "handedLeft"] }],
	["rowUnit", { key: ["unitMetre", "unitMetre", "unitCentimetre"] }],
	["rowEuler", { code: ["rotation_degrees", "Quaternion.Euler(x, y, z)", "FRotator(P, Y, R)"] }],
	["rowOrder", { key: ["orderGodot", "orderUnity", "orderUnreal"] }],
	["rowStored", { code: ["Basis, Quaternion", "Quaternion", "FQuat"] }],
];

const REFERENCES = [
	["https://eater.net/quaternions", "eater.net/quaternions", "refEater"],
	["https://www.youtube.com/watch?v=zjMuIxRvygQ", "3Blue1Brown", "ref3b1b"],
	[
		"https://docs.unity3d.com/6000.3/Documentation/Manual/QuaternionAndEulerRotationsInUnity.html",
		"Unity",
		"refUnity",
	],
	["https://docs.godotengine.org/en/4.7/tutorials/3d/using_transforms.html", "Godot", "refGodot"],
	[
		"https://dev.epicgames.com/documentation/unreal-engine/coordinate-system-and-spaces-in-unreal-engine",
		"Unreal Engine",
		"refUnreal",
	],
];
</script>

<section class="sidebar-content">
	<header>
		<h1 id="theory-title">{t("title")}</h1>
		<p class="tagline">{t("tagline")}</p>
	</header>

	<div class="md-body">
		<p class="lead">{t("intro")}</p>

		<h2>
			<i class="fa-solid fa-book-open" aria-hidden="true"></i>
			<span>{t("textbookHeading", { method: t(`tab.${method}`) })}</span>
			<button type="button" class="glossary-btn push" aria-label={t("glossaryFor", { topic: t(`tab.${method}`) })} onclick={() => onglossary(GLOSSARY_OF[method])}>?</button>
		</h2>

		<div class="formula-block">
			{#each FORMULA[method].lines as line (line)}<div><code>{line}</code></div>{/each}
		</div>
		<ul class="formula-desc">
			{#each FORMULA[method].terms as term (term)}
				<li><strong>{TERM_NAME[term]}</strong>: {t(`formula.${method}.${term}`)}</li>
			{/each}
		</ul>
		{#if method === "quat"}
			<div class="formula-block"><code>p = (x, y, z) / (1 + w)</code></div>
			<ul class="formula-desc">
				<li><strong>p</strong>: {t("formula.quat.p")}</li>
			</ul>
		{/if}

		{#each CARDS[method] as [key, colour, icon] (key)}
			<div class="rule-card card-{colour}">
				<div class="rule-icon icon-{colour}"><i class="fa-solid {icon}" aria-hidden="true"></i></div>
				<div class="rule-body">
					<h3 class="color-{colour}">{t(`theory.${key}.title`)}</h3>
					<p>{t(`theory.${key}.body`)}</p>
				</div>
			</div>
		{/each}

		<h2>
			<i class="fa-solid fa-code-compare" aria-hidden="true"></i>
			<span>{t("inEngines")}</span>
		</h2>
		<div class="game-cases">
			{#each ENGINES as id (id)}
				<article class:current={engine === id}>
					<h4>
						{t(`engineShort.${id}`)}
						{#if engine === id}<span class="visually-hidden">{t("selectedEngine")}</span><span aria-hidden="true"> ●</span>{/if}
					</h4>
					<p>{t(`engineNote.${method}.${id}`)}</p>
				</article>
			{/each}
		</div>

		<h2>
			<i class="fa-solid fa-list-ol" aria-hidden="true"></i>
			<span>{t("rulesTitle")}</span>
		</h2>
		<div class="rule-card card-green">
			<div class="rule-icon icon-green"><i class="fa-solid fa-lightbulb" aria-hidden="true"></i></div>
			<div class="rule-body">
				<ol class="rules">
					{#each [1, 2, 3, 4] as n (n)}
						<li>{t(`rule${n}`)}</li>
					{/each}
				</ol>
			</div>
		</div>

		<h2>
			<i class="fa-solid fa-table-cells" aria-hidden="true"></i>
			<span>{t("tableTitle")}</span>
		</h2>
		<table>
			<thead>
				<tr>
					<td></td>
					{#each ENGINES as id (id)}
						<th scope="col" class:current={engine === id}>
							{t(`engineShort.${id}`)}
							{#if engine === id}<span class="visually-hidden">{t("selectedEngine")}</span><span aria-hidden="true"> ●</span>{/if}
						</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each TABLE as [row, cells] (row)}
					<tr>
						<th scope="row">{t(row)}</th>
						{#each ENGINES as id, i (id)}
							<td class:current={engine === id}>
								{#if cells.code}<code>{cells.code[i]}</code>{:else}{t(cells.key[i])}{/if}
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>

		<h2>
			<i class="fa-solid fa-book-bookmark" aria-hidden="true"></i>
			<span>{t("refsTitle")}</span>
		</h2>
		<ul class="refs">
			{#each REFERENCES as [href, name, key] (href)}
				<li><a {href} rel="noopener">{name}</a> — {t(key)}</li>
			{/each}
		</ul>
	</div>
</section>

<style>
	header {
		margin-bottom: 1.2rem;
	}

	.lead {
		font-size: 0.9rem;
		color: var(--text-primary);
		background: var(--bg-primary);
		border: 1px solid var(--panel-border);
		border-radius: 10px;
		padding: 0.75rem 0.9rem;
	}

	.push {
		margin-left: auto;
		align-self: center;
	}

	.game-cases article.current {
		border-left-width: 4px;
	}

	.rules {
		margin: 0;
		padding-left: 1.1rem;
		font-size: 0.83rem;
		color: var(--text-primary);
	}

	.rules li {
		margin-bottom: 0.35rem;
	}

	table {
		border-collapse: collapse;
		table-layout: fixed;
		font-size: 0.74rem;
		width: 100%;
	}

	th,
	td {
		border: 1px solid var(--panel-border);
		padding: 0.3rem 0.35rem;
		text-align: left;
		vertical-align: top;
		color: var(--text-primary);
	}

	td code {
		font-size: 0.7rem;
		overflow-wrap: anywhere;
	}

	.current {
		background: var(--blue-tint);
		font-weight: 600;
	}

	.refs {
		padding-left: 1.1rem;
	}

	.refs li {
		font-size: 0.82rem;
		margin-bottom: 0.4rem;
	}
</style>
