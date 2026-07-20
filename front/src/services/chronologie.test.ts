import { describe, expect, it } from 'vitest';

import { grouperParAnnee } from './chronologie';
import type { Exposition } from '../content/types';

function exposition(partiel: Partial<Exposition> = {}): Exposition {
  return {
    id: 'test',
    year: 2024,
    month: 'Mars',
    title: 'Reverdie',
    role: 'Exposition collective',
    place: 'ESACM, Clermont-Ferrand',
    ...partiel,
  };
}

describe('grouperParAnnee', () => {
  it('regroupe les expositions d’une même année', () => {
    const groupes = grouperParAnnee([
      exposition({ id: 'a', year: 2024 }),
      exposition({ id: 'b', year: 2024 }),
      exposition({ id: 'c', year: 2023 }),
    ]);

    expect(groupes).toHaveLength(2);
    expect(groupes[0][1]).toHaveLength(2);
    expect(groupes[1][1]).toHaveLength(1);
  });

  it('ordonne les années de la plus récente à la plus ancienne', () => {
    const groupes = grouperParAnnee([
      exposition({ id: 'a', year: 2022 }),
      exposition({ id: 'b', year: 2025 }),
      exposition({ id: 'c', year: 2023 }),
    ]);

    expect(groupes.map(([annee]) => annee)).toEqual([2025, 2023, 2022]);
  });

  it('préserve l’ordre d’origine à l’intérieur d’une année', () => {
    const groupes = grouperParAnnee([
      exposition({ id: 'premier', year: 2024, title: 'Premier' }),
      exposition({ id: 'second', year: 2024, title: 'Second' }),
    ]);

    expect(groupes[0][1].map((e) => e.title)).toEqual(['Premier', 'Second']);
  });

  it('retourne une liste vide sans exposition', () => {
    expect(grouperParAnnee([])).toEqual([]);
  });
});
