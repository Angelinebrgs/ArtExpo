/**
 * Liste des œuvres — gabarit paramétrable (§7.1.1).
 * ÉTAPE 1 — stub. La logique de chargement (AbortController, états
 * chargement/erreur/vide/succès, filtres par médium) sera implémentée à
 * l'étape 3, en consommant `listerOeuvres` du client d'accès aux données.
 */
export default function GalleryList() {
  return (
    <div className="view-enter container" style={{ padding: '80px 48px' }}>
      <div className="small-cap" style={{ color: 'var(--cyan-wash)' }}>Œuvres</div>
      <h2 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 300, fontSize: 56, color: 'var(--cyan-deep)', margin: '12px 0 24px' }}>
        La collection
      </h2>
      <p className="legend" style={{ color: 'var(--terre)' }}>
        Grille filtrable à venir (étape 3).
      </p>
    </div>
  );
}
