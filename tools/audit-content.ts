import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { runSiteAudit } from './audits/common.ts'
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
  // Match the former package script's order and && short-circuit behavior.
  const audits = [runRuntimeAudit, runSilkAudit, runStdlibAudit,
    ...(['sage', 'slg', 'virtnosis'] as const).map(collection =>
      (ctx: AuditContext, output: Reporter) => runSiteAudit(ctx, collection, output)),
  ]
  for (const audit of audits) {
    const rc = audit(context, reporter)
    if (rc !== 0) return rc
  }
  return 0
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = runContentAudit()
}
