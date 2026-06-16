declare module 'juice/client' {
  export function inlineContent(html: string, css: string, options?: Record<string, unknown>): string;
  export function juiceDocument($: unknown, options?: Record<string, unknown>): unknown;
  export function inlineDocument($: unknown, css: string, options?: Record<string, unknown>): unknown;
}
