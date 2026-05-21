import { describe, expect, it } from 'vitest'
import {
  BASE_BADGE,
  DEFAULT_ARG_STYLE,
  DEFAULT_LOGGING,
  DEFAULT_NAMESPACE_STYLE,
  buildConsolePayload,
  formatArg,
  resolveLogging,
  toCss,
} from './blah-utils'

describe('resolveLogging', () => {
  it('enables all levels by default', () => {
    expect(resolveLogging()).toEqual(DEFAULT_LOGGING)
  })

  it('disables every level when enabled is false', () => {
    expect(resolveLogging({ enabled: false })).toEqual({
      enabled: false,
      log: false,
      info: false,
      warn: false,
      error: false,
    })
  })

  it('disables only specified levels when globally enabled', () => {
    expect(resolveLogging({ log: false, warn: false })).toEqual({
      enabled: true,
      log: false,
      info: true,
      warn: false,
      error: true,
    })
  })
})

describe('toCss', () => {
  it('uses style colors when provided', () => {
    const css = toCss({ color: 'red', bgColor: 'blue' })
    expect(css).toContain('color: red')
    expect(css).toContain('background-color: blue')
    expect(css).toContain(BASE_BADGE)
  })

  it('falls back to DEFAULT_ARG_STYLE when colors are missing', () => {
    const css = toCss({})
    expect(css).toContain(`color: ${DEFAULT_ARG_STYLE.color}`)
    expect(css).toContain(`background-color: ${DEFAULT_ARG_STYLE.bgColor}`)
  })

  it('uses fallback argument before defaults', () => {
    const css = toCss({}, { color: 'cyan', bgColor: 'navy' })
    expect(css).toContain('color: cyan')
    expect(css).toContain('background-color: navy')
  })

  it('uses DEFAULT_NAMESPACE_STYLE as constructor fallback', () => {
    const css = toCss({}, DEFAULT_NAMESPACE_STYLE)
    expect(css).toContain(`color: ${DEFAULT_NAMESPACE_STYLE.color}`)
    expect(css).toContain(`background-color: ${DEFAULT_NAMESPACE_STYLE.bgColor}`)
  })
})

describe('formatArg', () => {
  it('returns strings unchanged', () => {
    expect(formatArg('hello')).toBe('hello')
  })

  it('stringifies numbers and booleans', () => {
    expect(formatArg(42)).toBe('42')
    expect(formatArg(true)).toBe('true')
  })

  it('JSON-stringifies plain objects', () => {
    expect(formatArg({ ok: true })).toBe('{"ok":true}')
  })

  it('falls back to String for non-JSON-serializable values', () => {
    const circular: { self?: unknown } = {}
    circular.self = circular
    expect(formatArg(circular)).toBe('[object Object]')
  })
})

describe('buildConsolePayload', () => {
  const namespaceStyle = toCss(
    { color: 'white', bgColor: 'orange' },
    DEFAULT_NAMESPACE_STYLE,
  )
  const argStyles = [
    toCss({ color: 'white', bgColor: 'blue' }),
    toCss({ color: 'white', bgColor: 'yellow' }),
  ]

  it('builds format string with one %c per segment', () => {
    const [format] = buildConsolePayload(
      'App',
      namespaceStyle,
      argStyles,
      ['a', 'b'],
    )
    expect(format).toBe('%cApp %ca %cb')
  })

  it('returns namespace style first, then per-arg styles', () => {
    const payload = buildConsolePayload(
      'App',
      namespaceStyle,
      argStyles,
      ['a', 'b'],
    )
    expect(payload).toEqual([expect.any(String), namespaceStyle, argStyles[0], argStyles[1]])
    expect(payload[1]).toContain('background-color: orange')
    expect(payload[2]).toContain('background-color: blue')
    expect(payload[3]).toContain('background-color: yellow')
  })

  it('uses default arg style when index has no configured style', () => {
    const payload = buildConsolePayload(
      'App',
      namespaceStyle,
      argStyles,
      ['a', 'b', 'c'],
    )
    const thirdArgStyle = payload[4]
    expect(thirdArgStyle).toContain(`color: ${DEFAULT_ARG_STYLE.color}`)
    expect(thirdArgStyle).toContain(
      `background-color: ${DEFAULT_ARG_STYLE.bgColor}`,
    )
  })

  it('formats object arguments in the format string', () => {
    const [format] = buildConsolePayload('App', namespaceStyle, [], [{ x: 1 }])
    expect(format).toBe('%cApp %c{"x":1}')
  })
})
