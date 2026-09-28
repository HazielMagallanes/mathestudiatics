import { useTranslation } from 'react-i18next'

import { units } from '@/content/registry'
import { isMixPreference, MIX_PREFERENCES, type MixPreference } from '@/content/select'
import { DIFFICULTIES, type Difficulty } from '@/content/schema'
import { useContentLocale } from '@/shared/i18n/useContentLocale'
import { cn } from '@/shared/ui/cn'

interface PracticeControlsProps {
  selectedUnits: string[]
  difficulty: Difficulty
  mix: MixPreference
  onToggleUnit: (unitId: string) => void
  onDifficultyChange: (difficulty: Difficulty) => void
  onMixChange: (mix: MixPreference) => void
}

export function PracticeControls({
  selectedUnits,
  difficulty,
  mix,
  onToggleUnit,
  onDifficultyChange,
  onMixChange,
}: PracticeControlsProps) {
  const { t } = useTranslation()
  const locale = useContentLocale()

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <fieldset className="rounded-lg border border-rule bg-surface-raised p-4">
        <legend className="px-1 text-sm font-semibold">{t('practice.selectUnits')}</legend>
        <ul className="flex list-none flex-wrap gap-2 p-0">
          {units.map((unit) => {
            const isSelected = selectedUnits.includes(unit.id)
            const isDisabled = !isSelected && selectedUnits.length >= 2

            return (
              <li key={unit.id}>
                <label
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-md border border-rule px-3 py-1.5 text-sm transition-colors',
                    isSelected ? 'border-accent text-accent' : 'text-fg-muted hover:text-fg',
                    isDisabled && 'cursor-not-allowed opacity-50',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={isDisabled}
                    onChange={() => {
                      onToggleUnit(unit.id)
                    }}
                  />
                  {unit.title[locale]}
                </label>
              </li>
            )
          })}
        </ul>
      </fieldset>

      <div className="space-y-4">
        <fieldset className="rounded-lg border border-rule bg-surface-raised p-4">
          <legend className="px-1 text-sm font-semibold">{t('practice.difficulty')}</legend>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {DIFFICULTIES.map((level) => (
              <label key={level} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="difficulty"
                  value={level}
                  checked={difficulty === level}
                  onChange={() => {
                    onDifficultyChange(level)
                  }}
                />
                {t(`practice.difficulties.${level}`)}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="border-rule bg-surface-raised flex flex-wrap items-center gap-2 rounded-lg border p-4 text-sm">
          <span className="font-semibold">{t('practice.mix')}</span>
          <select
            value={mix}
            onChange={(event) => {
              const next = event.target.value

              if (isMixPreference(next)) {
                onMixChange(next)
              }
            }}
            className="rounded-md border border-rule bg-surface px-2 py-1 text-sm"
          >
            {MIX_PREFERENCES.map((option) => (
              <option key={option} value={option}>
                {t(`practice.mixOptions.${option}`)}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}
