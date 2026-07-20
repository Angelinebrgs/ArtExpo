import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { listerOeuvres, urlMedia } from '../services/api';
import { libelleMedium, type Oeuvre } from '../types';
import CyanoSlot from './ui/CyanoSlot';
import QuoteBreak from './ui/QuoteBreak';
import Reveal from './ui/Reveal';

/**
 * Page d'accueil éditoriale.
 *
 * Les œuvres récentes proviennent de l'API : elles sont déjà triées par
 * année décroissante par le service, la page n'a donc qu'à en retenir les
 * premières. Cette section est un point d'entrée, pas le cœur de la page :
 * un échec de chargement la masque sans afficher d'erreur, le reste de
 * l'accueil (couverture, présentation) restant parfaitement lisible.
 */

const NB_RECENTES = 4;

export default function Accueil() {
  const [recentes, setRecentes] = useState<Oeuvre[]>([]);

  useEffect(() => {
    const controleur = new AbortController();

    listerOeuvres({ pageSize: NB_RECENTES }, controleur.signal)
      .then((page) => setRecentes(page.data.slice(0, NB_RECENTES)))
      .catch(() => setRecentes([]));

    return () => controleur.abort();
  }, []);

  return (
    <div className="view-enter">
      {/* Couverture — le nom centré, comme sur une couverture de livre */}
      <section
        style={{
          minHeight: 'calc(100vh - 80px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: '60px 24px 100px',
          position: 'relative',
        }}
      >
        <div className="small-cap" style={{ color: 'var(--terre)', marginBottom: 48 }}>
          Édition en ligne · 2020 – 2026
        </div>

        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--serif)',
            fontWeight: 300,
            fontSize: 'clamp(64px, 11vw, 168px)',
            lineHeight: 0.95,
            letterSpacing: '-0.01em',
            color: 'var(--ink)',
          }}
        >
          maïlyss
          <br />
          <em style={{ color: 'var(--cyan-deep)' }}>borges</em>
        </h1>

        <div className="legend" style={{ marginTop: 48, maxWidth: 560, color: 'var(--ink)' }}>
          performances, cyanotypes, éditions
          <br />& écrits — clermont&#8209;ferrand
        </div>

        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: 48,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div className="small-cap" style={{ color: 'var(--gray)' }}>Descendre</div>
          <div
            style={{
              width: 1,
              height: 42,
              background: 'var(--cyan-deep)',
              opacity: 0.5,
              animation: 'drift 3.6s ease-in-out infinite',
            }}
          />
        </div>
      </section>

      <QuoteBreak
        text="L'écriture qui parfois naît aussi d'une rencontre avec un lieu."
        author="Wendy Delorme"
        size={42}
      />

      {/* Présentation — composition asymétrique */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 48px 120px' }}>
        <div className="accueil-presentation">
          <Reveal>
            <CyanoSlot
              aspect="3 / 4"
              caption="Atelier — bord de l'Allier"
              credit="cyanotype"
            />
          </Reveal>
          <Reveal delay={150}>
            <div style={{ paddingTop: 24 }}>
              <div className="small-cap" style={{ color: 'var(--terre)' }}>Pratique</div>
              <p
                className="dropcap"
                style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 24,
                  lineHeight: 1.55,
                  color: 'var(--ink)',
                  marginTop: 24,
                  fontWeight: 400,
                  textWrap: 'pretty',
                }}
              >
                La pratique de Maïlyss Borges explore la rencontre du corps et du lieu comme
                une écriture plastique. Performance, son, eau, cyanotype, écriture poétique —
                autant de manières d'habiter un espace assez longtemps pour qu'il laisse une
                trace sur la peau, et sur le tissu.
              </p>
              <p
                style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 18,
                  lineHeight: 1.7,
                  color: 'var(--ink)',
                  marginTop: 20,
                  maxWidth: 560,
                }}
              >
                Diplômée du DNSEP de l'ESACM (Clermont-Ferrand, mention félicitations du jury,
                2025), elle vit et travaille en Auvergne, au bord de l'Allier.
              </p>
              <div style={{ marginTop: 36, display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                <Link to="/oeuvres" className="btn-ink">Voir les œuvres</Link>
                <Link
                  to="/contact"
                  className="ulink"
                  style={{
                    fontFamily: 'var(--sans)',
                    fontSize: 13,
                    letterSpacing: '.2em',
                    textTransform: 'uppercase',
                  }}
                >
                  écrire à l'atelier
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Œuvres récentes — masquées tant qu'aucune donnée n'est disponible */}
      {recentes.length > 0 && (
        <section style={{ maxWidth: 1440, margin: '0 auto', padding: '40px 48px 120px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              gap: 24,
              marginBottom: 64,
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--serif)',
                fontWeight: 400,
                fontSize: 'clamp(32px, 4vw, 48px)',
                margin: 0,
                fontStyle: 'italic',
                color: 'var(--cyan-deep)',
              }}
            >
              Œuvres récentes
            </h2>
            <Link
              to="/oeuvres"
              className="ulink"
              style={{
                fontFamily: 'var(--sans)',
                fontSize: 12,
                letterSpacing: '.22em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}
            >
              voir toute la galerie →
            </Link>
          </div>

          <ul className="grille-recentes">
            {recentes.map((o, i) => (
              <li key={o.id}>
                <Reveal delay={i * 120}>
                  <Link to={`/oeuvres/${o.slug}`} data-hover>
                    {o.img ? (
                      <img
                        src={urlMedia(o.img.formats?.medium?.url ?? o.img.url)}
                        alt={o.img.alternativeText ?? o.name}
                        style={{
                          width: '100%',
                          aspectRatio: '3 / 4',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    ) : (
                      <CyanoSlot
                        caption={o.name}
                        credit={`${libelleMedium(o.medium)} · ${o.year}`}
                      />
                    )}
                    <div style={{ marginTop: 18 }}>
                      <h3
                        style={{
                          margin: 0,
                          fontFamily: 'var(--serif)',
                          fontStyle: 'italic',
                          fontWeight: 400,
                          fontSize: 24,
                          color: 'var(--cyan-deep)',
                        }}
                      >
                        {o.name}
                      </h3>
                      <div className="legend" style={{ color: 'var(--terre)', marginTop: 4 }}>
                        {libelleMedium(o.medium)} — {o.year}
                      </div>
                    </div>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
