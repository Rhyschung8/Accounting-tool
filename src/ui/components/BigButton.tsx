export function BigButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button className="big-button" onClick={onClick}>
      <span className="big-button__icon" aria-hidden>{icon}</span>
      <span className="big-button__label">{label}</span>
    </button>
  )
}
