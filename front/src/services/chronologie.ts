/* =========================================================================
   Mise en forme chronologique des expositions.

   Le regroupement est calculé à partir de la liste plate plutôt que d'être
   figé dans les données : ajouter une exposition suffit, sans avoir à créer
   ni à réordonner une année à la main.
   ========================================================================= */

import type { Exposition } from '../content/types';

/** Groupe les expositions par année, de la plus récente à la plus ancienne. */
export function grouperParAnnee(expositions: Exposition[]): [number, Exposition[]][] {
  const parAnnee = new Map<number, Exposition[]>();
  expositions.forEach((e) => {
    const existantes = parAnnee.get(e.year);
    if (existantes) existantes.push(e);
    else parAnnee.set(e.year, [e]);
  });
  return Array.from(parAnnee.entries()).sort((a, b) => b[0] - a[0]);
}
