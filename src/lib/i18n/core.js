/**
 * The translation lookup itself, with no reactive state, so the self-check can
 * run it under plain Node. `index.svelte.js` wraps it with the active locale.
 */

/** Fill {placeholders} from an object. Unknown ones are left visible, not blanked. */
export function interpolate(template, params) {
	if (!params) return template;
	return template.replace(/\{(\w+)\}/g, (whole, key) =>
		Object.hasOwn(params, key) ? String(params[key]) : whole,
	);
}

/**
 * Look `key` up in `locales[code]`, falling back to `locales.en`.
 * `missing` is true whenever the active locale had no entry - the caller marks
 * it visibly, because a silent fallback makes an untranslated tool look done.
 */
export function lookupIn(locales, code, key, params) {
	const active = locales[code] ?? locales.en;
	if (Object.hasOwn(active, key)) {
		return { text: interpolate(active[key], params), missing: false };
	}
	if (Object.hasOwn(locales.en, key)) {
		return {
			text: interpolate(locales.en[key], params),
			missing: code !== "en",
		};
	}
	return { text: key, missing: true };
}

/** Keys present in English and absent from `code`. Empty is the goal. */
export const missingIn = (locales, code) =>
	Object.keys(locales.en).filter(
		(key) => !Object.hasOwn(locales[code] ?? {}, key),
	);
