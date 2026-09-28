import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

test('generated WebP portfolio art is served with the correct media type', () => {
  const workerPath = new URL('../dist/server/index.js', import.meta.url)
  return import(workerPath.href).then(async ({ default: worker }) => {
    for (const name of ['agent', 'prism', 'reading']) {
      const response = await worker.fetch(new Request(`https://portfolio.test/media/${name}-concept.webp`))
      assert.equal(response.status, 200)
      assert.equal(response.headers.get('content-type'), 'image/webp')
      const signature = new TextDecoder('ascii').decode((await response.arrayBuffer()).slice(0, 4))
      assert.equal(signature, 'RIFF')
    }
  })
})

test('static preview contains the same artwork as the Worker output', async () => {
  const { default: worker } = await import(new URL('../dist/server/index.js', import.meta.url).href)
  for (const name of ['agent', 'prism', 'reading']) {
    const path = `/media/${name}-concept.webp`
    const response = await worker.fetch(new Request(`https://portfolio.test${path}`))
    const staticBytes = await readFile(new URL(`../dist/static${path}`, import.meta.url))
    assert.deepEqual(new Uint8Array(await response.arrayBuffer()), new Uint8Array(staticBytes))
  }
})

test('the linked Agent resume is available in both output formats', async () => {
  const name = '杜雨菲_Agent应用开发_简历.pdf'
  const workerPath = new URL('../dist/server/index.js', import.meta.url)
  const { default: worker } = await import(workerPath.href)
  const response = await worker.fetch(new Request(`https://portfolio.test/${encodeURI(name)}`))
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('content-type'), 'application/pdf')
  const bytes = new Uint8Array(await response.arrayBuffer())
  assert.equal(new TextDecoder('ascii').decode(bytes.slice(0, 4)), '%PDF')
  const staticBytes = await readFile(new URL(`../dist/static/${name}`, import.meta.url))
  assert.deepEqual(bytes, new Uint8Array(staticBytes))
})
