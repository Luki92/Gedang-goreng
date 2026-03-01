import { personaStore } from '../stores/persona.svelte.js';

export function parseLukiMarkdown(markdown) {
    if (!markdown) return [];

    // AST structure expected by LukiRenderer
    const nodes = [];
    const lines = markdown.split('\n');

    lines.forEach(line => {
        // Match <say message="..." expression="..." trigger="hover|scroll">
        const sayMatch = line.match(/<say\s+message="([^"]+)"(?:\s+expression="([^"]+)")?(?:\s+trigger="([^"]+)")?\s*\/?>/);

        if (sayMatch) {
            nodes.push({
                type: 'say',
                message: sayMatch[1],
                expression: sayMatch[2] || 'idle',
                trigger: sayMatch[3] || 'scroll'
            });
        } else if (line.startsWith('# ')) {
            nodes.push({ type: 'header', level: 1, children: [{ type: 'text', value: line.replace('# ', '') }] });
        } else if (line.startsWith('## ')) {
            nodes.push({ type: 'header', level: 2, children: [{ type: 'text', value: line.replace('## ', '') }] });
        } else {
            nodes.push({ type: 'paragraph', children: [{ type: 'text', value: line }] });
        }
    });

    return nodes;
}

export const parser = parseLukiMarkdown;
