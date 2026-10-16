import { slug } from '#lib/markdown.ts'

/** Present-tense language for Silk references, after legacy import cleanup.
 * The caller protects code fences; technical limits and diagnostics stay intact.
 */
function normalize(text: string): string {
  return text
    .replace(/^(\s*)Currently:[ \t]*$/gm, '$1Supported forms:')
    .replace(/^([ \t]*)Currently,[ \t]*([a-z])/gm, (_match, indent: string, letter: string) => indent + letter.toUpperCase())
    .replace(/\bCurrently,[ \t]*/g, '')
    .replace(/\b(in|within|for) the current (?:implementation|(?:compiler(?:\/backend)?|backend|verifier|scalar-slot backend)(?: implementation)? subset)\b/gi,
      (_match, preposition: string) => `${preposition} Silk`)
    .replace(/\bcurrent\s+(?:compiler\s+|backend\s+|verifier\s+)?subset\b/gi, 'supported forms')
    .replace(/\bcurrent-subset\b/gi, 'verification')
    .replace(/\bcurrent\s+(?=(?:[^\s.,;:]+\s+){0,6}subset\b)/gi, '')
    .replace(/\bcurrent\s+(?=(?:implementation|compiler|backend|back-end|checker|verifier|Formal Silk verifier|toolchain|support|supported|API|surface|design|representation|limitations?|limits?|restrictions?|scope|grammar|lowering|stdlib|hosted runtime|hosted async runtime|shipped|operational|hard implementation|module surface)\b)/gi, '')
    .replace(/\bcurrently[ \t]+/gi, '')
    .replace(/\bSilk[ \t]+today\b/g, 'Silk')
    .replace(/\bcompiler[ \t]+today\b/g, 'compiler')
    .replace(/\bimplemented subset\b/gi, 'supported forms')
    .replace(/, initial subset\b/gi, '')
    .replace(/\b(In|in) the (?:initial|shipped) subset\b/g, '$1 Silk')
    .replace(/[ \t]*\((?:current|shipped)\)/gi, '')
    .replace(/^(#{1,6} )([a-z])/gm, (_match, prefix: string, letter: string) => prefix + letter.toUpperCase())
    .replace(/[ \t]+$/gm, '')
}

export function silkProse(text: string): string {
  const counts = new Map<string, number>()
  const withAliases = text.replace(/^#{1,6} (.+)$/gm, (heading, title: string) => {
    const base = slug(title)
    const count = counts.get(base) ?? 0
    counts.set(base, count + 1)
    const changed = normalize(heading)
    if (slug(changed.replace(/^#{1,6} /, '')) === base) return changed
    const id = count ? `${base}-${count}` : base
    return `<span id="${id}"></span>\n\n${changed}`
  })
  return normalize(withAliases)
}
