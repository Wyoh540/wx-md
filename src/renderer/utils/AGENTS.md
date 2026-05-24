# Markdown Rendering Engine

**Domain**: Markdown-to-HTML rendering with WeChat-specific output constraints.

## Structure

```
src/renderer/utils/
├── render.ts          # 594 lines — core rendering pipeline
└── loadCodeTheme.ts   # Dynamic code theme loading
```

## Rendering Pipeline

`renderMarkdown(text, themeStyles?, fontFamily?, fontSize?)` → HTML string

1. `createBaseStyles()` — merges font settings + theme base styles
2. `createMarkdownRenderer()` — custom Marked renderer with inline styles
3. `marked.parse()` — parse Markdown to HTML
4. `generateFootnotesHtml()` — append footnote section (external links → footnotes)
5. `adjustFirstParagraphMargin()` — remove margin-top from first `<p>`
6. `sanitizeHtml()` — DOMPurify with custom allowlist

## WeChat Constraints

- **Inline styles only** — no CSS classes in output. WeChat strips external CSS.
- All styles applied via `style="..."` attributes on HTML tags
- Theme variables (`var(--md-theme-color)`) resolved in `ThemeContext.getThemeConfig()`
- `em` units converted to `px` for WeChat compatibility

## Key Renderers

| Element | Renderer | Notes |
|---------|----------|-------|
| Code block | `code()` | highlight.js + Mac-style window buttons (inline SVG) |
| Links | `link()` | WeChat links kept clickable; others → footnotes |
| Images | `image()` | `src` and `alt` attributes only |
| Tables | `table()` | `<thead>` + `<tbody>` wrapper |
| Blockquote | `blockquote()` | Handles nested `blockquote_p` styles |

## Anti-Patterns

- Never use CSS classes in preview output — WeChat strips them
- Never skip DOMPurify — output goes directly to `dangerouslySetInnerHTML`
- `marked.use({ renderer })` modifies global state; `initMarked()` runs once at module load

## Notes

- `MAC_CODE_SVG` is an inline SVG for Mac-style window decorations
- Code blocks use `hljs` class for highlight.js styling
- Footnote links use `<sup>[N]</sup>` for reference numbers
- DOMPurify allowlist: `['use']` tags + `['href', 'xlink:href', 'class', 'style', 'data-index']` attrs
