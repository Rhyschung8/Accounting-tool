import { GOOD_TO_KNOW, GLOSSARY } from '../config/guidance'
import { CATEGORIES } from '../config/categories'

export function GoodToKnow() {
  return (
    <article className="good-to-know">
      <h2>알아두기 / Good to know</h2>

      <section className="topics">
        {GOOD_TO_KNOW.map(topic => (
          <details key={topic.id}>
            <summary>{topic.titleKo} / {topic.titleEn}</summary>
            <p>{topic.bodyKo}</p>
            <p>{topic.bodyEn}</p>
            <p>
              <a href={topic.govUkUrl} target="_blank" rel="noreferrer">
                자세히 / Learn more
              </a>
            </p>
            <p className="checked-on">확인일 / checked {topic.checkedOn}</p>
          </details>
        ))}
      </section>

      <section className="category-examples">
        <h3>지출 분류 예시 / Expense category examples</h3>
        <p className="category-examples__intro">
          <span className="lang-ko">돈을 썼을 때 어떤 분류를 골라야 할지 헷갈리면 아래 예시를 참고하세요.</span>
          <span className="lang-en">Not sure which category to pick when you log an expense? Use these examples as a guide.</span>
        </p>
        <dl>
          {CATEGORIES.filter(cat => cat.key !== 'uncategorised').map(cat => (
            <div key={cat.key}>
              <dt>{cat.labelKo} / {cat.labelEn}</dt>
              <dd>{cat.examplesKo.join(', ')}</dd>
              <dd>{cat.examplesEn.join(', ')}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="glossary">
        <h3>용어 / Words you might see</h3>
        <dl>
          {GLOSSARY.map(entry => (
            <div key={entry.termEn}>
              <dt>{entry.termKo} / {entry.termEn}</dt>
              <dd>{entry.meaningKo}</dd>
              <dd>{entry.meaningEn}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="disclaimer">
        일반 정보이며 세무 자문이 아닙니다 / General information, not personal tax advice.
      </p>
    </article>
  )
}
