import { useTranslation } from 'react-i18next'

import { Calculator } from '@/features/calculator/components/Calculator'
import { PinnedExercisePanel } from '@/features/whiteboard/components/PinnedExercisePanel'
import { Whiteboard } from '@/features/whiteboard/components/Whiteboard'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import { PageHeader } from '@/shared/ui/PageHeader'

export default function WhiteboardPage() {
  const { t } = useTranslation()
  const title = t('whiteboard.title')

  useDocumentTitle(title)

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={t('whiteboard.description')} />
      <PinnedExercisePanel />
      <Whiteboard />
      <details className="border-rule bg-surface-raised rounded-lg border p-4">
        <summary className="cursor-pointer text-sm font-semibold select-none">
          {t('whiteboard.calculatorPanel')}
        </summary>
        <div className="mt-4">
          <Calculator />
        </div>
      </details>
    </div>
  )
}
