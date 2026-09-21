/**
 * Locale state and the translation lookup.
 *
 * One file per language (`en.js`, `es.js`), never mixed. This file holds only
 * the reactive wrapper; the lookup is in `core.js` so it can be tested.
 *
 * A key missing from the active locale falls back to English and, in
 * development, is prefixed with a visible marker. A silent fallback is how a
 * half-translated tool ships looking finished.
 */

import { lookupIn } from "./core.js";
import en from "./en.js";
import es from "./es.js";

export const LOCALES = { en, es };
export const LOCALE_NAMES = { en: "English", es: "Español" };
const STORAGE_KEY = "rotation-systems.locale";

// The inline script in index.html has already resolved saved choice ->
// browser language -> English and written it to <html lang>.
function initial() {
	const lang =
		typeof document !== "undefined" ? document.documentElement.lang : "en";
	return lang in LOCALES ? lang : "en";
}

export const locale = $state({ current: initial() });

export function setLocale(code) {
	if (!(code in LOCALES)) return;
	locale.current = code;
	document.documentElement.lang = code;
	try {
		localStorage.setItem(STORAGE_KEY, code);
	} catch {
		/* not persisted this session; the tool still works */
	}
}

/** The everyday form: just the text, visibly marked in development if missing. */
export function t(key, params) {
	const { text, missing } = lookupIn(LOCALES, locale.current, key, params);
	return missing && import.meta.env.DEV
		? `⚠[${locale.current}?] ${text}`
		: text;
}
