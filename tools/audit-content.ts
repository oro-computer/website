import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { withSourceInventory } from './audits/common.ts'
import type { AuditContext, Reporter } from './audits/common.ts'
import { runRuntimeAudit } from './audits/runtime.ts'
import { runSilkAudit, runStdlibAudit } from './audits/silk.ts'

export function auditContext(env: NodeJS.ProcessEnv = process.env): AuditContext {
  const siteRoot = fileURLToPath(new URL('../', import.meta.url)).replace(/\/$/, '')
  return {
    siteRoot,
    outputRoot: resolve(env.ORO_SITE_OUTPUT ?? resolve(siteRoot, 'public')),
    runtimeRepo: env.ORO_RUNTIME_REPO === undefined ? undefined : resolve(env.ORO_RUNTIME_REPO),
  }
}
export function runContentAudit(context = auditContext(), reporter: Reporter = console): number {
  context = withSourceInventory(context)
  const audits = [runRuntimeAudit, runSilkAudit, runStdlibAudit]
  for (const audit of audits) {
    const rc = audit(context, reporter)
    if (rc !== 0) return rc
  }
  return 0
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = runContentAudit()
}
