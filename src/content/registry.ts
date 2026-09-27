import type { ExerciseGenerator, UnitDefinition } from '@/content/schema'

/**
 * Content packs are discovered automatically: dropping a folder under
 * `src/content/units/<id>/index.ts` (default-exporting a `UnitDefinition`)
 * is enough to add a unit — no registry edits.
 */
const unitModules = import.meta.glob<{ default: UnitDefinition }>('./units/*/index.ts', {
  eager: true,
})

export const units: readonly UnitDefinition[] = Object.values(unitModules)
  .map((module) => module.default)
  .sort((left, right) => left.order - right.order)

export function findUnit(unitId: string): UnitDefinition | undefined {
  return units.find((unit) => unit.id === unitId)
}

export function allGeneratorsOf(source: readonly UnitDefinition[] = units): ExerciseGenerator[] {
  return source.flatMap((unit) => unit.generators)
}
