// src/ui/FilingDeadlineReminder.tsx
import { useStore } from '../state/useStore'
import { currentFilingDeadline } from '../domain/taxDeadlines'
import { IconYearEnd } from './components/icons'

/** Only worth a home-page nudge once the deadline is within reach. */
const URGENT_WITHIN_DAYS = 30

export function FilingDeadlineReminder() {
  const { state } = useStore()
  const deadline = currentFilingDeadline(state.entries)
  if (!deadline) return null

  const [year] = deadline.deadlineDate.split('-')
  const urgent = deadline.daysLeft <= URGENT_WITHIN_DAYS

  return (
    <section
      className={`deadline-reminder${urgent ? ' deadline-reminder--urgent' : ''}`}
      aria-label="세금 신고 마감일 / Filing deadline"
    >
      <IconYearEnd size={22} className="deadline-reminder__icon" />
      <div>
        <p className="deadline-reminder__year">
          <span className="lang-ko">{deadline.taxYear} 세금 연도</span>
          <span className="lang-en">Tax year {deadline.taxYear}</span>
        </p>
        <p className="deadline-reminder__count">
          <span className="lang-ko">신고 마감까지 {deadline.daysLeft}일 남음</span>
          <span className="lang-en">{deadline.daysLeft} days until you need to file</span>
        </p>
        <p className="deadline-reminder__date">
          <span className="lang-ko">{year}년 1월 31일까지 온라인 신고 및 납부</span>
          <span className="lang-en">Online filing &amp; payment due 31 January {year}</span>
        </p>
        {urgent && (
          <p className="deadline-reminder__penalty">
            <span className="lang-ko">놓치면 세금이 없어도 £100 벌금이 바로 부과돼요</span>
            <span className="lang-en">Miss it and you get an instant £100 penalty, even if you owe no tax</span>
          </p>
        )}
      </div>
    </section>
  )
}
