import { useState } from 'react';

import { ECRITS } from '../content';
import QuoteBreak from './ui/QuoteBreak';

/**
 * Écrits — présentés comme un cahier : un sommaire à gauche, le texte
 * sélectionné à droite. Le premier texte est ouvert par défaut, afin que la
 * page ne s'affiche jamais vide.
 */
export default function Ecrits() {
  const [actif, setActif] = useState(ECRITS[0].id);
  const texte = ECRITS.find((t) => t.id === actif) ?? ECRITS[0];

  return (
    <div className="view-enter" style={{ paddingBottom: 80 }}>
      <section style={{ maxWidth: 1440, margin: '0 auto', padding: '80px 48px 48px' }}>
        <div className="small-cap" style={{ color: 'var(--terre)' }}>Cahier</div>
        <h1
          style={{
            fontFamily: 'var(--serif)',
            fontWeight: 300,
            fontSize: 'clamp(48px, 8vw, 120px)',
            margin: '12px 0 0',
            lineHeight: 1,
            fontStyle: 'italic',
            color: 'var(--cyan-deep)',
          }}
        >
          Écrits
        </h1>
        <p className="legend" style={{ marginTop: 32, color: 'var(--ink)', maxWidth: 560, fontSize: 16 }}>
          Extraits de textes poétiques, fragments d'éditions, notes d'atelier. Tirés des
          publications et des carnets.
        </p>
      </section>

      <section
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '40px 48px 0',
          borderTop: '1px solid var(--gray-2)',
        }}
      >
        <div className="cahier">
          {/* Sommaire */}
          <aside className="cahier-sommaire">
            <div className="small-cap" style={{ color: 'var(--terre)' }}>Sommaire</div>
            <ol style={{ listStyle: 'none', padding: 0, margin: '22px 0 0', display: 'grid', gap: 18 }}>
              {ECRITS.map((t, i) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setActif(t.id)}
                    aria-current={t.id === actif ? 'true' : undefined}
                    data-hover
                    style={{
                      all: 'unset',
                      cursor: 'none',
                      display: 'grid',
                      gridTemplateColumns: '24px 1fr',
                      gap: 14,
                      alignItems: 'baseline',
                      paddingBottom: 14,
                      borderBottom: '1px solid rgba(168,162,154,0.35)',
                      width: '100%',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--sans)',
                        fontSize: 11,
                        letterSpacing: '.18em',
                        color: t.id === actif ? 'var(--cyan-deep)' : 'var(--gray)',
                      }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span>
                      <span
                        style={{
                          display: 'block',
                          fontFamily: 'var(--serif)',
                          fontStyle: 'italic',
                          fontWeight: 400,
                          fontSize: 20,
                          color: t.id === actif ? 'var(--cyan-deep)' : 'var(--ink)',
                          lineHeight: 1.2,
                        }}
                      >
                        {t.title}
                      </span>
                      <span
                        className="legend"
                        style={{ display: 'block', marginTop: 4, color: 'var(--terre)', fontSize: 12 }}
                      >
                        {t.sub} · {t.year}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </aside>

          {/* Lecteur */}
          <article key={texte.id} className="view-enter" style={{ minHeight: 520 }}>
            <div className="small-cap" style={{ color: 'var(--terre)' }}>
              {texte.sub} — {texte.year}
            </div>
            <h2
              style={{
                fontFamily: 'var(--serif)',
                fontWeight: 300,
                fontSize: 'clamp(36px, 5vw, 72px)',
                lineHeight: 1,
                margin: '18px 0 56px',
                fontStyle: 'italic',
                color: 'var(--cyan-deep)',
              }}
            >
              {texte.title}
            </h2>

            <div style={{ maxWidth: 580 }}>
              {texte.body.map((ligne, i) =>
                ligne === '' ? (
                  // Une ligne vide est une respiration typographique, pas un paragraphe.
                  <div key={i} aria-hidden="true" style={{ height: 20 }} />
                ) : (
                  <p
                    key={i}
                    className={i === 0 && ligne.length > 40 ? 'dropcap' : undefined}
                    style={{
                      fontFamily: 'var(--serif)',
                      fontSize: 22,
                      lineHeight: 1.7,
                      color: 'var(--ink)',
                      margin: '0 0 22px',
                      textWrap: 'pretty',
                    }}
                  >
                    {ligne}
                  </p>
                ),
              )}
            </div>

            <div
              style={{
                marginTop: 64,
                paddingTop: 32,
                borderTop: '1px solid var(--gray-2)',
              }}
            >
              <div className="legend" style={{ color: 'var(--terre)' }}>
                Imprimé dans {texte.title}, {texte.year}
              </div>
            </div>
          </article>
        </div>
      </section>

      <QuoteBreak text="L'eau a une mémoire des mains." author="M. B." size={42} />
    </div>
  );
}
