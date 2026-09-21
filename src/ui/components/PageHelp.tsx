import { useState } from 'react'
import type { PageHelpContent } from '../../config/pageHelp'
import { IconHelp } from './icons'

/**
 * Small "?" trigger that reveals a bilingual how-to-use panel for the
 * page/form it's placed in. `variant="modal"` anchors the panel inside a
 * form modal instead of floating relative to the viewport.
 */
export function PageHelp({
  content,
  variant = 'page',
}: {
  content: PageHelpContent
  variant?: 'page' | 'modal'
}) {
  const [open, setOpen] = useState(false)

  const openModalClass = variant === 'modal' && open ? ' page-help--open' : ''

  return (
    <div className={`page-help page-help--${variant}${openModalClass}`}>
      <button
        type="button"
        className="page-help__trigger"
        aria-expanded={open}
        aria-label="도움말 보기 / Show help"
        onClick={() => setOpen(o => !o)}
      >
        <IconHelp size={20} />
      </button>
      {open && (
        <div className="page-help__panel" role="note">
          <button
            type="button"
            className="page-help__close"
            aria-label="닫기 / Close"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
          <h3>
            <span className="lang-ko">{content.titleKo}</span>
            <span className="lang-en">{content.titleEn}</span>
          </h3>
          <p className="lang-ko">{content.bodyKo}</p>
          <p className="lang-en">{content.bodyEn}</p>
        </div>
      )}
    </div>
  )
}
