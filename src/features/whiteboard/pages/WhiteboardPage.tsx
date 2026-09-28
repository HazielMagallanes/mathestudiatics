import { useTranslation } from 'react-i18next'

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
      <Whiteboard />
    </div>
  )
}
