import type { ValidatePageVars } from '@domstack/static/types.js'
import type globalVars from '../globals/global.vars.ts'


// Validate supplied HTML companion vars, rather than inferring missing renderer requirements.
export type CheckedPageVars<Vars extends { layout: string }> = ValidatePageVars<
  Vars['layout'],
  Vars,
  typeof globalVars
>
