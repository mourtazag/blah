import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Blah from './Blah'
import { DEFAULT_NAMESPACE_STYLE, toCss } from './blah-utils'

describe('Blah', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => { })
    vi.spyOn(console, 'info').mockImplementation(() => { })
    vi.spyOn(console, 'warn').mockImplementation(() => { })
    vi.spyOn(console, 'error').mockImplementation(() => { })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const createLogger = () =>
    new Blah({
      namespace: {
        name: 'App',
        style: { color: 'white', bgColor: 'orange' },
      },
      argStyles: [
        { color: 'white', bgColor: 'blue' },
        { color: 'white', bgColor: 'yellow' },
      ],
    })

  it('defaults namespace name to Blah', () => {
    const logger = new Blah({ namespace: {} })
    logger.log('ping')
    expect(console.log).toHaveBeenCalledWith(
      '%cBlah %cping',
      toCss({}, DEFAULT_NAMESPACE_STYLE),
      expect.stringContaining('background-color: transparent'),
    )
  })

  it('calls console.log with styled payload', () => {
    const logger = createLogger()
    logger.log('hello', 'world')

    expect(console.log).toHaveBeenCalledOnce()
    const [format, namespaceStyle, firstArgStyle, secondArgStyle] = vi.mocked(
      console.log,
    ).mock.calls[0]!

    expect(format).toBe('%cApp %chello %cworld')
    expect(namespaceStyle).toContain('background-color: orange')
    expect(firstArgStyle).toContain('background-color: blue')
    expect(secondArgStyle).toContain('background-color: yellow')
  })

  it('log works when extracted without manual bind', () => {
    const logger = new Blah({ namespace: { name: 'App' } })
    const log = logger.log

    log('detached')

    expect(console.log).toHaveBeenCalledOnce()
  })

  it('routes info, warn, and error to matching console methods', () => {
    const logger = createLogger()

    logger.info('i')
    logger.warn('w')
    logger.error('e')

    expect(console.info).toHaveBeenCalledOnce()
    expect(console.warn).toHaveBeenCalledOnce()
    expect(console.error).toHaveBeenCalledOnce()
    expect(console.log).not.toHaveBeenCalled()
  })

  it('passes object arguments with %o for native DevTools expansion', () => {
    const logger = createLogger()
    const obj = { ok: true }
    logger.log(obj)

    const call = vi.mocked(console.log).mock.calls[0]!
    expect(call[0]).toBe('%cApp %c %o')
    expect(call[3]).toEqual(obj)
  })

  it('prints nothing when logging.enabled is false', () => {
    const logger = new Blah({
      namespace: { name: 'App' },
      logging: { enabled: false },
    })

    logger.log('a')
    logger.info('b')
    logger.warn('c')
    logger.error('d')

    expect(console.log).not.toHaveBeenCalled()
    expect(console.info).not.toHaveBeenCalled()
    expect(console.warn).not.toHaveBeenCalled()
    expect(console.error).not.toHaveBeenCalled()
  })

  it('disables only configured levels', () => {
    const logger = new Blah({
      namespace: { name: 'App' },
      logging: { log: false, error: false },
    })

    logger.log('skip')
    logger.info('keep')
    logger.warn('keep')
    logger.error('skip')

    expect(console.log).not.toHaveBeenCalled()
    expect(console.info).toHaveBeenCalledOnce()
    expect(console.warn).toHaveBeenCalledOnce()
    expect(console.error).not.toHaveBeenCalled()
  })

  it('updates logging at runtime via setLogging', () => {
    const logger = createLogger()

    logger.setLogging({ enabled: false })
    logger.log('off')
    expect(console.log).not.toHaveBeenCalled()

    logger.setLogging({ enabled: true, log: true })
    logger.log('on')
    expect(console.log).toHaveBeenCalledOnce()
  })

  it('reports isEnabled from current logging config', () => {
    const logger = new Blah({
      namespace: { name: 'App' },
      logging: { warn: false },
    })

    expect(logger.isEnabled('log')).toBe(true)
    expect(logger.isEnabled('warn')).toBe(false)
  })

  it('prints when debug is true even if logging is fully disabled', () => {
    const logger = new Blah({
      namespace: { name: 'App' },
      logging: { enabled: false },
      debug: true,
    })

    logger.log('forced')
    logger.error('forced')

    expect(console.log).toHaveBeenCalledOnce()
    expect(console.error).toHaveBeenCalledOnce()
  })

  it('prints disabled levels when debug overrides logging', () => {
    const logger = new Blah({
      namespace: { name: 'App' },
      logging: { log: false, warn: false },
      debug: true,
    })

    logger.log('forced')
    logger.warn('forced')

    expect(console.log).toHaveBeenCalledOnce()
    expect(console.warn).toHaveBeenCalledOnce()
  })

  it('toggles debug at runtime via setDebug', () => {
    const logger = new Blah({
      namespace: { name: 'App' },
      logging: { enabled: false },
    })

    logger.log('muted')
    expect(console.log).not.toHaveBeenCalled()

    logger.setDebug(true)
    expect(logger.isEnabled('log')).toBe(true)
    logger.log('forced')
    expect(console.log).toHaveBeenCalledOnce()
  })
})
