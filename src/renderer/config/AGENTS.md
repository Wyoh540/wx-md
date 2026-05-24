# Configuration & Themes

**Domain**: Theme definitions, default constants, and style processing.

## Structure

```
src/renderer/config/
├── theme.ts    # 371 lines — ThemeStyles definitions for all Markdown elements
└── config.ts   # Default constants (fonts, sizes, colors)
```

## Theme System

`theme.ts` exports a `themes` record mapping `ThemeType` → `ThemeStyles`:

```typescript
type ThemeType = 'default' | 'serif' | ...

interface ThemeStyles {
  base: React.CSSProperties;
  elements: {
    h1?: React.CSSProperties;
    h2?: React.CSSProperties;
    // ... all Markdown elements
  }
}
```

Each element style uses **inline CSS property names** (camelCase in TS, converted to kebab-case in `render.ts`):

```typescript
h1: { fontSize: '28px', color: 'var(--md-theme-color)' }
```

## Variable Processing

`ThemeContext.getThemeConfig()` processes raw theme styles at runtime:

1. Deep clones theme config (`JSON.parse(JSON.stringify(...))`)
2. Replaces `var(--md-theme-color)` with actual color value
3. Converts `em` units to `px` based on current font size

## config.ts Defaults

| Constant | Value | Purpose |
|----------|-------|---------|
| `DEFAULT_THEME` | `'default'` | Initial theme |
| `DEFAULT_FONT_FAMILY` | System font stack | Editor font |
| `DEFAULT_FONT_SIZE` | `'16px'` | Base font size |
| `DEFAULT_CODE_THEME` | `'github'` | Code highlight theme |

## Anti-Patterns

- Never use CSS class names in `theme.ts` — all styles are inline property objects
- Never hardcode `px` values where `em` would be more appropriate — `em` is auto-converted
- `var(--md-theme-color)` is the **only** CSS variable supported; do not add others

## Notes

- Adding a new Markdown element requires updating `ThemeStyles` interface AND adding render handling in `render.ts`
- Theme config is **static** — runtime processing happens in `ThemeContext.getThemeConfig()`
- Color values in theme definitions should use `var(--md-theme-color)` for user-customizable elements
