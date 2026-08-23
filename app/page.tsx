'use client';

import { useEffect, useState } from 'react';
import CarSharing from './CarSharing';
import { Language, wedding } from './content';

const languages: Language[] = ['es', 'en'];

function ExternalArrow() {
  return <span aria-hidden="true">↗</span>;
}

export default function Home() {
  const [language, setLanguage] = useState<Language>('es');
  const [copied, setCopied] = useState(false);
  const copy = wedding.content[language];

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  async function copyIban() {
    const value = wedding.bank.iban.replaceAll(' ', '');
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const text = document.createElement('textarea');
      text.value = value;
      text.style.position = 'fixed';
      text.style.opacity = '0';
      document.body.appendChild(text);
      text.select();
      document.execCommand('copy');
      text.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2400);
  }

  return (
    <main>
      <nav className="nav" aria-label={copy.nav.label}>
        <a className="wordmark" href="#top" aria-label={wedding.names.short}>
          {wedding.names.short}
        </a>
        <div className="nav-links">
          <a href="#place">{copy.nav.place}</a>
          <a href="#rides">{copy.nav.rides}</a>
          <a href="#agenda">{copy.nav.agenda}</a>
          <a href="#dress">{copy.nav.info}</a>
          <a href="#gift">{copy.nav.gift}</a>
        </div>
        <div className="language" aria-label={copy.nav.language}>
          {languages.map((value) => (
            <button
              key={value}
              className={value === language ? 'active' : ''}
              onClick={() => setLanguage(value)}
              aria-pressed={value === language}
              lang={value}
            >
              {value.toUpperCase()}
            </button>
          ))}
        </div>
      </nav>

      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="sun" aria-hidden="true" />
        <div className="botanical-shadow shadow-one" aria-hidden="true" />
        <div className="botanical-shadow shadow-two" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow">{copy.hero.eyebrow}</p>
          <h1 id="hero-title">
            <span className="hero-name">Inés <small>Camara</small></span>
            <span className="connector">{copy.hero.connector}</span>
            <span className="hero-name second-name">Guillermo <small>Martinez</small></span>
          </h1>
        </div>
        <div className="hero-meta" aria-label={`${copy.hero.dateLong}, ${copy.hero.location}`}>
          <p>{copy.hero.date}</p>
          <p>{copy.hero.location}</p>
        </div>
        <a className="scroll-cue" href="#place">
          {copy.hero.scroll}
          <span aria-hidden="true">↓</span>
        </a>
      </section>

      <section className="place section" id="place" aria-labelledby="place-title">
        <SectionHeading label={copy.place.label} title={copy.place.title} id="place-title" />
        <div className="place-details">
          <div>
            <p className="venue-name">{wedding.venue}</p>
            <p className="body-copy">{copy.place.description}</p>
          </div>
          <div className="address-block">
            <p className="micro-label">{copy.place.addressLabel}</p>
            <address>{wedding.address}</address>
            <div className="link-row">
              <a className="text-link" href={wedding.mapsUrl} target="_blank" rel="noopener noreferrer">
                {copy.place.maps}<ExternalArrow />
              </a>
              <a className="text-link quiet-link" href={wedding.venueUrl} target="_blank" rel="noopener noreferrer">
                {copy.place.venueWeb}<ExternalArrow />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="arrival section dark-section" id="arrival" aria-labelledby="arrival-title">
        <SectionHeading label={copy.arrival.label} title={copy.arrival.title} id="arrival-title" />
        <p className="section-intro">{copy.arrival.intro}</p>
        <div className="route-list">
          {copy.arrival.routes.map((route, index) => (
            <article className="route" key={route.title}>
              <span className="route-number">0{index + 1}</span>
              <h3>{route.title}</h3>
              <p>{route.text}</p>
            </article>
          ))}
        </div>
        <div className="parking-strip">
          <div>
            <p className="micro-label">{copy.arrival.parkingTitle}</p>
            <p>{copy.arrival.parkingText}</p>
          </div>
          <a className="button light-button" href={wedding.mapsUrl} target="_blank" rel="noopener noreferrer">
            {copy.arrival.maps}<ExternalArrow />
          </a>
        </div>
      </section>

      <CarSharing language={language} />

      <section className="agenda section" id="agenda" aria-labelledby="agenda-title">
        <SectionHeading label={copy.agenda.label} title={copy.agenda.title} id="agenda-title" />
        <div className="timeline">
          {copy.agenda.days.map((day) => (
            <article className="timeline-day" key={day.date}>
              <header>
                <p>{day.day}</p>
                <h3>{day.date}</h3>
              </header>
              <ol>
                {day.events.map((event) => (
                  <li key={`${day.date}-${event.time}`}>
                    <time>{event.time}</time>
                    <div>
                      <h4>{event.title}</h4>
                      <p>{event.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </section>

      <section className="dress section warm-section" id="dress" aria-labelledby="dress-title">
        <SectionHeading label={copy.dress.label} title={copy.dress.title} id="dress-title" />
        <div className="dress-grid">
          <div>
            <p className="body-copy large-copy">{copy.dress.description}</p>
            <ul className="notes-list">
              {copy.dress.notes.map((note) => <li key={note}>{note}</li>)}
            </ul>
          </div>
          <div className="moodboard-card" aria-label={copy.dress.boardTitle}>
            <div className="palette" aria-hidden="true">
              {copy.dress.palette.map((tone, index) => (
                <span className={`palette-tone tone-${index + 1}`} key={tone} />
              ))}
            </div>
            <p className="micro-label">{copy.dress.boardLabel}</p>
            <h3>{copy.dress.boardTitle}</h3>
            <p>{copy.dress.boardText}</p>
            <ul className="palette-labels" aria-label={copy.dress.boardLabel}>
              {copy.dress.palette.map((tone) => <li key={tone}>{tone}</li>)}
            </ul>
            <a
              className="text-link moodboard-link"
              href={wedding.pinterestUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {copy.dress.boardCta}<ExternalArrow />
            </a>
          </div>
        </div>
      </section>

      <section className="info section" id="info" aria-labelledby="info-title">
        <SectionHeading label={copy.info.label} title={copy.info.title} id="info-title" />
        <div className="info-grid">
          {copy.info.cards.map((card) => (
            <article className="info-card" key={card.number}>
              <span>{card.number}</span>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="gift section dark-section" id="gift" aria-labelledby="gift-title">
        <SectionHeading label={copy.gift.label} title={copy.gift.title} id="gift-title" />
        <div className="gift-grid">
          <p className="gift-message">{copy.gift.message}</p>
          <div className="bank-card">
            <dl>
              <div>
                <dt>{copy.gift.holder}</dt>
                <dd>{wedding.bank.holder}</dd>
              </div>
              <div>
                <dt>{copy.gift.iban}</dt>
                <dd className="iban">{wedding.bank.iban}</dd>
              </div>
            </dl>
            <button className="button light-button copy-button" type="button" onClick={copyIban}>
              <span aria-hidden="true">{copied ? '✓' : '⧉'}</span>
              {copied ? copy.gift.copied : copy.gift.copy}
            </button>
            <p className="sr-only" role="status" aria-live="polite">
              {copied ? copy.gift.copied : ''}
            </p>
          </div>
        </div>
      </section>

      <footer>
        <p className="footer-closing">{copy.footer.closing}</p>
        <div className="footer-meta">
          <p>{copy.hero.date}</p>
          <p>{copy.footer.sourceNote}</p>
        </div>
      </footer>
    </main>
  );
}

function SectionHeading({ label, title, id }: { label: string; title: string; id: string }) {
  return (
    <div className="section-heading">
      <p className="section-label">{label}</p>
      <h2 id={id}>{title}</h2>
    </div>
  );
}
