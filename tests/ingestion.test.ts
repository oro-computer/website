import { test } from 'node:test'
import { execFileSync } from 'node:child_process'
test('manual upstream generators preserve curated content and ingestion ownership', () => {
  execFileSync('python3', ['tests/test_ingestion.py'], { stdio: 'inherit' })
})
