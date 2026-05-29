import type { BlahOptions, LogLevel, LoggingConfig } from './blah-types'
import {
  buildConsolePayload,
  DEFAULT_NAMESPACE_STYLE,
  resolveLogging,
  toCss,
} from './blah-utils'

export type {
  BadgeStyle,
  BlahOptions,
  LogLevel,
  LoggingConfig,
  NamespaceConfig,
} from './blah-types'

class Blah {
  private readonly namespace: string
  private readonly namespaceStyle: string
  /** CSS strings ready for console — built once in the constructor */
  private readonly resolvedArgStyles: string[]
  private logging: Required<LoggingConfig>
  private debug: boolean

  constructor(options: BlahOptions) {
    this.namespace = options.namespace.name ?? 'Blah'
    this.namespaceStyle = toCss(
      options.namespace.style ?? {},
      DEFAULT_NAMESPACE_STYLE,
    )
    this.resolvedArgStyles = (options.argStyles ?? []).map(style =>
      toCss(style, {}, { bold: true }),
    )
    this.logging = resolveLogging(options.logging)
    this.debug = options.debug ?? false

    this.bindMethods()
  }

  /** Keep `this` when methods are passed around or destructured */
  private bindMethods(): void {
    this.log = this.log.bind(this)
    this.info = this.info.bind(this)
    this.warn = this.warn.bind(this)
    this.error = this.error.bind(this)
    this.setDebug = this.setDebug.bind(this)
    this.setLogging = this.setLogging.bind(this)
    this.isEnabled = this.isEnabled.bind(this)
    this.print = this.print.bind(this)
  }

  /** Force all levels on/off, overriding `logging` restrictions */
  setDebug(debug: boolean): void {
    this.debug = debug
  }

  /** Update logging flags (merged with current settings) */
  setLogging(config: LoggingConfig): void {
    this.logging = resolveLogging({
      enabled: config.enabled ?? this.logging.enabled,
      log: config.log ?? this.logging.log,
      info: config.info ?? this.logging.info,
      warn: config.warn ?? this.logging.warn,
      error: config.error ?? this.logging.error,
    })
  }

  isEnabled(level: LogLevel): boolean {
    return this.debug || (this.logging.enabled && this.logging[level])
  }

  private print(method: LogLevel, ...args: unknown[]): void {
    if (!this.isEnabled(method)) return

    console[method](
      ...buildConsolePayload(
        this.namespace,
        this.namespaceStyle,
        this.resolvedArgStyles,
        args,
      ),
    )
  }

  log(...args: unknown[]): void {
    this.print('log', ...args)
  }

  info(...args: unknown[]): void {
    this.print('info', ...args)
  }

  warn(...args: unknown[]): void {
    this.print('warn', ...args)
  }

  error(...args: unknown[]): void {
    this.print('error', ...args)
  }
}

export default Blah
