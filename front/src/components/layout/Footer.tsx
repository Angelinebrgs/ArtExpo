import { Link } from 'react-router-dom';

/** Pied de page éditorial. */
export default function Footer() {
  return (
    <footer style={{ marginTop: 140, borderTop: '1px solid var(--gray-2)', background: 'var(--ivory)' }}>
      <div
        className="footer-grid"
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr 1fr',
          gap: 48,
          padding: '72px 48px 56px',
        }}
      >
        <div>
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 30, color: 'var(--cyan-deep)' }}>
            maïlyss borges
          </div>
          <div className="legend" style={{ marginTop: 14, color: 'var(--ink)', maxWidth: 320 }}>
            Le corps et le lieu, l'eau qui traverse, la voix qui se croise.
          </div>
        </div>
        <div>
          <div className="small-cap">Naviguer</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '18px 0 0', display: 'grid', gap: 10, fontFamily: 'var(--sans)', fontSize: 14 }}>
            <li><Link to="/oeuvres" className="ulink">Œuvres</Link></li>
            <li><Link to="/contact" className="ulink">Contact</Link></li>
          </ul>
        </div>
        <div>
          <div className="small-cap">Atelier</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '18px 0 0', display: 'grid', gap: 10, fontFamily: 'var(--sans)', fontSize: 14 }}>
            <li>14 rue de l'Oradou</li>
            <li>63000 Clermont-Ferrand</li>
            <li>FR</li>
          </ul>
        </div>
      </div>
      <div
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '22px 48px',
          borderTop: '1px solid var(--gray-2)',
          fontFamily: 'var(--sans)',
          fontSize: 11,
          letterSpacing: '.18em',
          textTransform: 'uppercase',
          color: 'var(--terre)',
        }}
      >
        <div>© 2020–2026 maïlyss borges</div>
        <div style={{ fontStyle: 'italic', textTransform: 'none', letterSpacing: 0, fontFamily: 'var(--serif)', fontSize: 14 }}>
          un site qui respire, lentement
        </div>
        <div>fait main · clermont-ferrand</div>
      </div>
    </footer>
  );
}
