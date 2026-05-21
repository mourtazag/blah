/** Colors for one console badge */
export interface BadgeStyle {
  color?: string
  bgColor?: string
}

export interface NamespaceConfig {
  name?: string
  style?: BadgeStyle
}

export type LogLevel = 'log' | 'info' | 'warn' | 'error'

export interface LoggingConfig {
  /** Master switch — when false, nothing is printed */
  enabled?: boolean
  log?: boolean
  info?: boolean
  warn?: boolean
  error?: boolean
}

export interface BlahOptions {
  namespace: NamespaceConfig
  /** One style per log argument, by index (0 = first value after the namespace badge) */
  argStyles?: BadgeStyle[]
  logging?: LoggingConfig
  /**
   * When true, prints every level regardless of `logging`.
   * Useful in dev to force output while keeping production logging muted.
   */
  debug?: boolean
}
