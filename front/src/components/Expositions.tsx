import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { EXPOSITIONS } from '../content';
import { grouperParAnnee } from '../services/chronologie';
import Reveal from './ui/Reveal';

/** Chronologie des expositions, groupée par année décroissante. */

export default function Expositions() {
  const parAnnee = useMemo(() => grouperParAnnee(EXPOSITIONS), []);

  return (
    <div className="view-enter" style={{ paddingBottom: 80 }}>
      <section style={{ maxWidth: 1440, margin: '0 auto', padding: '80px 48px 48px' }}>
        <div className="small-cap" style={{ color: 'var(--terre)' }}>Chronologie</div>
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
          Expositions
        </h1>
        <p className="legend" style={{ marginTop: 32, color: 'var(--ink)', maxWidth: 560, fontSize: 16 }}>
          Expositions individuelles, collectives, résidences, performances. Listées du plus
          récent au plus ancien.
        </p>
      </section>

      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 48px 0' }}>
        {parAnnee.map(([annee, evenements], i) => (
          <Reveal key={annee} delay={i * 80}>
            <div className="chrono-annee">
              <div style={{ paddingTop: 6 }}>
                <div
                  style={{
                    fontFamily: 'var(--serif)',
                    fontStyle: 'italic',
                    fontWeight: 400,
                    fontSize: 60,
                    color: 'var(--cyan-deep)',
                    lineHeight: 1,
                  }}
                >
                  {annee}
                </div>
                <div className="small-cap" style={{ color: 'var(--terre)', marginTop: 14 }}>
                  {evenements.length} {evenements.length > 1 ? 'événements' : 'événement'}
                </div>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 36 }}>
                {evenements.map((e, j) => (
                  <li
                    key={e.id}
                    className="chrono-ligne"
                    style={{
                      paddingBottom: 32,
                      borderBottom:
                        j < evenements.length - 1 ? '1px solid rgba(168,162,154,0.4)' : 'none',
                    }}
                  >
                    <div className="small-cap" style={{ color: 'var(--gray)' }}>{e.month}</div>
                    <div>
                      <h2
                        style={{
                          margin: 0,
                          fontFamily: 'var(--serif)',
                          fontWeight: 400,
                          fontSize: 30,
                          color: 'var(--ink)',
                          lineHeight: 1.15,
                        }}
                      >
                        {e.title}
                      </h2>
                      <div className="legend" style={{ marginTop: 8 }}>
                        {e.curator ? `${e.role} — ${e.curator}` : e.role}
                      </div>
                    </div>
                    <div
                      className="chrono-lieu"
                      style={{
                        fontFamily: 'var(--sans)',
                        fontSize: 13,
                        color: 'var(--terre)',
                        letterSpacing: '.04em',
                      }}
                    >
                      {e.place}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </section>

      <section style={{ maxWidth: 760, margin: '0 auto', padding: '100px 48px 20px', textAlign: 'center' }}>
        <div className="legend" style={{ color: 'var(--cyan-deep)', fontSize: 22 }}>
          Pour toute demande d'exposition, de résidence ou de commande —
        </div>
        <div style={{ marginTop: 24 }}>
          <Link to="/contact" className="btn-ink">Écrire à l'atelier</Link>
        </div>
      </section>
    </div>
  );
}
