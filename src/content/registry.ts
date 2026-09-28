import type { ExerciseGenerator, LocalizedText, UnitDefinition } from '@/content/schema'

/**
 * Content packs are discovered automatically: dropping a folder under
 * `src/content/units/<id>/index.ts` (default-exporting a `UnitDefinition`)
 * is enough to add a unit — no registry edits.
 */
const unitModules = import.meta.glob<{ default: UnitDefinition }>('./units/*/index.ts', {
  eager: true,
})

/**
 * Combined generators live outside units: they declare two or more units and
 * are offered only when every one of them is selected.
 */
const combinedModules = import.meta.glob<{ default: readonly ExerciseGenerator[] }>(
  './combined/*.generator.ts',
  { eager: true },
)

const theoryModules = import.meta.glob<string>('./units/*/theory.*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

const formulaModules = import.meta.glob<string>('./units/*/formulas.*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

export interface UnitContent {
  theory: LocalizedText
  formulas: LocalizedText
}

function collectLocalized(
  modules: Record<string, string>,
  kind: 'theory' | 'formulas',
): Map<string, LocalizedText> {
  const result = new Map<string, LocalizedText>()
  const pattern = new RegExp(`^\\./units/([^/]+)/${kind}\\.(es|en)\\.md$`)

  for (const [path, text] of Object.entries(modules)) {
    const match = pattern.exec(path)
    const unitId = match?.[1]
    const locale = match?.[2]

    if (!unitId || (locale !== 'es' && locale !== 'en')) {
      continue
    }

    const entry = result.get(unitId) ?? { es: '', en: '' }
    entry[locale] = text
    result.set(unitId, entry)
  }

  return result
}

const theoryByUnit = collectLocalized(theoryModules, 'theory')
const formulasByUnit = collectLocalized(formulaModules, 'formulas')

export const units: readonly UnitDefinition[] = Object.values(unitModules)
  .map((module) => module.default)
  .sort((left, right) => left.order - right.order)

export const combinedGenerators: readonly ExerciseGenerator[] = Object.values(combinedModules)
  .flatMap((module) => module.default)
  .sort((left, right) => left.id.localeCompare(right.id))

export function findUnit(unitId: string): UnitDefinition | undefined {
  return units.find((unit) => unit.id === unitId)
}

export function contentFor(unitId: string): UnitContent | undefined {
  const theory = theoryByUnit.get(unitId)
  const formulas = formulasByUnit.get(unitId)

  if (!theory || !formulas) {
    return undefined
  }

  return { theory, formulas }
}

export function allGeneratorsOf(source: readonly UnitDefinition[] = units): ExerciseGenerator[] {
  return [...source.flatMap((unit) => unit.generators), ...combinedGenerators]
}
