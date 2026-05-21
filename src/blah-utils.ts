import type { BadgeStyle, LoggingConfig } from './blah-types'

export const BASE_BADGE =
  'padding: 2px 4px; margin: 2px; border-radius: 4px; font-weight: bold;'

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
export function toCss(style: BadgeStyle, fallback: BadgeStyle = {}): string {
  const color = style.color ?? fallback.color ?? DEFAULT_ARG_STYLE.color
  const bgColor = style.bgColor ?? fallback.bgColor ?? DEFAULT_ARG_STYLE.bgColor
  return `${BASE_BADGE} color: ${color}; background-color: ${bgColor};`
}

/** Convert any log value into text for a %c badge */
export function formatArg(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value !== null) {
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }
  return String(value)
}

/** Build the format string + CSS values that console.log expects */
export function buildConsolePayload(
  namespace: string,
  namespaceStyle: string,
  resolvedArgStyles: string[],
  args: unknown[],
): [string, ...string[]] {
  let format = `%c${namespace}`
  const styles: string[] = [namespaceStyle]

  for (const [index, arg] of args.entries()) {
    format += ` %c${formatArg(arg)}`
    styles.push(resolvedArgStyles[index] ?? toCss({}))
  }

  return [format, ...styles]
}
