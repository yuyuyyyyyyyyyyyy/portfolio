import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const page = readFileSync(new URL('../src/App.vue', import.meta.url), 'utf8')

test('engineering role and project order are visible in source', () => {
  assert.match(page, /<h1>AI 应用 \/<br><em>Agent 开发工程师<\/em><\/h1>/)
  const ids = [...page.matchAll(/no: '\d\d', id: '(\w+)'/g)].map(match => match[1])
  assert.deepEqual(ids, ['agent', 'plugin', 'prism', 'reading', 'ops'])
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
