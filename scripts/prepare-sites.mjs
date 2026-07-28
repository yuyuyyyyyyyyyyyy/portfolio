import { mkdir, writeFile, readFile, readdir, rename, copyFile, rm } from 'node:fs/promises'

const dist = new URL('../dist/', import.meta.url)
const assetsDir = new URL('../dist/assets/', import.meta.url)
const entries = {}
entries['/'] = ['text/html; charset=utf-8', await readFile(new URL('../dist/index.html', import.meta.url), 'utf8'), false]
entries['/index.html'] = entries['/']
for (const name of await readdir(assetsDir)) {
  const type = name.endsWith('.css') ? 'text/css; charset=utf-8' : 'text/javascript; charset=utf-8'
  entries[`/assets/${name}`] = [type, await readFile(new URL(`../dist/assets/${name}`, import.meta.url), 'utf8'), false]
}
entries['/photo.jpg'] = ['image/jpeg', (await readFile(new URL('../dist/photo.jpg', import.meta.url))).toString('base64'), true]
entries['/og.jpg'] = ['image/jpeg', (await readFile(new URL('../dist/og.jpg', import.meta.url))).toString('base64'), true]
entries['/' + encodeURI('杜雨菲_AI产品助理_简历.pdf')] = ['application/pdf', (await readFile(new URL('../dist/杜雨菲_AI产品助理_简历.pdf', import.meta.url))).toString('base64'), true]
for (const name of await readdir(new URL('../dist/media/', import.meta.url))) {
  const type = name.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg'
  entries[`/media/${name}`] = [type, (await readFile(new URL(`../dist/media/${name}`, import.meta.url))).toString('base64'), true]
}
const worker = `const files = ${JSON.stringify(entries)}
function decode(value) {
  const raw = atob(value)
  const bytes = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i)
  return bytes
}
export default {
  async fetch(request) {
    const url = new URL(request.url)
    const entry = files[url.pathname] || (!url.pathname.split('/').pop().includes('.') ? files['/'] : null)
    if (!entry) return new Response('Not found', { status: 404 })
    return new Response(entry[2] ? decode(entry[1]) : entry[1], { headers: { 'content-type': entry[0], 'cache-control': entry[0].startsWith('text/html') ? 'no-store, no-cache, must-revalidate' : 'public, max-age=31536000, immutable' } })
  }
}\n`
await mkdir(new URL('../dist/server/', import.meta.url), { recursive: true })
await writeFile(new URL('../dist/server/index.js', import.meta.url), worker)
await mkdir(new URL('../dist/static/', import.meta.url), { recursive: true })
await rename(new URL('../dist/index.html', import.meta.url), new URL('../dist/static/index.html', import.meta.url))
await rename(new URL('../dist/assets', import.meta.url), new URL('../dist/static/assets', import.meta.url))
await rename(new URL('../dist/photo.jpg', import.meta.url), new URL('../dist/static/photo.jpg', import.meta.url))
await rename(new URL('../dist/PLACEHOLDERS.md', import.meta.url), new URL('../dist/static/PLACEHOLDERS.md', import.meta.url))
await mkdir(new URL('../dist/.openai/', import.meta.url), { recursive: true })
await copyFile(new URL('../.openai/hosting.json', import.meta.url), new URL('../dist/.openai/hosting.json', import.meta.url))




await rm(new URL('../dist/media/', import.meta.url), { recursive: true, force: true })

