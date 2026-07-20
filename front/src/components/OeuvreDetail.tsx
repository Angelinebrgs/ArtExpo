import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { ApiError, listerOeuvres, recupererOeuvre, urlMedia } from '../services/api';
import { libelleMedium, type Oeuvre } from '../types';
import CyanoSlot from './ui/CyanoSlot';
import Reveal from './ui/Reveal';

/**
 * Détail d'une œuvre — page « long-read » (route /oeuvres/:slug).
 *
 * Quatre états sont traités explicitement : chargement, erreur, œuvre
 * introuvable et succès. Le cas « introuvable » mérite un traitement à part :
 * l'URL est valide au sens du routeur, mais ne désigne aucune œuvre. On
 * l'annonce clairement plutôt que d'afficher une page vide (voir §7.4.3).
 *
 * La requête est annulée au démontage et à chaque changement de slug, afin
 * qu'une réponse obsolète n'écrase jamais la plus récente.
 */
export default function OeuvreDetail() {
  const { slug } = useParams<{ slug: string }>();

  const [oeuvre, setOeuvre] = useState<Oeuvre | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [suivante, setSuivante] = useState<Oeuvre | null>(null);

  useEffect(() => {
    if (!slug) return;
    const controleur = new AbortController();
    setChargement(true);
    setErreur(null);

    recupererOeuvre(slug, controleur.signal)
      .then((trouvee) => setOeuvre(trouvee))
      .catch((e: unknown) => {
        if ((e as Error).name === 'AbortError') return;
        setErreur(e instanceof ApiError ? e.message : 'Erreur inattendue.');
      })
      .finally(() => setChargement(false));

    return () => controleur.abort();
  }, [slug]);

  // Œuvre suivante : confort de navigation, non essentiel à la page.
  // Un échec ici reste donc silencieux et ne dégrade pas l'affichage principal.
  useEffect(() => {
    if (!slug) return;
    const controleur = new AbortController();

    listerOeuvres({}, controleur.signal)
      .then((page) => {
        const index = page.data.findIndex((o) => o.slug === slug);
        if (index === -1 || page.data.length < 2) {
          setSuivante(null);
          return;
        }
        setSuivante(page.data[(index + 1) % page.data.length]);
      })
      .catch(() => setSuivante(null));

    return () => controleur.abort();
  }, [slug]);

  if (chargement) {
    return (
      <div className="view-enter container" style={{ padding: '120px 48px' }}>
        <p role="status" className="legend" style={{ color: 'var(--terre)' }}>
          Chargement de l'œuvre…
        </p>
      </div>
    );
  }

  if (erreur) {
    return (
      <div className="view-enter container" style={{ padding: '120px 48px' }}>
        <p role="alert" className="legend" style={{ color: 'var(--cyan-deep)' }}>
          {erreur}
        </p>
        <p style={{ marginTop: 32 }}>
          <Link to="/oeuvres" className="btn-ink">Retour à la collection</Link>
        </p>
      </div>
    );
  }

  if (!oeuvre) {
    return (
      <div className="view-enter container" style={{ padding: '140px 48px', textAlign: 'center' }}>
        <div className="small-cap" style={{ color: 'var(--cyan-wash)' }}>Œuvre introuvable</div>
        <h1
          style={{
            fontFamily: 'var(--serif)',
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 'clamp(40px, 7vw, 80px)',
            color: 'var(--cyan-deep)',
            margin: '20px 0 16px',
          }}
        >
          Cette œuvre n'existe pas
        </h1>
        <p
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 20,
            color: 'var(--ink)',
            maxWidth: 460,
            margin: '0 auto 40px',
          }}
        >
          Elle a peut-être été retirée du site. La collection reste consultable.
        </p>
        <Link to="/oeuvres" className="btn-ink">Voir la collection</Link>
      </div>
    );
  }

  const medium = libelleMedium(oeuvre.medium);
  const source = oeuvre.img?.formats?.large?.url ?? oeuvre.img?.url;

  return (
    <article className="view-enter" style={{ paddingBottom: 60 }}>
      {/* Visuel d'ouverture */}
      <section style={{ padding: '0 48px', marginTop: 32 }}>
        {source ? (
          <img
            src={urlMedia(source)}
            alt={oeuvre.img?.alternativeText ?? oeuvre.name}
            style={{
              display: 'block',
              width: '100%',
              maxWidth: 1440,
              margin: '0 auto',
              aspectRatio: '16 / 9',
              objectFit: 'cover',
            }}
          />
        ) : (
          <CyanoSlot
            aspect="16 / 9"
            caption={oeuvre.name}
            credit={`${medium} · ${oeuvre.year}`}
            style={{ maxWidth: 1440, margin: '0 auto' }}
          />
        )}
      </section>

      {/* Fil d'Ariane */}
      <section style={{ maxWidth: 1440, margin: '0 auto', padding: '48px 48px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 24 }}>
          <Link
            to="/oeuvres"
            className="ulink"
            style={{ fontFamily: 'var(--sans)', fontSize: 12, letterSpacing: '.22em', textTransform: 'uppercase' }}
          >
            ← Collection
          </Link>
          <div className="small-cap">
            {medium} · {oeuvre.year}
          </div>
        </div>
      </section>

      {/* Titre + fiche technique */}
      <section style={{ maxWidth: 1440, margin: '0 auto', padding: '24px 48px 80px' }}>
        <div className="detail-entete">
          <div>
            <h1
              style={{
                fontFamily: 'var(--serif)',
                fontStyle: 'italic',
                fontWeight: 300,
                fontSize: 'clamp(48px, 8vw, 110px)',
                lineHeight: 0.98,
                margin: 0,
                color: 'var(--cyan-deep)',
              }}
            >
              {oeuvre.name}
            </h1>
          </div>

          <aside style={{ paddingTop: 24 }}>
            <div className="small-cap" style={{ color: 'var(--terre)' }}>Fiche</div>
            <dl
              style={{
                margin: '22px 0 0',
                display: 'grid',
                gridTemplateColumns: '110px 1fr',
                gap: '16px 24px',
                fontFamily: 'var(--sans)',
                fontSize: 14,
                color: 'var(--ink)',
              }}
            >
              <dt style={{ color: 'var(--gray)', letterSpacing: '.06em' }}>Médium</dt>
              <dd style={{ margin: 0 }}>{medium}</dd>

              <dt style={{ color: 'var(--gray)' }}>Année</dt>
              <dd style={{ margin: 0 }}>{oeuvre.year}</dd>

              {oeuvre.gallery && (
                <>
                  <dt style={{ color: 'var(--gray)' }}>Collection</dt>
                  <dd style={{ margin: 0 }}>
                    <Link to={`/oeuvres?collection=${oeuvre.gallery.slug}`} className="ulink">
                      {oeuvre.gallery.name}
                    </Link>
                  </dd>
                </>
              )}
            </dl>
          </aside>
        </div>
      </section>

      {/* Texte de l'artiste */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '0 48px 100px' }}>
        <Reveal>
          <div
            className="small-cap"
            style={{ color: 'var(--terre)', marginBottom: 36, textAlign: 'center' }}
          >
            Texte de l'artiste
          </div>
          {oeuvre.description
            .split('\n')
            .map((p) => p.trim())
            .filter(Boolean)
            .map((paragraphe, i) => (
              <p
                key={i}
                className={i === 0 ? 'dropcap' : undefined}
                style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 22,
                  lineHeight: 1.65,
                  color: 'var(--ink)',
                  margin: '0 0 24px',
                  textWrap: 'pretty',
                }}
              >
                {paragraphe}
              </p>
            ))}
        </Reveal>
      </section>

      {/* Œuvre suivante */}
      {suivante && (
        <section
          style={{
            maxWidth: 1440,
            margin: '0 auto',
            padding: '72px 48px 0',
            borderTop: '1px solid var(--gray-2)',
          }}
        >
          <div className="small-cap" style={{ color: 'var(--terre)', marginBottom: 20 }}>
            Œuvre suivante
          </div>
          <Link to={`/oeuvres/${suivante.slug}`} data-hover>
            <h2
              style={{
                fontFamily: 'var(--serif)',
                fontStyle: 'italic',
                fontWeight: 300,
                fontSize: 'clamp(32px, 5vw, 56px)',
                color: 'var(--cyan-deep)',
                margin: 0,
              }}
            >
              {suivante.name}
            </h2>
          </Link>
        </section>
      )}
    </article>
  );
}
