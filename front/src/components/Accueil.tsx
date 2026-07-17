import { Link } from 'react-router-dom';
import Reveal from './ui/Reveal';

/**
 * Page d'accueil éditoriale.
 * ÉTAPE 1 — coquille : hero + amorce. Le contenu complet (œuvres récentes,
 * respirations, citations) sera construit à l'étape 2.
 */
export default function Accueil() {
  return (
    <div className="view-enter">
      <section className="container" style={{ padding: '140px 48px 40px' }}>
        <Reveal>
          <div className="small-cap" style={{ color: 'var(--cyan-wash)' }}>
            Artiste contemporaine · Clermont-Ferrand
          </div>
          <h1
            style={{
              fontFamily: 'var(--serif)',
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: 'clamp(44px, 8vw, 104px)',
              lineHeight: 1.02,
              color: 'var(--cyan-deep)',
              margin: '28px 0 0',
              textWrap: 'balance',
            }}
          >
            Le corps, le lieu,
            <br />
            l'eau qui traverse.
          </h1>
          <p
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 22,
              lineHeight: 1.5,
              color: 'var(--ink)',
              maxWidth: 640,
              margin: '32px 0 40px',
            }}
          >
            Performances, cyanotypes, éditions et installations sonores. Une pratique
            qui écoute ce qui pousse dans l'oubli.
          </p>
          <Link to="/oeuvres" className="btn-ink">
            Voir les œuvres
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
