import { GOOD_TO_KNOW, GLOSSARY } from '../config/guidance'

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
