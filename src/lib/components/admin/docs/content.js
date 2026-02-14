export const scriptDocs = `
# LukiScript Documentation

Welcome to the internal scripting language guide. This system allows for rich, interactive content creation within the Vault and other text areas.

## Typography & Emphasis

Standard formatting is supported along with some extras:
- **Bold Text**: \`**bold**\` or \`__bold__\`
- *Italic Text*: \`*italic*\` or \`_italic_\`
- ~~Strikethrough~~: \`~~text~~\`
- \`Inline Code\`: \` \`text\` \`

## Semantic Hierarchy

Use hashtags for headers.
# H1 Title
## H2 Section
### H3 Subsection

You can add custom IDs for navigation anchors:
\`## My Section {#custom-id}\`

## Blocks & Layouts

### Blockquotes
> This is a blockquote.
> It can span multiple lines and contain **formatting**.

### Thematic Breaks
---

### Syntax Highlighting
\`\`\`javascript
function hello() {
  console.log("Hello World");
}
\`\`\`

### Tabular Data
| Feature | Status | Priority |
|---|---|---|
| Scripting | Done | High |
| Database | Pending | Medium |

## Advanced Containers

Use \`:::\` to create special blocks.

### Callouts
::: info Note
This is an informational note.
:::

::: warning Alert
**Be careful!** This is a warning.
:::

### Interactive Disclosure
::: details Click to Reveal
Here is some hidden content that is only visible when expanded.
- You can put lists inside.
- Or other elements.
:::

### Sidebars
::: sidebar Quick Links
- [Home](/)
- [About](/about)
:::
Sidebars float to the right of the content on larger screens. This text wraps around it, allowing for marginalia-style notes or navigation aids.

## Inline Interactions

- **Tooltips**: Hover over ^^this text^^(This is a tooltip!). Syntax: \`^^text^^(tip)\`
- **Redaction / Spoilers**: The secret code is ||0451||. Syntax: \`||text||\`
- **Obfuscated Text**: The system status is %%CORRUPTED%%. Syntax: \`%%text%%\`
- **Footnotes**: Reference^1^. Syntax: \`^text^\`

## Links & Media

- **Links**: [External Link](https://google.com)
- **Wiki Links**: [[Internal Page]] or [[Label|Target]]
- **Images**:
![Placeholder](https://placehold.co/600x200/111/FFF?text=Image+Placeholder)

## Direct Attachment

::: file Project Specs
specs_v1.pdf
:::
`;
