import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { ApiError, listerGaleries } from '../services/api';
import { grouperParAnnee } from '../services/chronologie';
import type { Galerie } from '../types';
import Reveal from './ui/Reveal';

/**
 * Chronologie des expositions, groupée par année décroissante.
 *
 * Les expositions sont les galeries de l'API : le modèle du dossier décrit
 * GALLERY comme une collection thématique (« Expo 2024 »), c'est-à-dire
 * exactement une exposition. Les rattacher ici évite une entité de plus et
 * rend la rubrique administrable depuis le back-office.
 *
 * Chaque exposition renvoie vers les œuvres qui lui sont rattachées, via le
 * filtre de collection de la galerie.
 */
export default function Expositions() {
  const [galeries, setGaleries] = useState<Galerie[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    const controleur = new AbortController();
    setChargement(true);
    setErreur(null);

    listerGaleries(controleur.signal)
      .then((page) => setGaleries(page.data))
      .catch((e: unknown) => {
        if ((e as Error).name === 'AbortError') return;
        setErreur(e instanceof ApiError ? e.message : 'Erreur inattendue.');
      })
      .finally(() => setChargement(false));

    return () => controleur.abort();
  }, []);

  const parAnnee = useMemo(() => grouperParAnnee(galeries), [galeries]);

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
        {chargement && (
          <p role="status" className="legend" style={{ color: 'var(--terre)' }}>
            Chargement des expositions…
          </p>
        )}

        {!chargement && erreur && (
          <p role="alert" className="legend" style={{ color: 'var(--cyan-deep)' }}>
            {erreur}
          </p>
        )}

        {!chargement && !erreur && parAnnee.length === 0 && (
          <p className="legend" style={{ color: 'var(--terre)' }}>
            Aucune exposition n'est encore publiée.
          </p>
        )}

        {!chargement &&
          !erreur &&
          parAnnee.map(([annee, evenements], i) => (
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
                      key={e.slug}
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
                          {/* L'exposition mène aux œuvres qui lui sont rattachées. */}
                          <Link to={`/oeuvres?collection=${e.slug}`} className="ulink" data-hover>
                            {e.name}
                          </Link>
                        </h2>
                        {(e.role || e.curator) && (
                          <div className="legend" style={{ marginTop: 8 }}>
                            {e.role && e.curator ? `${e.role} — ${e.curator}` : e.role || e.curator}
                          </div>
                        )}
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
