// src/ui/components/icons.tsx
// Inline SVG icon set — decorative, line-based, 24px grid.
// All icons: aria-hidden, focusable=false, fill=none, stroke=currentColor.
import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Icon({ size = 24, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  )
}

/** Money coming in — banknote with down-arrow */
export function IconMoneyIn(props: IconProps) {
  return (
    <Icon {...props}>
      {/* banknote rectangle */}
      <rect x="2" y="7" width="20" height="10" rx="2" />
      {/* centre circle (coin symbol) */}
      <circle cx="12" cy="12" r="2" />
      {/* down-arrow above the note */}
      <line x1="12" y1="1" x2="12" y2="5" />
      <polyline points="9 3 12 6 15 3" />
    </Icon>
  )
}

/** Money going out — receipt with zigzag bottom */
export function IconMoneyOut(props: IconProps) {
  return (
    <Icon {...props}>
      {/* receipt body */}
      <path d="M5 2 L5 22 L6.5 20.5 L8 22 L9.5 20.5 L11 22 L12.5 20.5 L14 22 L15.5 20.5 L17 22 L17 2 Z" />
      {/* text lines */}
      <line x1="8" y1="8" x2="14" y2="8" />
      <line x1="8" y1="12" x2="14" y2="12" />
    </Icon>
  )
}

/** What's left — coin stack / wallet */
export function IconWhatsLeft(props: IconProps) {
  return (
    <Icon {...props}>
      {/* wallet body */}
      <rect x="2" y="6" width="20" height="14" rx="2" />
      {/* wallet flap */}
      <path d="M2 10 L22 10" />
      {/* coin pocket */}
      <rect x="16" y="13" width="4" height="4" rx="1" />
    </Icon>
  )
}

/** Got paid — banknote with £ sign */
export function IconPaid(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="2" y="7" width="20" height="10" rx="2" />
      {/* £ glyph */}
      <path d="M10 15 L10 11 Q10 9 12 9 Q14 9 14 11" />
      <line x1="9" y1="13" x2="13" y2="13" />
    </Icon>
  )
}

/** Bought something — shopping bag */
export function IconBought(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 2 L4 22 L20 22 L18 2 Z" />
      <path d="M9 2 Q9 6 12 6 Q15 6 15 2" />
    </Icon>
  )
}

/** Drove to a lesson — simple car side-view */
export function IconDrove(props: IconProps) {
  return (
    <Icon {...props}>
      {/* car body */}
      <path d="M3 13 L6 7 L18 7 L21 13 L21 17 L3 17 Z" />
      {/* windscreen */}
      <path d="M7 7 L8 13 L16 13 L17 7" />
      {/* wheels */}
      <circle cx="7.5" cy="17" r="2" />
      <circle cx="16.5" cy="17" r="2" />
    </Icon>
  )
}

/** Worked from home — house */
export function IconHome(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 11 L12 3 L21 11 L21 21 L15 21 L15 15 L9 15 L9 21 L3 21 Z" />
    </Icon>
  )
}

/** All entries — list with three bullet lines */
export function IconEntries(props: IconProps) {
  return (
    <Icon {...props}>
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <circle cx="4" cy="6" r="1.25" />
      <circle cx="4" cy="12" r="1.25" />
      <circle cx="4" cy="18" r="1.25" />
    </Icon>
  )
}

/** Year-end & filing — calendar */
export function IconYearEnd(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </Icon>
  )
}

/** Good to know — open book */
export function IconGoodToKnow(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2 3 Q2 3 12 3 Q12 3 22 3 L22 20 Q12 18 12 18 Q12 18 2 20 Z" />
      <line x1="12" y1="3" x2="12" y2="18" />
    </Icon>
  )
}

/** Trash / recently deleted — bin */
export function IconTrash(props: IconProps) {
  return (
    <Icon {...props}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6 L18 20 Q18 21 17 21 L7 21 Q6 21 6 20 L5 6" />
      <path d="M10 11 L10 17" />
      <path d="M14 11 L14 17" />
      <path d="M9 6 Q9 3 12 3 Q15 3 15 6" />
    </Icon>
  )
}

/** Settings — gear */
export function IconSettings(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2 L12 5 M12 19 L12 22 M2 12 L5 12 M19 12 L22 12 M4.93 4.93 L7.05 7.05 M16.95 16.95 L19.07 19.07 M19.07 4.93 L16.95 7.05 M7.05 16.95 L4.93 19.07" />
    </Icon>
  )
}

/** Home nav item — house outline (slightly different from IconHome for variety) */
export function IconHomeNav(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 11 L12 3 L21 11 L21 21 L3 21 Z" />
      <path d="M9 21 L9 15 L15 15 L15 21" />
    </Icon>
  )
}

/** Tip / lightbulb */
export function IconTip(props: IconProps) {
  return (
    <Icon {...props}>
      {/* bulb globe */}
      <path d="M9 18 Q8 14 6 12 A6 6 0 1 1 18 12 Q16 14 15 18 Z" />
      {/* base lines */}
      <line x1="9" y1="21" x2="15" y2="21" />
      <line x1="10" y1="23" x2="14" y2="23" />
    </Icon>
  )
}

/** Piano brand — stylised piano keys */
export function IconPiano(props: IconProps) {
  return (
    <Icon {...props}>
      {/* white keys outer frame */}
      <rect x="2" y="4" width="20" height="16" rx="1.5" />
      {/* key dividers */}
      <line x1="6.8" y1="4" x2="6.8" y2="20" />
      <line x1="11.6" y1="4" x2="11.6" y2="20" />
      <line x1="16.4" y1="4" x2="16.4" y2="20" />
      {/* black keys */}
      <rect x="4.5" y="4" width="3" height="9" rx="1" />
      <rect x="9.3" y="4" width="3" height="9" rx="1" />
      <rect x="14.1" y="4" width="3" height="9" rx="1" />
    </Icon>
  )
}
