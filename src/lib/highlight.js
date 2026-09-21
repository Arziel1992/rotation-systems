/**
 * A small tokenizer for the three languages the code panel shows. Enough to
 * colour keywords, types, numbers, strings and comments, and to mark ⟦live⟧
 * values - not a parser, and it does not need to be one: the only input is
 * the text code.js writes.
 *
 * ponytail: patterns avoid backslash escapes ([0-9], [.]) on purpose, so they
 * survive any tool that rewrites this file (global §16). Keep them that way.
 */

const KEYWORDS = {
	gdscript: new Set(
		"var func const if else elif return for in and or not true false extends".split(
			" ",
		),
	),
	csharp: new Set(
		"private public void float bool var new if else return using class true false const double".split(
			" ",
		),
	),
	cpp: new Set(
		"const void float double bool auto if else return true false class".split(
			" ",
		),
	),
};

const COMMENT = { gdscript: "#", csharp: "//", cpp: "//" };

// live value | string | number | word | anything else, one char at a time
const TOKEN =
	/(⟦[^⟧]*⟧)|("[^"]*")|((?<![A-Za-z_])-?[0-9]+(?:[.][0-9]+)?)|([A-Za-z_][A-Za-z0-9_]*)|([^⟦"A-Za-z0-9_-]+|.)/g;

function splitLive(text, cls) {
	const out = [];
	for (const part of text.split(/(⟦[^⟧]*⟧)/)) {
		if (!part) continue;
		if (part.startsWith("⟦"))
			out.push({ cls: "live", text: part.slice(1, -1) });
		else out.push({ cls, text: part });
	}
	return out;
}

/** One line of source to [{ cls, text }]. */
function line(source, language) {
	const marker = COMMENT[language];
	const at = source.indexOf(marker);
	const code = at === -1 ? source : source.slice(0, at);
	const comment = at === -1 ? "" : source.slice(at);
	const keywords = KEYWORDS[language];
	const tokens = [];
	for (const m of code.matchAll(TOKEN)) {
		const [whole, liveValue, str, number, word] = m;
		if (liveValue) tokens.push({ cls: "live", text: liveValue.slice(1, -1) });
		else if (str) tokens.push({ cls: "str", text: str });
		else if (number) tokens.push({ cls: "num", text: number });
		else if (word) {
			const cls = keywords.has(word) ? "kw" : /^[A-Z]/.test(word) ? "type" : "";
			tokens.push({ cls, text: word });
		} else tokens.push({ cls: "", text: whole });
	}
	if (comment) tokens.push(...splitLive(comment, "com"));
	return tokens;
}

export function highlight(text, language) {
	return text.split("\n").map((source) => line(source, language));
}
