import { useParams } from 'react-router-dom';

/**
 * Détail d'une œuvre — page « long-read ».
 * ÉTAPE 1 — stub. Le chargement par slug (`recupererOeuvre`), la galerie
 * d'images et la navigation œuvre précédente/suivante viendront à l'étape 3.
 */
export default function OeuvreDetail() {
  const { slug } = useParams<{ slug: string }>();
  return (
    <div className="view-enter container" style={{ padding: '80px 48px' }}>
      <div className="small-cap" style={{ color: 'var(--cyan-wash)' }}>Œuvre</div>
      <h2 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 300, fontSize: 56, color: 'var(--cyan-deep)', margin: '12px 0 24px' }}>
        {slug}
      </h2>
      <p className="legend" style={{ color: 'var(--terre)' }}>
        Page détail à venir (étape 3).
      </p>
    </div>
  );
}
