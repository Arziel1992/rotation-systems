<script>
/**
 * The lower half of the stage: the pose on screen, written in the engine the
 * learner picked. Values that come from the pose are highlighted as live, so
 * turning the object visibly changes the code.
 */
import { generate, LANGUAGE, plain } from "./code.js";
import { highlight } from "./highlight.js";
import { t } from "./i18n/index.svelte.js";
import { ENGINES } from "./rotation.js";

let { state, engine, onengine, onannounce } = $props();

const code = $derived(generate({ ...state, engine }));
const lines = $derived(highlight(code, LANGUAGE[engine]));

// WAI-ARIA tabs: arrow keys move between engines, Home and End jump.
function onkey(event, index) {
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
					onkeydown={(event) => onkey(event, index)}
				>
					{t(`engine.${id}`)}
				</button>
			{/each}
		</div>
		<button type="button" class="copy" onclick={copy}>{t("copy")}</button>
	</div>
	<!-- The panel is the scroll container, and focusable so a keyboard user can
	     scroll a long sample (WAI-ARIA tabs: tabindex 0 on the tabpanel). -->
	<div id="code-body" class="body" role="tabpanel" aria-labelledby="engine-{engine}" tabindex="0">
		<pre aria-label={t("codeRegion", { engine: t(`engine.${engine}`) })}><code
				>{#each lines as line, i (i)}{#each line as token, j (j)}{#if token.cls === "live"}<mark
								class="live">{token.text}</mark
							>{:else if token.cls}<span class={token.cls}>{token.text}</span
							>{:else}{token.text}{/if}{/each}{"\n"}{/each}</code
			></pre>
	</div>
	<p class="legend">
		<mark class="live">0.0</mark>
		{t("liveLegend")}
	</p>
</section>

<style>
	.code-panel {
		display: flex;
		flex-direction: column;
		min-height: 0;
		height: 100%;
		background: var(--surface);
		border-top: 1px solid var(--line-soft);
	}

	.head {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		gap: 0.5rem 1rem;
		padding: 0.5rem 0.9rem 0;
		border-bottom: 1px solid var(--line-soft);
	}

	h2 {
		font-size: 0.95rem;
		margin: 0 0 0.45rem;
	}

	.copy {
		margin: 0 0 0.35rem auto;
		font-size: 0.85rem;
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
		padding: 0.7rem 0.9rem;
		color: var(--text);
		font-size: 0.84rem;
		line-height: 1.55;
		tab-size: 4;
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
		color: var(--muted);
		font-style: italic;
	}

	/* Live values: a tint AND an underline, so the marking survives a
	   colour-blind reader and a high-contrast mode alike. */
	.live {
		color: var(--live);
		background: var(--live-bg);
		border-bottom: 2px solid var(--live);
		border-radius: 3px;
		padding: 0 1px;
		font-style: normal;
		font-weight: 600;
	}

	.legend {
		margin: 0;
		padding: 0.35rem 0.9rem;
		font-size: 0.78rem;
		color: var(--muted);
		border-top: 1px solid var(--line-soft);
	}

	.legend .live {
		font-family: var(--mono);
	}
</style>
