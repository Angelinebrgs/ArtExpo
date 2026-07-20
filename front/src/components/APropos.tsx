import { Link } from 'react-router-dom';

import { BIOGRAPHIE, COURRIEL, ENSEIGNEMENT, FORMATIONS, PRESSE, RESIDENCES } from '../content';
import type { LigneParcours } from '../content/types';
import CyanoSlot from './ui/CyanoSlot';
import QuoteBreak from './ui/QuoteBreak';
import Reveal from './ui/Reveal';

/** Une colonne du parcours (formation, résidences, enseignement). */
function ColonneParcours({
  titre,
  lignes,
  delai,
}: {
  titre: string;
  lignes: LigneParcours[];
  delai: number;
}) {
  return (
    <Reveal delay={delai}>
      <h2 className="small-cap" style={{ color: 'var(--terre)', margin: 0 }}>{titre}</h2>
      <ul style={{ listStyle: 'none', padding: 0, margin: '28px 0 0', display: 'grid', gap: 28 }}>
        {lignes.map((l) => (
          <li
            key={`${l.periode}-${l.intitule}`}
            style={{ paddingBottom: 24, borderBottom: '1px solid rgba(168,162,154,0.35)' }}
          >
            <div className="small-cap" style={{ color: 'var(--gray)' }}>{l.periode}</div>
            <div
              style={{
                fontFamily: 'var(--serif)',
                fontSize: 22,
                marginTop: 10,
                color: 'var(--ink)',
                lineHeight: 1.25,
              }}
            >
              {l.intitule}
            </div>
            <div className="legend" style={{ marginTop: 8 }}>{l.detail}</div>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

/** À propos — biographie, parcours et presse. */
export default function APropos() {
  return (
    <div className="view-enter" style={{ paddingBottom: 60 }}>
      {/* Portrait + biographie */}
      <section style={{ maxWidth: 1440, margin: '0 auto', padding: '80px 48px 100px' }}>
        <div className="accueil-presentation">
          <Reveal>
            <CyanoSlot aspect="3 / 4" caption="Atelier, hiver 2025" credit="cyanotype" />
          </Reveal>
          <Reveal delay={150}>
            <div className="small-cap" style={{ color: 'var(--terre)' }}>À propos</div>
            <h1
              style={{
                fontFamily: 'var(--serif)',
                fontWeight: 300,
                fontSize: 'clamp(48px, 7.5vw, 110px)',
                lineHeight: 1,
                margin: '14px 0 36px',
                color: 'var(--ink)',
              }}
            >
              Maïlyss <em style={{ color: 'var(--cyan-deep)' }}>Borges</em>
            </h1>

            {BIOGRAPHIE.map((paragraphe, i) => (
              <p
                key={i}
                className={i === 0 ? 'dropcap' : undefined}
                style={{
                  fontFamily: 'var(--serif)',
                  fontSize: i === 0 ? 23 : 19,
                  lineHeight: i === 0 ? 1.65 : 1.7,
                  color: 'var(--ink)',
                  marginTop: i === 0 ? 0 : 20,
                  marginBottom: 0,
                  maxWidth: i === 0 ? undefined : 560,
                  textWrap: 'pretty',
                }}
              >
                {paragraphe}
              </p>
            ))}

            <div style={{ display: 'flex', gap: 24, marginTop: 48, alignItems: 'center', flexWrap: 'wrap' }}>
              <Link to="/oeuvres" className="btn-ink">Voir les œuvres</Link>
              <Link
                to="/contact"
                className="ulink"
                style={{
                  fontFamily: 'var(--sans)',
                  fontSize: 12,
                  letterSpacing: '.22em',
                  textTransform: 'uppercase',
                }}
              >
                écrire à l'atelier
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <QuoteBreak text="On écrit avec l'eau comme on parle bas." author="m. b., carnet 2024" size={40} />

      {/* Parcours */}
      <section
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '40px 48px 80px',
          borderTop: '1px solid var(--gray-2)',
        }}
      >
        <div className="parcours">
          <ColonneParcours titre="Formation" lignes={FORMATIONS} delai={0} />
          <ColonneParcours titre="Résidences" lignes={RESIDENCES} delai={120} />
          <ColonneParcours titre="Enseignement" lignes={ENSEIGNEMENT} delai={240} />
        </div>
      </section>

      {/* Presse et contact */}
      <section
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '40px 48px 0',
          borderTop: '1px solid var(--gray-2)',
        }}
      >
        <div className="presse">
          <div>
            <h2 className="small-cap" style={{ color: 'var(--terre)', margin: 0 }}>Presse</h2>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: '24px 0 0',
                display: 'grid',
                gap: 18,
                fontFamily: 'var(--serif)',
                fontSize: 18,
                color: 'var(--ink)',
              }}
            >
              {PRESSE.map((m) => (
                <li key={m.titre}>
                  « {m.titre} » — <em>{m.support}</em>, {m.date}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="small-cap" style={{ color: 'var(--terre)', margin: 0 }}>
              Représentation &amp; contact
            </h2>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 18, lineHeight: 1.7, marginTop: 24, color: 'var(--ink)' }}>
              L'artiste n'est pas représentée par une galerie. Pour toute demande de prêt,
              d'achat, d'exposition ou de production —{' '}
              <a className="ulink" href={`mailto:${COURRIEL}`}>{COURRIEL}</a>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
