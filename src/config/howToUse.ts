export interface HowToUseTopic {
  id: string
  titleKo: string
  titleEn: string
  bodyKo: string
  bodyEn: string
}

/**
 * General app-navigation guide shown on the "How to use" page —
 * distinct from GOOD_TO_KNOW (config/guidance.ts), which explains
 * tax rules rather than the app itself.
 */
export const HOW_TO_USE_TOPICS: HowToUseTopic[] = [
  {
    id: 'menu',
    titleKo: '메뉴 사용하기',
    titleEn: 'Using the menu',
    bodyKo:
      '왼쪽 메뉴에서 홈, 전체 내역, 연말 정산, 알아두기, 사용법 페이지로 이동할 수 있어요. ' +
      '아래쪽에는 최근 삭제와 설정이 있어요.',
    bodyEn:
      'Use the menu on the left to move between Home, All entries, Year-end & filing, Good to know, and How to use. ' +
      'Recently deleted and Settings are at the bottom of the menu.',
  },
  {
    id: 'recording',
    titleKo: '기록하기',
    titleEn: 'Recording something',
    bodyKo:
      '홈 화면의 네 개 버튼으로 대부분의 기록을 할 수 있어요: 돈을 받았어요(수입), 돈을 썼어요(지출), ' +
      '레슨 장소로 운전했어요(교통비), 재택근무를 했어요(재택근무 비용). 버튼을 누르면 작은 창이 열리고, ' +
      '필요한 내용만 입력하면 자동으로 계산되고 저장돼요.',
    bodyEn:
      "Most recording happens through the four buttons on the Home screen: I got paid (income), I bought something " +
      "(expenses), I drove to a lesson (travel), and I worked from home (home-office costs). Tapping a button opens " +
      "a small window — fill in just what's asked and the app works out the rest and saves it.",
  },
  {
    id: 'editing',
    titleKo: '항목 수정·삭제하기',
    titleEn: 'Editing and deleting entries',
    bodyKo:
      "'전체 내역'에서 어떤 항목이든 눌러서 수정하거나 삭제할 수 있어요. 삭제해도 바로 없어지지 않고 " +
      "'최근 삭제'로 옮겨져서, 실수했을 때 '복원' 버튼으로 되돌릴 수 있어요.",
    bodyEn:
      "In 'All entries', tap any entry to edit or delete it. Deleting doesn't erase it right away — it moves to " +
      "'Recently deleted', so a mistake can always be undone with the Restore button.",
  },
  {
    id: 'export',
    titleKo: '내보내기',
    titleEn: 'Exporting your records',
    bodyKo:
      "홈 화면 오른쪽 위의 'CSV 내보내기' 버튼을 누르면, 선택한 세금 연도의 모든 기록을 엑셀에서 열 수 있는 " +
      '파일로 내려받을 수 있어요. 회계사에게 보내거나 직접 확인할 때 유용해요.',
    bodyEn:
      "The 'Export' button at the top right of the Home screen downloads all of the selected tax year's records as " +
      "a file you can open in Excel — useful for sending to an accountant or checking things yourself.",
  },
  {
    id: 'year-end',
    titleKo: '연말 정산 활용하기',
    titleEn: 'Using Year-end & filing',
    bodyKo:
      "'연말 정산' 페이지에서는 한 해의 총수입과 비용, 이익을 보고, 신고서를 내기 전에 확인할 목록과 " +
      '서식의 각 칸에 무엇을 적어야 하는지 안내를 볼 수 있어요.',
    bodyEn:
      "The 'Year-end & filing' page shows your turnover, expenses, and profit for a chosen year, along with a " +
      "before-you-file checklist and a guide to what goes in each box of the tax form.",
  },
]
