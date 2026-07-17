import { NavLink, Link } from 'react-router-dom';

/**
 * En-tête collant. Le périmètre applicatif du dossier couvre 3 destinations
 * publiques : Accueil, Œuvres, Contact (§7.4.3).
 */
export default function Nav() {
  return (
    <header
      className="main-header"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(250,247,242,0.86)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(168,162,154,0.35)',
      }}
    >
      <div
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '22px 48px',
        }}
      >
        <Link
          to="/"
          className="nav-link"
          style={{
            fontFamily: 'var(--serif)',
            fontStyle: 'italic',
            fontSize: 22,
            letterSpacing: 0,
            textTransform: 'none',
            color: 'var(--cyan-deep)',
          }}
        >
          maïlyss borges
        </Link>
        <nav style={{ display: 'flex', gap: 36 }}>
          <NavLink to="/oeuvres" className="nav-link">
            Œuvres
          </NavLink>
          <NavLink to="/contact" className="nav-link">
            Contact
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
