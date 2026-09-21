<script>
/**
 * The lower half of the stage: the pose on screen, written in the engine the
 * learner picked. Values that come from the pose are highlighted as live;
 * values the learner can change are also DRAGGABLE - drag up or down, or
 * focus one and use the arrow keys - so the code is a control, not only a
 * read-out. Values inside comments are comment text.
 *
 * The drag listens on the window, keyed by the value's id, not on the element:
 * the code re-renders every frame while it is dragged, and a line appearing
 * above (the gimbal-lock warning) would otherwise hand the drag to a different
 * number.
 */
import { generate, LANGUAGE, plain } from "./code.js";
import { highlight } from "./highlight.js";
import { t } from "./i18n/index.svelte.js";
import { ENGINES } from "./rotation.js";
import { PIXELS_PER_STEP, scrubStep } from "./scrub.js";

let { snapshot, engine, onengine, onannounce, onscrub, onglossary } = $props();

const code = $derived(generate({ ...snapshot, engine }));
const lines = $derived(highlight(code, LANGUAGE[engine]));

let dragging = $state(null);

// WAI-ARIA tabs: arrow keys move between engines, Home and End jump.
function onTabKey(event, index) {
	const moves = { ArrowRight: 1, ArrowLeft: -1, Home: -index, End: ENGINES.length - 1 - index };
	if (!(event.key in moves)) return;
	event.preventDefault();
	const next = ENGINES[(index + moves[event.key] + ENGINES.length) % ENGINES.length];
	onengine(next);
	document.getElementById(`engine-${next}`)?.focus();
}

async function copy() {
	try {
		await navigator.clipboard.writeText(plain(code));
		onannounce(t("copied"));
	} catch {
		onannounce(t("copyFailed"));
	}
}

function startDrag(event, id) {
	if (event.button !== 0) return;
	event.preventDefault();
	event.currentTarget.focus();
	const step = scrubStep(id, engine);
	const startY = event.clientY;
	let applied = 0;
	dragging = id;
	const move = (e) => {
		const steps = Math.round((startY - e.clientY) / PIXELS_PER_STEP);
		if (steps !== applied) {
			onscrub(id, (steps - applied) * step);
			applied = steps;
		}
	};
	const up = () => {
		dragging = null;
		window.removeEventListener("pointermove", move);
		window.removeEventListener("pointerup", up);
		window.removeEventListener("pointercancel", up);
	};
	window.addEventListener("pointermove", move);
	window.addEventListener("pointerup", up);
	window.addEventListener("pointercancel", up);
}

const KEY_STEPS = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 10, PageDown: -10 };

function keyScrub(event, id) {
	if (!(event.key in KEY_STEPS)) return;
	event.preventDefault();
	onscrub(id, KEY_STEPS[event.key] * scrubStep(id, engine) * (event.shiftKey ? 10 : 1));
}

/** "Euler value 2", "Target component 1", "Angle" - the slider's name. */
function scrubName(id) {
	const family = id.replace(/[0-9]$/, "");
	const n = Number(id.at(-1)) + 1;
	return t(`scrub.${family}`, { n });
}
</script>

<section class="code-panel" aria-labelledby="code-heading">
	<div class="head">
		<h2 id="code-heading">{t("codeHeading")}</h2>
		<div class="tabs" role="tablist" aria-label={t("enginesLabel")}>
			{#each ENGINES as id, index (id)}
				<button
					type="button"
					role="tab"
					id="engine-{id}"
					aria-selected={engine === id}
					aria-controls="code-body"
					tabindex={engine === id ? 0 : -1}
					onclick={() => onengine(id)}
					onkeydown={(event) => onTabKey(event, index)}
				>
					{t(`engine.${id}`)}
				</button>
			{/each}
		</div>
		<div class="tools">
			<button type="button" class="copy" onclick={copy}>
				<i class="fa-solid fa-copy" aria-hidden="true"></i>
				{t("copy")}
			</button>
			<button type="button" class="glossary-btn" aria-label={t("glossaryFor", { topic: t("codeHeading") })} onclick={() => onglossary("code-panel")}>?</button>
		</div>
	</div>
	<!-- The panel scrolls, so it is focusable (WAI-ARIA tabs: tabindex 0 on
	     the tabpanel); the draggable values inside are focusable too. -->
	<div id="code-body" class="body" role="tabpanel" aria-labelledby="engine-{engine}" tabindex="0">
		<pre aria-label={t("codeRegion", { engine: t(`engine.${engine}`) })}><code
				>{#each lines as line, i (i)}<span class="line"
						>{#each line as token, j (j)}{#if token.cls === "live" && token.id}<span
									class="live scrub"
									class:dragging={dragging === token.id}
									role="slider"
									tabindex="0"
									aria-label={scrubName(token.id)}
									aria-valuenow={Number(token.text)}
									aria-valuetext={token.text}
									aria-describedby="scrub-help"
									onpointerdown={(event) => startDrag(event, token.id)}
									onkeydown={(event) => keyScrub(event, token.id)}>{token.text}</span
								>{:else if token.cls === "live"}<mark class="live">{token.text}</mark
								>{:else if token.cls}<span class={token.cls}>{token.text}</span
								>{:else}{token.text}{/if}{/each}</span
					>{/each}</code
			></pre>
	</div>
	<p class="legend" id="scrub-help">
		<span class="live scrub sample" aria-hidden="true">0.0</span>
		{t("scrubLegend")}
		<mark class="live sample" aria-hidden="true">0.0</mark>
		{t("liveLegend")}
	</p>
</section>

<style>
	.code-panel {
		display: flex;
		flex-direction: column;
		min-height: 0;
		height: 100%;
		background: var(--bg-secondary);
		border-top: 1px solid var(--panel-border);
	}

	.head {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		gap: 0.4rem 1rem;
		padding: 0.5rem 1rem 0;
		border-bottom: 1px solid var(--panel-border);
	}

	h2 {
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 1.2px;
		color: var(--text-secondary);
		margin: 0 0 0.55rem;
	}

	.tools {
		margin: 0 0 0.35rem auto;
		display: flex;
		gap: 0.4rem;
		align-items: center;
	}

	.copy {
		background: var(--bg-primary);
		border: 1px solid var(--control-border);
		border-radius: 6px;
		padding: 0.25rem 0.7rem;
		font-size: 0.78rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.copy:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	.body {
		flex: 1;
		min-height: 0;
		overflow: auto;
		background: var(--code-bg);
	}

	.body:focus-visible {
		outline-offset: -4px;
	}

	pre {
		margin: 0;
		padding: 0.9rem 1.1rem 1.2rem;
		color: var(--text-primary);
		font-size: 0.82rem;
		line-height: 1.95;
		tab-size: 4;
	}

	/* One block per line, with air between them. Not inline-block: under
	   `white-space: pre` inline-blocks never wrap, and every line of the
	   sample sat in one row running off to the right (MISTAKES.md). An empty
	   line still keeps its height. */
	.line {
		display: block;
		min-height: 1.95em;
		padding: 0.05rem 0;
	}

	pre :global(.kw) {
		color: var(--syn-kw);
		font-weight: 600;
	}
	pre :global(.type) {
		color: var(--syn-type);
	}
	pre :global(.num) {
		color: var(--syn-num);
	}
	pre :global(.str) {
		color: var(--syn-str);
	}
	pre :global(.com) {
		color: var(--text-secondary);
		font-style: italic;
	}

	/* Live values: a tint AND an underline, so the marking survives a
	   colour-blind reader and a high-contrast mode alike. */
	.live {
		color: var(--live);
		background: var(--live-bg);
		border-bottom: 2px solid var(--live);
		border-radius: 3px;
		padding: 0 2px;
		font-style: normal;
		font-weight: 700;
	}

	/* Draggable: a dotted underline and a vertical-resize cursor say "drag
	   me", in addition to the tint. */
	.scrub {
		border-bottom-style: dotted;
		cursor: ns-resize;
		touch-action: none;
		user-select: none;
	}

	.scrub:hover,
	.scrub.dragging {
		background: var(--live);
		color: var(--live-bg);
	}

	.legend {
		margin: 0;
		padding: 0.4rem 1rem;
		font-size: 0.74rem;
		color: var(--text-secondary);
		border-top: 1px solid var(--panel-border);
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 0.5rem;
		align-items: center;
	}

	.sample {
		font-family: var(--mono);
	}
</style>
