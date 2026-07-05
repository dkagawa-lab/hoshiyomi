import Link from "next/link";
import { BirthChartApp } from "@/components/BirthChartApp";
import { LineCtaCard } from "@/components/LineCtaCard";

export default function EnglishHome() {
  return (
    <main className="shell">
      <section className="hero">
        <div className="copy">
          <div className="eyebrow">Your Private Astrologer</div>
          <h1>HOSHIYOMI</h1>
          <p className="lead hero-copy-line">
            <span>Most horoscopes give everyone the same words.</span>
            <span>But what you really want to know is,</span>
            <span>what does this mean for me?</span>
          </p>
          <p className="lead hero-copy-line">
            <span>To understand your path, HOSHIYOMI reads</span>
            <span>the sky at your birth, the sky right now,</span>
            <span>and the question you actually want to ask.</span>
          </p>
          <p className="lead hero-copy-line">
            <span>Love, work, compatibility, timing, uncertainty, hope.</span>
            <span>You can keep consulting through the same chart context.</span>
          </p>
          <div className="actions hero-actions">
            <Link className="button primary" href="/en/m">
              Read my chart for free
            </Link>
            <Link className="button auth-provider-button line" href="/en/register?returnTo=/en/consultation">
              Consult through LINE
            </Link>
            <a className="button" href="#reading-flow">
              See how it works
            </a>
            <Link className="text-link hero-login-link" href="/en/login">
              Already registered? Log in
            </Link>
          </div>

          <div className="hero-reason">
            <span>Why it can feel personal</span>
            <p className="hero-copy-line">
              <span>A horoscope is not only your Sun sign.</span>
              <span>It layers the Sun, Moon, planets, houses,</span>
              <span>and the angles between them.</span>
              <span>That is why it can put words to patterns</span>
              <span>you have felt but not yet named.</span>
            </p>
          </div>

          <div className="journey-strip" id="reading-flow" aria-label="How HOSHIYOMI works">
            <div>
              <span>01</span>
              <strong>Create your chart</strong>
              <p>Use your birth date and birthplace to map your natal sky.</p>
            </div>
            <div>
              <span>02</span>
              <strong>Understand your essence</strong>
              <p>Read the patterns that shape how you feel, choose, and grow.</p>
            </div>
            <div>
              <span>03</span>
              <strong>Keep consulting</strong>
              <p>Ask about love, work, timing, and the choices in front of you.</p>
            </div>
          </div>
        </div>

        <section className="sky-feature hero-sky-feature" aria-label="Orion constellation star field">
          <img src="/images/orion-star-field.jpg" alt="Orion constellation star field" />
          <div className="sky-caption">
            <div className="eyebrow">Real Sky, Personal Reading</div>
            <h2>The starting point is the actual sky</h2>
            <p>
              HOSHIYOMI begins with calculated planetary positions from your birth time and place, then reads them as a map for
              self-understanding and conversation.
            </p>
            <span>Image: Orion Constellation Star Field / NASA, ESA, STScI</span>
          </div>
        </section>

        <div className="hero-app" id="app">
          <BirthChartApp compact language="en" />
        </div>
      </section>

      <section className="explain-section" id="about">
        <div className="section-heading">
          <div className="eyebrow">What Is A Horoscope?</div>
          <h2>A horoscope is a map of the sky at the moment you were born</h2>
          <p>
            The Sun, Moon, planets, signs, houses, and aspects combine into a pattern that changes with birth time and
            birthplace. HOSHIYOMI uses that map as the foundation for personal readings.
          </p>
        </div>

        <div className="glossary-bridge">
          <div>
            <div className="eyebrow">Horoscope Guide</div>
            <h3>Understand horoscopes more deeply</h3>
            <p>Learn ASC, houses, aspects, transits, natal charts, synastry, and the language that appears in your readings.</p>
          </div>
          <Link className="button" href="/en/glossary">
            Complete guide and glossary
          </Link>
        </div>

        <div className="method-panel">
          <div>
            <div className="eyebrow">How HOSHIYOMI Reads</div>
            <h2>It turns complex sky patterns into words for you</h2>
          </div>
          <div className="method-steps">
            <div>
              <strong>Calculate</strong>
              <span>Sun, Moon, planets, ASC, MC, houses, and aspects.</span>
            </div>
            <div>
              <strong>Interpret</strong>
              <span>Love, work, inner life, growth themes, and current timing.</span>
            </div>
            <div>
              <strong>Remember</strong>
              <span>With registration, your chart and star memory can be carried forward.</span>
            </div>
            <div>
              <strong>Consult</strong>
              <span>Ask the specific thing you actually want to understand.</span>
            </div>
            <div className="method-cta">
              <Link className="button primary" href="/en/m">
                Read my chart
              </Link>
            </div>
          </div>
        </div>

        <LineCtaCard />
      </section>

      <footer className="footer">
        <Link className="text-link" href="/en/glossary">Complete guide</Link>
        <Link className="text-link" href="/en/terms">Terms</Link>
        <Link className="text-link" href="/en/privacy">Privacy</Link>
        <Link className="text-link" href="/en/legal/payment-terms">Payment terms</Link>
        <Link className="text-link" href="/en/legal/commercial-disclosure">Legal disclosure</Link>
        <Link className="text-link" href="/en/contact">Contact</Link>
      </footer>
    </main>
  );
}
