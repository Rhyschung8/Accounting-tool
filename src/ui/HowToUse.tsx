import { HOW_TO_USE_TOPICS } from '../config/howToUse'

export function HowToUse() {
  return (
    <article className="good-to-know">
      <h2>사용법 / How to use</h2>

      <section className="topics">
        {HOW_TO_USE_TOPICS.map(topic => (
          <details key={topic.id}>
            <summary>{topic.titleKo} / {topic.titleEn}</summary>
            <p>{topic.bodyKo}</p>
            <p>{topic.bodyEn}</p>
          </details>
        ))}
      </section>
    </article>
  )
}
