<script>
/**
 * The left rail: what this tool is for, the theory for the current tab, the
 * four rules, and the engine conventions side by side. Pure content; every
 * word goes through the lookup. Identifiers and axis letters are code, and
 * are not translated.
 */
import { t } from "./i18n/index.svelte.js";
import { ENGINES } from "./rotation.js";

let { method, engine } = $props();

const SECTIONS = {
	euler: ["e1", "e2", "e3", "e4"],
	quat: ["q1", "q2", "q3", "q4", "q5", "q6"],
	basis: ["b1", "b2", "b3", "b4"],
	lookat: ["l1", "l2", "l3", "l4"],
};

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

<h2 id="theory-heading" class="rail-heading">{t("theoryHeading")}</h2>
<p class="intro">{t("intro")}</p>

<h3>{t(`tab.${method}`)}</h3>
{#each SECTIONS[method] as key (key)}
	<h4>{t(`theory.${key}.title`)}</h4>
	<p>{t(`theory.${key}.body`)}</p>
{/each}

<h3>{t("rulesTitle")}</h3>
<ol>
	{#each [1, 2, 3, 4] as n (n)}
		<li>{t(`rule${n}`)}</li>
	{/each}
</ol>

<h3>{t("tableTitle")}</h3>
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

<h3>{t("refsTitle")}</h3>
<ul class="refs">
	{#each REFERENCES as [href, name, key] (href)}
		<li><a {href} rel="noopener">{name}</a> — {t(key)}</li>
	{/each}
</ul>

<style>
	.intro {
		font-size: 0.92rem;
		background: var(--surface-2);
		border-radius: 8px;
		padding: 0.6rem 0.75rem;
		margin: 0 0 0.5rem;
	}

	h3 {
		font-size: 1rem;
		margin: 1.3rem 0 0.4rem;
		padding-bottom: 0.25rem;
		border-bottom: 1px solid var(--line-soft);
	}

	h4 {
		font-size: 0.9rem;
		margin: 0.9rem 0 0.2rem;
	}

	p,
	li {
		font-size: 0.88rem;
		color: var(--text);
	}

	p {
		margin: 0 0 0.4rem;
	}

	ol,
	ul {
		padding-left: 1.2rem;
		margin: 0.3rem 0;
	}

	li {
		margin-bottom: 0.3rem;
	}

	/* Fixed layout and wrapping code: the table fits the rail at any width,
	   so it never needs a (keyboard-focusable) scroll region. */
	table {
		border-collapse: collapse;
		table-layout: fixed;
		font-size: 0.78rem;
		width: 100%;
	}

	th,
	td {
		border: 1px solid var(--line-soft);
		padding: 0.25rem 0.35rem;
		text-align: left;
		vertical-align: top;
	}

	td code {
		font-size: 0.74rem;
		overflow-wrap: anywhere;
	}

	.current {
		background: var(--surface-2);
		font-weight: 600;
	}

	.refs li {
		font-size: 0.84rem;
	}
</style>
