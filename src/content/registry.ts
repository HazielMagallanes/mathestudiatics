import type { ExerciseGenerator, UnitDefinition } from '@/content/schema'

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

export const units: readonly UnitDefinition[] = Object.values(unitModules)
  .map((module) => module.default)
  .sort((left, right) => left.order - right.order)

export const combinedGenerators: readonly ExerciseGenerator[] = Object.values(combinedModules)
  .flatMap((module) => module.default)
  .sort((left, right) => left.id.localeCompare(right.id))

export function findUnit(unitId: string): UnitDefinition | undefined {
  return units.find((unit) => unit.id === unitId)
}

export function allGeneratorsOf(source: readonly UnitDefinition[] = units): ExerciseGenerator[] {
  return [...source.flatMap((unit) => unit.generators), ...combinedGenerators]
}
