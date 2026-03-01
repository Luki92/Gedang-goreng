/**
 * @typedef {Object} ASTNode
 * @property {string} type
 * @property {string} [value]
 * @property {string} [language]
 * @property {string} [variant]
 * @property {string} [args]
 * @property {ASTNode[]} [children]
 * @property {number} [level]
 * @property {string|null} [id]
 * @property {boolean} [ordered]
 * @property {ASTNode[][]} [items]
 * @property {ASTNode[]} [head]
 * @property {ASTNode[][]} [body]
 * @property {string} [alt]
 * @property {string} [src]
 * @property {string} [text]
 * @property {string} [href]
 * @property {string} [tip]
 * @property {string} [content]
 * @property {Object} [attribution]
 * @property {string} [message]
 */

export class LukiParser {
    /**
     * @param {string} text
     * @returns {ASTNode[]}
     */
    parse(text) {
        if (!text) return [];
        const lines = text.replace(/\r\n/g, '\n').split('\n');
        /** @type {ASTNode[]} */
        const ast = [];
        let i = 0;

        while (i < lines.length) {
            let line = lines[i];
            let trimmed = line.trim();

            // 1. Fenced Code Block
            if (trimmed.startsWith('```')) {
                let lang = trimmed.slice(3).trim();
                let codeLines = [];
                i++;
                while (i < lines.length && !lines[i].trim().startsWith('```')) {
                    codeLines.push(lines[i]);
                    i++;
                }
                ast.push({ type: 'code', language: lang, value: codeLines.join('\n') });
                i++;
                continue;
            }

            // 2. Containers (::: type)
            if (trimmed.startsWith(':::')) {
                let params = trimmed.slice(3).trim().split(' ');
                let variant = params[0];
                let args = params.slice(1).join(' ');
                let contentLines = [];
                i++;
                while (i < lines.length && !lines[i].trim().startsWith(':::')) {
                    contentLines.push(lines[i]);
                    i++;
                }
                // Recursive parse
                ast.push({
                    type: 'container',
                    variant,
                    args,
                    children: this.parse(contentLines.join('\n'))
                });
                i++;
                continue;
            }

            // 3. Table (starts with |)
            if (trimmed.startsWith('|')) {
                let tableRows = [];
                while (i < lines.length && lines[i].trim().startsWith('|')) {
                    tableRows.push(lines[i].trim());
                    i++;
                }
                ast.push(this.parseTable(tableRows));
                continue;
            }

            // 4. Headers
            const headerMatch = line.match(/^(#{1,6})\s+(.+?)(?:\s+\{#([\w-]+)\})?$/);
            if (headerMatch) {
                ast.push({
                    type: 'header',
                    level: headerMatch[1].length,
                    children: this.parseInline(headerMatch[2]),
                    id: headerMatch[3] || null
                });
                i++;
                continue;
            }

            // 5. Thematic Break
            if (trimmed === '---') {
                ast.push({ type: 'thematic_break' });
                i++;
                continue;
            }

            // 6. Blockquote
            if (trimmed.startsWith('>')) {
                let content = [];
                while (i < lines.length && lines[i].trim().startsWith('>')) {
                    content.push(lines[i].trim().slice(1).trim());
                    i++;
                }
                ast.push({
                    type: 'blockquote',
                    children: this.parse(content.join('\n'))
                });
                continue;
            }

            // 7. Unordered List
            if (trimmed.startsWith('- ')) {
                let items = [];
                while (i < lines.length && lines[i].trim().startsWith('- ')) {
                    items.push(this.parseInline(lines[i].trim().slice(2)));
                    i++;
                }
                ast.push({ type: 'list', ordered: false, items });
                continue;
            }

            // 8. Ordered List
            if (/^\d+\./.test(trimmed)) {
                let items = [];
                while (i < lines.length && /^\d+\./.test(lines[i].trim())) {
                    items.push(this.parseInline(lines[i].trim().replace(/^\d+\.\s+/, '')));
                    i++;
                }
                ast.push({ type: 'list', ordered: true, items });
                continue;
            }

            // 9. Paragraph
            if (trimmed === '') {
                i++;
                continue;
            }

            ast.push({
                type: 'paragraph',
                children: this.parseInline(line)
            });
            i++;
        }

        return ast;
    }

    /**
     * @param {string[]} rows
     * @returns {ASTNode}
     */
    parseTable(rows) {
        if (rows.length === 0) return { type: 'table', head: [], body: [] };

        /** @param {string} row */
        const splitRow = (row) => row.split('|').filter(c => c.trim() !== '');

        const head = splitRow(rows[0]).map(c => this.parseInline(c.trim()));
        let start = 1;

        if (rows[1] && rows[1].includes('---')) {
            start = 2;
        }

        const body = [];
        for (let j = start; j < rows.length; j++) {
            body.push(splitRow(rows[j]).map(c => this.parseInline(c.trim())));
        }

        return { type: 'table', head, body };
    }

    /**
     * @param {string} text
     * @returns {ASTNode[]}
     */
    parseInline(text) {
        if (!text) return [];
        /** @type {ASTNode[]} */
        let tokens = [];

        // Regex patterns
        // Enhanced to include <say> tags
        const pattern = /(<say\s+[^>]*>.*?<\/say>|`[^`]+`|\!\[.*?\]\(.*?\)|\[\[.*?\]\]|\[.*?\]\(.*?\)|\|\|.*?\|\||%%.*?%%|\^\^.*?\^\^\(.*?\)|~{2}.*?~{2}|\*{2}.*?\*{2}|_{2}.*?_{2}|\*.*?\*|_.*?_|\^.*?\^)/g;

        const parts = text.split(pattern);

        parts.forEach(part => {
            if (!part) return;

            // Persona Say tag: <say attribution="..." message="...">text</say>
            if (part.startsWith('<say')) {
                const attrMatch = part.match(/<say\s+([^>]+)>(.*?)<\/say>/);
                if (attrMatch) {
                    const attrsRaw = attrMatch[1];
                    const content = attrMatch[2];

                    /** @type {Record<string, string>} */
                    const attrs = {};
                    attrsRaw.replace(/(\w+)="([^"]*)"/g, (/** @type {string} */ m, /** @type {string} */ key, /** @type {string} */ val) => {
                        attrs[key] = val;
                        return m;
                    });

                    // Parse attribution string like "cause: hover; expression: idle;"
                    /** @type {Record<string, string>} */
                    const attribution = {};
                    if (attrs.attribution) {
                        attrs.attribution.split(';').forEach(pair => {
                            const [k, v] = pair.split(':').map(s => s.trim());
                            if (k && v) attribution[k] = v;
                        });
                    }

                    tokens.push({
                        type: 'say',
                        attribution,
                        message: attrs.message,
                        children: this.parseInline(content)
                    });
                } else {
                    tokens.push({ type: 'text', value: part });
                }
            }
            // Image: ![alt](src)
            else if (part.startsWith('![') && part.includes('](')) {
                const m = part.match(/\!\[(.*?)\]\((.*?)\)/);
                if (m) tokens.push({ type: 'image', alt: m[1], src: m[2] });
                else tokens.push({ type: 'text', value: part });
            }
            // Link: [text](href)
            else if (part.startsWith('[') && part.includes('](') && !part.startsWith('[[') && !part.startsWith('![')) {
                const m = part.match(/\[(.*?)\]\((.*?)\)/);
                if (m) tokens.push({ type: 'link', text: m[1], href: m[2] });
                else tokens.push({ type: 'text', value: part });
            }
            // Wiki Link: [[text|href]]
            else if (part.startsWith('[[') && part.endsWith(']]')) {
                const content = part.slice(2, -2);
                const [label, dest] = content.split('|');
                tokens.push({ type: 'link', text: label, href: dest || label });
            }
            // Tooltip: ^^text^^(tip)
            else if (part.startsWith('^^') && part.includes('^^(')) {
                const m = part.match(/\^\^(.*?)\^\^\((.*?)\)/);
                if (m) tokens.push({ type: 'tooltip', text: m[1], tip: m[2] });
                else tokens.push({ type: 'text', value: part });
            }
            // Spoiler: ||text||
            else if (part.startsWith('||') && part.endsWith('||')) {
                tokens.push({ type: 'spoiler', content: part.slice(2, -2) });
            }
            // Obfuscated: %%text%%
            else if (part.startsWith('%%') && part.endsWith('%%')) {
                tokens.push({ type: 'obfuscated', content: part.slice(2, -2) });
            }
            // Footnote: ^text^
            else if (part.startsWith('^') && part.endsWith('^')) {
                tokens.push({ type: 'footnote', content: part.slice(1, -1) });
            }
            // Code: `text`
            else if (part.startsWith('`') && part.endsWith('`')) {
                tokens.push({ type: 'code_inline', content: part.slice(1, -1) });
            }
            // Bold: ** or __
            else if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
                tokens.push({ type: 'bold', children: this.parseInline(part.slice(2, -2)) });
            }
            // Italic: * or _
            else if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
                tokens.push({ type: 'italic', children: this.parseInline(part.slice(1, -1)) });
            }
            // Strike: ~~
            else if (part.startsWith('~~') && part.endsWith('~~')) {
                tokens.push({ type: 'strike', children: this.parseInline(part.slice(2, -2)) });
            }
            // Plain text
            else {
                tokens.push({ type: 'text', value: part });
            }
        });

        return tokens;
    }
}

export const parser = new LukiParser();
