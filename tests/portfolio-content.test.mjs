import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const page = readFileSync(new URL('../src/App.vue', import.meta.url), 'utf8')

test('engineering role and project order are visible in source', () => {
  assert.match(page, /<h1><span class="hero-title-line">AI 应用 \/<\/span><br><em class="hero-title-line">Agent 开发工程师<\/em><\/h1>/)
  const ids = [...page.matchAll(/no: '\d\d', id: '(\w+)'/g)].map(match => match[1])
  assert.deepEqual(ids, ['agent', 'plugin', 'prism', 'reading', 'ops'])
})

test('hero arcade shows four workflow steps, five projects and grounded evidence', () => {
  const hero = page.split('<section id="work"')[0]
  assert.equal((hero.match(/class="workflow-key"/g) || []).length, 4)
  for (const id of ['agent', 'plugin', 'prism', 'reading', 'ops']) assert.match(hero, new RegExp(`<a href="#${id}">`))
  assert.match(hero, /2,400\+ 岗位记录/)
  assert.match(hero, /把复杂流程拆成 AI 可执行的步骤/)
  assert.match(page, /media\/agent-real-job-screen\.png/)
  assert.doesNotMatch(page, /media\/agent-concept-v2\.webp/)
  assert.doesNotMatch(page, /杜雨菲|photo\.jpg|17386624550/)
})

test('each project has a technical explanation and the agent has recovery details', () => {
  assert.equal((page.match(/tech: \{/g) || []).length, 5)
  for (const label of ['问题', '方案', '卡点', '状态', '失败恢复', 'READ', 'CHECK', 'VERIFY']) {
    assert.ok(page.includes(label), `missing ${label}`)
  }
  assert.doesNotMatch(page, /TODO: 补充/)
  for (const evidence of ['evidenceId', '人工审核', '模拟解释引擎', '扫描版 PDF', 'send_ambiguous', '六维指标']) {
    assert.ok(page.includes(evidence), `missing grounded detail: ${evidence}`)
  }
})
