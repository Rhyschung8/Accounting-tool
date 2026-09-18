import type { ReactNode } from 'react'

export function BigButton({
  icon,
  labelKo,
  labelEn,
  onClick,
}: {
  icon: ReactNode
  labelKo: string
  labelEn: string
  onClick: () => void
}) {
  return (
    <button className="big-button" onClick={onClick}>
      <span className="big-button__icon" aria-hidden>{icon}</span>
      <span className="big-button__label">
        <span className="lang-ko">{labelKo}</span>
        <span className="lang-en">{labelEn}</span>
      </span>
    </button>
  )
}
