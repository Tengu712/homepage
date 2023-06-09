/* ================================================================================================================= */
/*         Regular Expressions                                                                                       */
/* ================================================================================================================= */

function patterns_latex() {
    return [
        [/%[^\n]*\n/sd, "comment", null],
        [/{|}|\[|\]|=|,/sd, "plain", null],
        [/[+-]?\d+(\.\d+)?(pt|in|cm|mm)/sd, "literal", null],
        [/\\[a-z]+/sd, "type", null],
        [/.+/sd, "plain", null],
    ];
}

function patterns_make() {
    return [
        [/\n/sd, "parser", null],
        [/^\..+/sd, "type", null],
        [/^.+:/sd, "function", null],
        [/^    .+/sd, "keyword", null],
        [/.+/sd, "id", null],
    ];
}

function patterns_c() {
    const fun_parenthesis = (codeblock) => {
        event_make_prev_token_function(codeblock);
        event_make_prev_token_infrontof_parenthesis_utype(codeblock);
    };
    return [
        [/"([^\n\\]|\\[^\n])*"/sd, "string", null],
        [/'([^\n\\]|\\[^\n])*'/sd, "string", null],
        [/\/\/[^\n]*\n/sd, "comment", null],
        [/\/\*([^\*]|\*[^\\])*\*\//sd, "comment", null],
        [/#[^\n]*\n/sd, "directive", null],
        [/[\s\n]+/sd, "space", null],
        [/\(/sd, "parser", fun_parenthesis],
        [/\)|{|}|\[|\]|,|:|;|&&|\|\||->|\+|-|\*|\/|=|>|<|!|\?|&|\|/sd, "parser", null],
        [/^(if|for|do|while|switch|case|return|continue|break|sizeof|typedef|__[a-zA-Z0-9_]+)$/sd, "keyword", null],
        [/^(void|char|short|int|long|float|double|struct|union|const|static|auto|extern)\**$/sd, "type", event_make_prev_token_utype],
        [/^[A-Z_][A-Z0-9_]*\**$/sd, "const", event_make_prev_token_utype],
        [/^[A-Z_][a-zA-Z0-9_]*\**$/sd, "utype", event_make_prev_token_utype],
        [/^[a-z_][a-zA-Z0-9_]*\**$/sd, "id", event_make_prev_token_utype],
        [/\d+(\.\d+)?(f|)/sd, "literal", null],
        [/\./sd, "parser", null],
        [/.+/sd, "plain", null],
    ];
}

function patterns_rust() {
    const event_make_annotated_id = (codeblock) => {
        const pt = get_prev_token(codeblock.lastChild.previousElementSibling);
        if (!is_id(pt)) return;
        const ppt = get_prev_token(pt.previousElementSibling);
        if (ppt !== null && ppt.innerText !== "const") pt.className = "id";
    }
    return [
        [/"([^\\"]|\\.)*"/sd, "string", null],
        [/'([^\\]|\\.)'/sd, "string", null],
        [/\/\/[^\n]*\n/sd, "comment", null],
        [/\/\*([^\*]|\*[^\\])*\*\//sd, "comment", null],
        [/#[^\n]*\n/sd, "directive", null],
        [/[\s\n]+/sd, "space", null],
        [/\(/sd, "parser", event_make_prev_token_function],
        [/::/sd, "parser", event_make_namespace_utype],
        [/:/sd, "parser", event_make_annotated_id],
        [/\)|{|}|\[|\]|\.\.|,|;|&&|\|\||=>|->|\+|-|\*|\/|=|>|<|\?|&|\|/sd, "parser", null],
        [/^(if|for|in|while|loop|match|return|continue|break|use)$/sd, "keyword", null],
        [/^(let|mut|fn|struct|trait|impl|const|type|i8|i16|i32|i64|u8|u16|u32|u64|f32|f64|'[a-zA-Z0-9_]+)$/sd, "type", null],
        [/^[A-Z_][A-Z0-9_]*$/sd, "const", null],
        [/^[A-Z_][a-zA-Z0-9_]*$/sd, "utype", null],
        [/^[a-z_][a-zA-Z0-9_]*!?$/sd, "id", event_make_annotation_utype],
        [/\d+(\.\d+)?(i8|i16|i32|i64|u8|u16|u32|u64|f32|f64)?/sd, "literal", null],
        [/\.|!/sd, "parser", null],
        [/.+/sd, "plain", null],
    ];
}

/* ================================================================================================================= */
/*         window.onload                                                                                             */
/* ================================================================================================================= */

window.onload = function () {
    const codeblocks = document.getElementsByClassName("codeblock");
    for (const codeblock of codeblocks) {
        let patterns = null;
        switch (codeblock.classList[1]) {
            case "latex":
                patterns = patterns_latex();
                break;
            case "make":
                patterns = patterns_make();
                break;
            case "c":
                patterns = patterns_c();
                break;
            case "rust":
                patterns = patterns_rust();
                break;
        }
        if (patterns === null)
            continue;
        let code = codeblock.innerText;
        codeblock.innerText = "";
        while (code.length > 0) {
            const next = match(code, codeblock, patterns);
            code = code.slice(next);
        }
    }
}

/* ================================================================================================================= */
/*         Events                                                                                                    */
/* ================================================================================================================= */

const event_make_prev_token_function = (codeblock) => {
    const pt = get_prev_token(codeblock.lastChild.previousElementSibling);
    if (is_id(pt)) pt.className = "function";
}

const event_make_prev_token_infrontof_parenthesis_utype = (codeblock) => {
    const pt = get_prev_token(codeblock.lastChild.previousElementSibling);
    if (pt.innerText === ")") make_prev_token_utype(get_prev_parenthesis(pt));
}

const event_make_prev_token_utype = (codeblock) => make_prev_token_utype(codeblock.lastChild);

const event_make_annotation_utype = (codeblock) => {
    let pt = get_prev_token(codeblock.lastChild.previousElementSibling);
    while (pt !== null) {
        if (pt.innerText === ":" || pt.innerText === "::") {
            codeblock.lastChild.className = "utype";
            return;
        }
        if (pt.className !== "type" && pt.className !== "utype" && pt.innerText !== "*" && pt.innerText !== "&") {
            return;
        } 
        pt = get_prev_token(pt.previousElementSibling);
    }
}

const event_make_namespace_utype = (codeblock) => {
    const pt = get_prev_token(codeblock.lastChild.previousElementSibling);
    if (is_id(pt)) make_id_utype(pt);
}

/* ================================================================================================================= */
/*         Functions                                                                                                 */
/* ================================================================================================================= */

function is_id(e) {
    return e !== null
        && (e.className === "id"
            || e.className === "type"
            || e.className === "utype"
            || e.className === "const"
            || e.className === "function");
}

function is_space(e) {
    return e !== null && e.className === "space";
}

function is_pointer(e) {
    return e !== null && e.innerText === "*";
}

function get_prev_token(e) {
    if (e === null) return null;
    else if (e.className === "space" || e.tagName === "br") return get_prev_token(e.previousElementSibling);
    else return e;
}

function get_prev_parenthesis(e) {
    if (e === null) return null;
    else if (e.innerText === "(") return e;
    else return get_prev_parenthesis(e.previousElementSibling);
}

function make_id_utype(e) {
    if (e !== null && e.className !== "keyword" && (e.className === "id" || e.className === "const" || e.className === "function"))
        e.className = "utype";
}

function make_prev_token_utype(id) {
    if (id === null) return;
    const pt = id.previousElementSibling;
    // type *id
    if (is_pointer(pt)) {
        let maybe_space = pt.previousElementSibling;
        while (maybe_space !== null && is_pointer(maybe_space)) {
            maybe_space = maybe_space.previousElementSibling;
        }
        if (is_space(maybe_space)) {
            const maybe_id = maybe_space.previousElementSibling;
            if (is_id(maybe_id))
                make_id_utype(maybe_id);
        }
    }
    // type id or type* id
    else if (is_space(pt)) {
        let maybe_id = pt.previousElementSibling;
        while (maybe_id !== null && is_pointer(maybe_id)) {
            maybe_id = maybe_id.previousElementSibling;
        }
        if (is_id(maybe_id))
            make_id_utype(maybe_id);
    }
}

/* ================================================================================================================= */
/*         Lexer                                                                                                     */
/* ================================================================================================================= */

function append_span(cls, text, codeblock) {
    const span = document.createElement("span");
    span.classList.add(cls);
    span.innerText = text;
    codeblock.appendChild(span);
}

function match(code, codeblock, patterns) {
    for (const pattern of patterns) {
        const res = code.match(pattern[0]);
        if (res === null) {
            continue;
        }
        const start = res.indices[0][0];
        const end = res.indices[0][1];
        if (end === 0) {
            append_span("error", "FORMATTING ERROR: ENDLESS LOOP", codeblock);
            return Number.MAX_SAFE_INTEGER;
        }
        let prev_end = 0;
        while (prev_end < start) {
            prev_end += match(code.slice(prev_end, start), codeblock, patterns);
        }
        const splitted = code.slice(start, end).split('\n');
        for (let i = 0; i < splitted.length; ++i) {
            if (splitted[i].length !== 0)
                append_span(pattern[1], splitted[i], codeblock);
            if (i < splitted.length - 1)
                codeblock.appendChild(document.createElement("br"));
        }
        if (pattern[2] !== null) pattern[2](codeblock);
        return end;
    }
    append_span("error", "FORMATTING ERROR: NO MATCH FOR `\n" + code + "\n`", codeblock);
    return Number.MAX_SAFE_INTEGER;
}
