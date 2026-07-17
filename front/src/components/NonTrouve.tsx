import { Link } from 'react-router-dom';

/**
 * Page 404 — toute URL inconnue est traitée explicitement, jamais ignorée
 * (§7.4.3). On propose un retour clair plutôt qu'un écran vide.
 */
export default function NonTrouve() {
  return (
    <div
      className="view-enter container"
      style={{ padding: '160px 48px', textAlign: 'center', minHeight: '48vh' }}
    >
      <div className="small-cap" style={{ color: 'var(--cyan-wash)' }}>Erreur 404</div>
      <h2
        style={{
          fontFamily: 'var(--serif)',
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: 'clamp(48px, 9vw, 96px)',
          color: 'var(--cyan-deep)',
          margin: '20px 0 16px',
        }}
      >
        Page introuvable
      </h2>
      <p style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--ink)', maxWidth: 460, margin: '0 auto 40px' }}>
        Cette page n'existe pas ou a été déplacée. Le reste du site vous attend.
      </p>
      <Link to="/" className="btn-ink">
        Retour à l'accueil
      </Link>
    </div>
  );
}
