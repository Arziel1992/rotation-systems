<script>
/**
 * The manual and glossary, laid out like every house tool's: contents on the
 * left, entries on the right, opened at a section by the "?" buttons.
 *
 * ponytail: a native <dialog> opened with showModal() - the browser supplies
 * the focus containment, Esc to close and the inert background that a
 * hand-built modal would have to reimplement (and usually gets wrong).
 * Focus returns to whatever opened it.
 */
import { t } from "./i18n/index.svelte.js";

let { isOpen = $bindable(false), section = $bindable("manual") } = $props();

/** Grouped, in reading order. Each id has gloss.<id>.title and .body. */
const GROUPS = [
	["glossGroupUse", ["manual", "keys", "code-panel", "break-it"]],
	["glossGroupEuler", ["euler", "yaw-pitch-roll", "euler-order", "gimbal-lock", "clamp", "read-back"]],
	[
		"glossGroupQuat",
		["quaternion", "axis-angle", "half-angle", "double-cover", "unit", "slerp", "shortest-path", "hypersphere", "multiply", "alignment"],
	],
	["glossGroupBasis", ["basis", "orthonormal", "local-world", "drift", "forward"]],
	["glossGroupLook", ["look-at", "up-hint", "smooth"]],
	["glossGroupEngines", ["methods", "handedness", "conventions", "degrees-radians"]],
];

let dialog = $state();
let content = $state();
let opener = null;

$effect(() => {
	if (!dialog) return;
	if (isOpen && !dialog.open) {
		opener = document.activeElement;
		dialog.showModal();
		queueMicrotask(() => jump(section));
	} else if (!isOpen && dialog.open) {
		dialog.close();
	}
});

function jump(id) {
	section = id;
	const entry = content?.querySelector(`#g-${id}`);
	if (!entry) return;
	content.scrollTop = entry.offsetTop - content.offsetTop - 16;
}

function closed() {
	isOpen = false;
	opener?.focus?.();
}

/**
 * A click on the dimmed page behind closes it. The backdrop belongs to the
 * dialog, so such a click targets the dialog itself; the dialog has no
 * padding, so a click on its content never does. The box test is a second
 * guard, for a gap between children. Keyboard users have Esc and Close.
 */
function onBackdrop(event) {
	if (event.target !== dialog) return;
	const box = dialog.getBoundingClientRect();
	const inside =
		event.clientX >= box.left &&
		event.clientX <= box.right &&
		event.clientY >= box.top &&
		event.clientY <= box.bottom;
	if (!inside) dialog.close();
}

const paragraphs = (key) => t(key).split("\n");
</script>

<dialog bind:this={dialog} class="modal-content" aria-labelledby="glossary-title" onclose={closed} onclick={onBackdrop}>
	<div class="layout">
		<nav class="toc" aria-labelledby="glossary-title">
			<h2 id="glossary-title">{t("glossaryTitle")}</h2>
			<div class="toc-scroll">
				{#each GROUPS as [group, ids] (group)}
					<p class="group">{t(group)}</p>
					<ul>
						{#each ids as id (id)}
							<li>
								<button type="button" class:active={section === id} aria-current={section === id ? "true" : undefined} onclick={() => jump(id)}>
									{t(`gloss.${id}.title`)}
								</button>
							</li>
						{/each}
					</ul>
				{/each}
			</div>
			<button type="button" class="close-main-btn" onclick={() => dialog.close()}>
				<i class="fa-solid fa-xmark" aria-hidden="true"></i>
				{t("closeGlossary")}
			</button>
		</nav>
		<div class="content-view" bind:this={content}>
			{#each GROUPS as [group, ids] (group)}
				{#each ids as id (id)}
					<section id="g-{id}" aria-labelledby="g-{id}-title">
						<h3 id="g-{id}-title">{t(`gloss.${id}.title`)}</h3>
						{#each paragraphs(`gloss.${id}.body`) as para, i (i)}<p>{para}</p>{/each}
					</section>
				{/each}
			{/each}
			<p class="footer-note">{t("glossaryFooter")}</p>
		</div>
	</div>
</dialog>

<style>
	.layout {
		display: flex;
		height: 100%;
	}

	.toc {
		width: 15.5rem;
		flex-shrink: 0;
		background: var(--bg-primary);
		border-right: 1px solid var(--panel-border);
		padding: 1.3rem 1rem 1rem 1.3rem;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		min-height: 0;
	}

	.toc h2 {
		font-size: 0.78rem;
		text-transform: uppercase;
		letter-spacing: 1px;
		color: var(--text-secondary);
		margin: 0;
	}

	.toc-scroll {
		flex: 1;
		overflow-y: auto;
		min-height: 0;
	}

	.group {
		font-size: 0.68rem;
		font-weight: 700;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.8px;
		margin: 0.8rem 0 0.2rem;
	}

	.group:first-child {
		margin-top: 0;
	}

	.toc ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.toc button {
		background: none;
		border: none;
		font-size: 0.82rem;
		color: var(--text-secondary);
		padding: 0.3rem 0;
		display: block;
		text-align: left;
		width: 100%;
	}

	.toc button:hover,
	.toc button.active {
		color: var(--accent);
	}

	/* Current entry: colour, weight AND a marker. */
	.toc button.active {
		font-weight: 700;
	}

	.toc button.active::before {
		content: "▸ ";
	}

	.close-main-btn {
		background: var(--bg-secondary);
		border: 1px solid var(--control-border);
		padding: 0.55rem;
		border-radius: 6px;
		font-size: 0.82rem;
		font-weight: 700;
		color: var(--text-primary);
	}

	.content-view {
		flex: 1;
		padding: 1.8rem 2rem;
		overflow-y: auto;
		scroll-behavior: smooth;
		min-width: 0;
	}

	.content-view section {
		margin-bottom: 1.6rem;
		padding-bottom: 1.4rem;
		border-bottom: 1px solid var(--panel-border);
	}

	.content-view h3 {
		font-size: 1.25rem;
		color: var(--text-primary);
		margin: 0 0 0.7rem;
	}

	.content-view p {
		line-height: 1.65;
		color: var(--text-secondary);
		font-size: 0.95rem;
		margin: 0 0 0.7rem;
	}

	.footer-note {
		font-style: italic;
		font-size: 0.85rem;
		color: var(--accent);
	}

	@media (prefers-reduced-motion: reduce) {
		.content-view {
			scroll-behavior: auto;
		}
	}

	@media (max-width: 699px) {
		.layout {
			flex-direction: column;
		}

		.toc {
			width: auto;
			max-height: 40%;
			border-right: 0;
			border-bottom: 1px solid var(--panel-border);
		}
	}
</style>
