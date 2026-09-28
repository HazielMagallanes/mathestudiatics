import { useTranslation } from 'react-i18next'
import { useRegisterSW } from 'virtual:pwa-register/react'

import { buttonPrimary } from '@/shared/ui/buttons'

/**
 * Shows a small banner when a new version of the app has been deployed and
 * waits for the user to update (registerType: 'prompt').
 */
export function UpdatePrompt() {
  const { t } = useTranslation()
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) {
    return null
  }

  return (
    <div
      role="status"
      className="border-rule bg-surface-raised fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg"
    >
      <span>{t('pwa.updateAvailable')}</span>
      <button
        type="button"
        className={buttonPrimary}
        onClick={() => {
          void updateServiceWorker(true)
        }}
      >
        {t('pwa.update')}
      </button>
    </div>
  )
}
