import { test } from 'node:test'
import assert from 'node:assert/strict'
import { copyContact, motionBehavior } from '../src/interactions.js'

test('copy reports success only after the clipboard accepts the email', async () => {
  let written = ''
  assert.equal(await copyContact({ writeText: async value => { written = value } }), '邮箱已复制')
  assert.equal(written, 'duyufei000@126.com')
})
test('unavailable or denied clipboard gives an actionable fallback', async () => {
  assert.equal(await copyContact(undefined), '复制未成功，请点击邮箱发送邮件')
  assert.equal(await copyContact({ writeText: async () => { throw new Error('denied') } }), '复制未成功，请点击邮箱发送邮件')
})
test('reduced motion disables animated scrolling', () => {
  assert.equal(motionBehavior(true), 'auto')
  assert.equal(motionBehavior(false), 'smooth')
})
