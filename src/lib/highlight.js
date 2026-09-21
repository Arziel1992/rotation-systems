/**
 * A small tokenizer for the three languages the code panel shows. Enough to
 * colour keywords, types, numbers, strings and comments, and to mark live
 * values - not a parser, and it does not need to be one: the only input is
 * the text code.js writes.
 *
 * A live value in CODE becomes a `live` token, carrying its id when it can be
 * dragged. A live value inside a COMMENT is just comment text: rendering it as
 * a code value mixed the two and read as if the comment were code.
 *
 * ponytail: patterns avoid backslash escapes ([0-9], [.], [|]) on purpose, so
 * they survive any tool that rewrites this file (global §16). Keep them so.
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
	/⟦(?:([a-z0-9]+)[|])?([^⟧]*)⟧|("[^"]*")|((?<![A-Za-z_])-?[0-9]+(?:[.][0-9]+)?)|([A-Za-z_][A-Za-z0-9_]*)|([^⟦"A-Za-z0-9_-]+|.)/g;

const unmark = (text) => text.replace(/⟦(?:[a-z0-9]+[|])?([^⟧]*)⟧/g, "$1");

/** One line of source to [{ cls, text, id? }]. */
function line(source, language) {
	const marker = COMMENT[language];
	const at = source.indexOf(marker);
	const code = at === -1 ? source : source.slice(0, at);
	const comment = at === -1 ? "" : unmark(source.slice(at));
	const keywords = KEYWORDS[language];
	const tokens = [];
	for (const m of code.matchAll(TOKEN)) {
		const [whole, id, liveValue, str, number, word] = m;
		if (liveValue !== undefined)
			tokens.push({ cls: "live", text: liveValue, id });
		else if (str) tokens.push({ cls: "str", text: str });
		else if (number) tokens.push({ cls: "num", text: number });
		else if (word) {
			const cls = keywords.has(word) ? "kw" : /^[A-Z]/.test(word) ? "type" : "";
			tokens.push({ cls, text: word });
		} else tokens.push({ cls: "", text: whole });
	}
	if (comment) tokens.push({ cls: "com", text: comment });
	return tokens;
}

export function highlight(text, language) {
	return text.split("\n").map((source) => line(source, language));
}
