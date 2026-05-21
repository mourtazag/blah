import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import { chromium } from 'playwright'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const imagesDir = path.join(root, 'docs', 'images')

fs.mkdirSync(imagesDir, { recursive: true })

async function captureConsolePreview(page) {
  const file = path.join(root, 'docs', 'console-preview.html')
  await page.goto(`file://${file}`)
  await page.setViewportSize({ width: 920, height: 280 })
  await page.screenshot({
    path: path.join(imagesDir, 'console-example.png'),
  })
}

async function capturePlayground(page, port) {
  await page.setViewportSize({ width: 1100, height: 720 })
  await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'networkidle' })
  await page.locator('#btn-primary').click()
  await page.screenshot({
    path: path.join(imagesDir, 'playground.png'),
    fullPage: true,
  })
}

async function findPlaygroundPort() {
  for (const port of [3000, 3001]) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}`)
      if (res.ok) return { port, devServer: null }
    } catch {
      /* try next */
    }
  }
  return null
}

function startDevServer(port) {
  return new Promise((resolve, reject) => {
    const child = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(port)], {
      cwd: root,
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let ready = false
    const onData = chunk => {
      const text = chunk.toString()
      if (!ready && text.includes(`127.0.0.1:${port}`)) {
        ready = true
        resolve(child)
      }
    }

    child.stdout.on('data', onData)
    child.stderr.on('data', onData)
    child.on('error', reject)

    setTimeout(() => {
      if (!ready) reject(new Error(`Vite dev server did not start on port ${port}`))
    }, 15000)
  })
}

async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  await captureConsolePreview(page)

  let devServer
  try {
    const existing = await findPlaygroundPort()
    const port = existing?.port ?? 3001
    if (!existing) devServer = await startDevServer(port)
    await new Promise(r => setTimeout(r, 800))
    await capturePlayground(page, port)
  } finally {
    devServer?.kill('SIGTERM')
    await browser.close()
  }

  console.log('Screenshots saved to docs/images/')
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
