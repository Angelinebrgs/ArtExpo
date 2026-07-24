/* =========================================================================
   Mise en forme chronologique.

   Le regroupement est calculé à partir de la liste plate plutôt que d'être
   figé dans les données : ajouter une entrée suffit, sans avoir à créer ni
   à réordonner une année à la main.
   ========================================================================= */

/**
 * Groupe par année, de la plus récente à la plus ancienne.
 *
 * La fonction est générique : elle n'exige de ses éléments qu'un champ
 * `year`, ce qui lui permet de servir aussi bien aux expositions issues de
 * l'API qu'à toute autre liste datée.
 */
export function grouperParAnnee<T extends { year?: number }>(
  elements: T[],
): [number, T[]][] {
  const parAnnee = new Map<number, T[]>();
  elements.forEach((e) => {
    // Une entrée sans année ne peut pas être placée dans la chronologie.
    if (typeof e.year !== 'number') return;
    const existantes = parAnnee.get(e.year);
    if (existantes) existantes.push(e);
    else parAnnee.set(e.year, [e]);
  });
  return Array.from(parAnnee.entries()).sort((a, b) => b[0] - a[0]);
}
