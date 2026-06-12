import Link from "next/link";

const sections = [
  ["What is a horoscope?", "A horoscope is a symbolic map of the sky at a specific moment. In personal astrology, that moment is usually birth, and the map is used to read temperament, patterns, timing, and questions."],
  ["What can a horoscope show?", "It can help describe personality, emotional needs, love style, work patterns, recurring challenges, timing, and the themes that become active when current planets touch the birth chart."],
  ["Natal chart", "The natal chart is your birth chart. It shows the placements of the planets, signs, houses, angles, and aspects at the time and place you were born."],
  ["Synastry chart", "Synastry compares two natal charts to read attraction, friction, support, and patterns between two people."],
  ["Transit chart", "A transit chart compares the current sky with your natal chart. It is used to read timing, current pressure, opportunities, and themes that are being activated now."],
  ["Signs", "The twelve zodiac signs describe styles of expression. A planet in Aries acts differently from a planet in Pisces, even when the planet itself is the same."],
  ["Houses", "Houses describe life areas: self, money, communication, home, love, work, partnership, shared resources, worldview, career, community, and the unconscious."],
  ["ASC", "ASC, or Ascendant, is the eastern horizon at birth. It relates to first impressions, your starting style, and the way life seems to meet you."],
  ["MC", "MC, or Midheaven, points to visibility, vocation, reputation, and the direction in which your life tends to become public."],
  ["Aspects", "Aspects are angles between planets. They show how different parts of the psyche cooperate, challenge each other, or create tension that can become growth."],
  ["Orbs", "An orb is the allowed distance from an exact aspect. A tighter orb usually feels stronger."],
  ["Elements", "Fire, earth, air, and water describe the basic temperament of signs: action, stability, thought, and feeling."],
  ["Quality", "Cardinal, fixed, and mutable signs describe how energy begins, sustains, or adapts."],
  ["Ruler", "A ruler is the planet traditionally associated with a sign. It helps connect signs, houses, and planets into a larger reading."],
  ["Double chart", "A double chart places two charts together, often a natal chart and current transits, to see how today's sky touches the birth chart."]
];

export default function EnglishGlossaryPage() {
  return (
    <main className="shell detail-shell">
      <section className="detail-hero">
        <div className="eyebrow">Complete Guide</div>
        <h1>Horoscope guide and glossary</h1>
        <p className="lead">A clear reference for the astrology words that appear in HOSHIYOMI readings.</p>
      </section>
      <section className="terms-stack">
        {sections.map(([title, body]) => (
          <article className="terms-block" key={title}>
            <h2>{title}</h2>
            <p>{body}</p>
          </article>
        ))}
      </section>
      <div className="actions compact-actions">
        <Link className="button primary" href="/en/m">Create my chart</Link>
        <Link className="button" href="/en/consultation">Ask a question</Link>
      </div>
    </main>
  );
}
