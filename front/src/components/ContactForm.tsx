/**
 * Formulaire de contact (§7.1.2).
 * ÉTAPE 1 — stub. La double validation (client + serveur), le pot de miel
 * `website` et la remontée des erreurs par champ via `envoyerMessage`
 * seront implémentés à l'étape 5.
 */
export default function ContactForm() {
  return (
    <div className="view-enter container" style={{ padding: '80px 48px', maxWidth: 720 }}>
      <div className="small-cap" style={{ color: 'var(--cyan-wash)' }}>Contact</div>
      <h2 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 300, fontSize: 56, color: 'var(--cyan-deep)', margin: '12px 0 24px' }}>
        Écrire à l'atelier
      </h2>
      <p className="legend" style={{ color: 'var(--terre)' }}>
        Formulaire à venir (étape 5).
      </p>
    </div>
  );
}
