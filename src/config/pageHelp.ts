export interface PageHelpContent {
  titleKo: string
  titleEn: string
  bodyKo: string
  bodyEn: string
}

/**
 * Per-page/per-form "how to use this" content, shown via the PageHelp
 * icon+panel on each screen. Keyed by the page/form's own id.
 */
export const PAGE_HELP: Record<string, PageHelpContent> = {
  home: {
    titleKo: '홈 화면 사용법',
    titleEn: 'Using the Home screen',
    bodyKo:
      '홈 화면에서는 올해 요약과 아래 네 개의 버튼을 볼 수 있어요. 버튼을 눌러서 받은 돈, 쓴 돈, 이동한 거리, ' +
      '재택근무 시간을 바로 기록할 수 있어요. 왼쪽 메뉴에서 전체 내역, 연말 정산, 알아두기 페이지로 이동할 수 있어요.',
    bodyEn:
      "The Home screen shows your summary for the year and four buttons below it. Tap a button to record money you " +
      "received, money you spent, a drive to a lesson, or hours worked from home. Use the menu on the left to go to " +
      "All entries, Year-end & filing, or Good to know.",
  },
  entries: {
    titleKo: '전체 내역 사용법',
    titleEn: 'Using All entries',
    bodyKo:
      '여기서는 지금까지 기록한 모든 수입과 지출을 월별로 볼 수 있어요. 항목을 눌러서 내용을 수정하거나 삭제할 수 있어요. ' +
      "삭제한 항목은 실수로 지워도 걱정하지 마세요 — '최근 삭제'에서 복원할 수 있어요.",
    bodyEn:
      "Here you can see every income and expense entry you've recorded, grouped by month. Tap an entry to edit or " +
      "delete it. Don't worry if you delete something by mistake — you can restore it from 'Recently deleted'.",
  },
  yearEnd: {
    titleKo: '연말 정산 사용법',
    titleEn: 'Using Year-end & filing',
    bodyKo:
      '세금 연도를 선택하면 그 해의 총수입, 비용, 이익(또는 손실)을 볼 수 있어요. 아래에는 신고 전 확인할 목록과, ' +
      '자기신고(Self Assessment) 서식의 각 칸에 어떤 숫자를 적어야 하는지 하나씩 안내해 드려요.',
    bodyEn:
      "Choose a tax year to see that year's turnover, expenses, and profit (or loss). Below that, you'll find a " +
      "before-you-file checklist and a step-by-step guide to which number goes in each box of your Self Assessment form.",
  },
  deleted: {
    titleKo: '최근 삭제 사용법',
    titleEn: 'Using Recently deleted',
    bodyKo: "실수로 삭제한 항목이 여기 남아 있어요. '복원' 버튼을 누르면 전체 내역으로 다시 돌아가요.",
    bodyEn: "Anything you've deleted stays here. Tap 'Restore' to bring it back to your entries list.",
  },
  settings: {
    titleKo: '설정 사용법',
    titleEn: 'Using Settings',
    bodyKo:
      '여기서 글자 크기, 주당 재택근무 시간, 기타 수입, 큰 구매 기준 등을 바꿀 수 있어요. ' +
      '바꾼 뒤에는 꼭 각 항목의 저장 버튼을 눌러주세요.',
    bodyEn:
      "Here you can change the text size, your weekly hours working from home, other income, and the large-purchase " +
      "threshold. Remember to tap each section's own Save button after making a change.",
  },
  gotPaid: {
    titleKo: "'돈을 받았어요' 사용법",
    titleEn: "Using 'I got paid'",
    bodyKo:
      "예전에 받은 적 있는 사람의 이름을 누르면 지난번과 같은 금액으로 바로 기록돼요. " +
      "새로운 분이면 '새 분'을 눌러서 날짜, 금액, 이름을 직접 입력해 주세요.",
    bodyEn:
      "Tap a name you've been paid by before to log the same amount again instantly. For someone new, tap " +
      "'Someone new' and enter the date, amount, and name yourself.",
  },
  boughtSomething: {
    titleKo: "'돈을 썼어요' 사용법",
    titleEn: "Using 'I bought something'",
    bodyKo:
      '무엇을 샀는지 적으면 알맞은 분류를 자동으로 제안해 드려요. 필요하면 분류를 직접 바꿀 수 있어요. ' +
      "금액이 크면 '업무 사용 비율'을 선택해서 업무용으로 쓴 부분만 비용으로 처리할 수 있어요.",
    bodyEn:
      "Describe what you bought and we'll suggest a category automatically — you can change it if needed. For " +
      "larger purchases, choose how much of it was for business use, so only that share counts as an expense.",
  },
  drove: {
    titleKo: "'레슨 장소로 운전했어요' 사용법",
    titleEn: "Using 'I drove to a lesson'",
    bodyKo:
      "예전에 갔던 장소를 누르면 같은 거리로 바로 기록돼요. 새로운 장소면 '새 장소'를 눌러서 목적지와 거리(마일)를 " +
      '입력해 주세요. 금액은 자동으로 계산돼요.',
    bodyEn:
      "Tap a place you've driven to before to log the same distance again. For somewhere new, tap 'Somewhere new' " +
      "and enter the destination and distance in miles — the amount is worked out for you automatically.",
  },
  workedFromHome: {
    titleKo: "'재택근무를 했어요' 사용법",
    titleEn: "Using 'I worked from home'",
    bodyKo: '주당 재택근무 시간을 입력하고 저장하면, 그 시간에 맞는 재택근무 비용이 자동으로 계산돼서 기록돼요.',
    bodyEn:
      "Enter your weekly hours working from home and save — the matching home-office expense is worked out and " +
      "recorded automatically.",
  },
}
