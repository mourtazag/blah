import type { BadgeStyle, LoggingConfig } from './blah-types'

export const BASE_BADGE =
  'padding: 2px 4px; margin: 2px; border-radius: 4px;'

export const BOLD = 'font-weight: bold;'

export const DEFAULT_NAMESPACE_STYLE: Required<BadgeStyle> = {
  color: 'white',
  bgColor: 'black',
}

export const DEFAULT_ARG_STYLE: Required<BadgeStyle> = {
  color: 'inherit',
  bgColor: 'transparent',
}

export const DEFAULT_LOGGING: Required<LoggingConfig> = {
  enabled: true,
  log: true,
  info: true,
  warn: true,
  error: true,
}

/** Resolve logging flags; global `enabled: false` turns off every level */
export function resolveLogging(config: LoggingConfig = {}): Required<LoggingConfig> {
  const enabled = config.enabled ?? true
  if (!enabled) {
    return { enabled: false, log: false, info: false, warn: false, error: false }
  }
  return {
    enabled: true,
    log: config.log ?? true,
    info: config.info ?? true,
    warn: config.warn ?? true,
    error: config.error ?? true,
  }
}

/** Turn { color, bgColor } into a CSS string for console %c */
export function toCss(
  style: BadgeStyle,
  fallback: BadgeStyle = {},
  options: { bold?: boolean } = {},
): string {
  const color = style.color ?? fallback.color ?? DEFAULT_ARG_STYLE.color
  const bgColor = style.bgColor ?? fallback.bgColor ?? DEFAULT_ARG_STYLE.bgColor
  const weight = options.bold ? BOLD : ''
  return `${BASE_BADGE} color: ${color}; background-color: ${bgColor}; ${weight}`.trim()
}

/** Convert primitives into text embedded in a %c badge */
export function formatArg(value: unknown): string {
  if (typeof value === 'string') return value
  return String(value)
}

function isExpandableObject(value: unknown): value is object {
  return typeof value === 'object' && value !== null
}

/** Build the format string + values that console.log expects */
export function buildConsolePayload(
  namespace: string,
  namespaceStyle: string,
  resolvedArgStyles: string[],
  args: unknown[],
): [string, ...unknown[]] {
  let format = `%c${namespace}`
  const values: unknown[] = [namespaceStyle]

  for (const [index, arg] of args.entries()) {
    const style = resolvedArgStyles[index] ?? toCss({})

    if (isExpandableObject(arg)) {
      // %o keeps DevTools objects expandable (unlike JSON in the format string)
      format += ' %c %o'
      values.push(style, arg)
    } else {
      format += ` %c${formatArg(arg)}`
      values.push(style)
    }
  }

  return [format, ...values]
}
