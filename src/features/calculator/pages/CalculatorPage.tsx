import { useTranslation } from 'react-i18next'

import { Calculator } from '@/features/calculator/components/Calculator'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import { PageHeader } from '@/shared/ui/PageHeader'

export default function CalculatorPage() {
  const { t } = useTranslation()
  const title = t('calculator.title')

  useDocumentTitle(title)

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={t('calculator.description')} />
      <Calculator />
    </div>
  )
}
