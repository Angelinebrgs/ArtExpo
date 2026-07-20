import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import APropos from './APropos';
import { BIOGRAPHIE, COURRIEL, ENSEIGNEMENT, FORMATIONS, PRESSE, RESIDENCES } from '../content';

function afficher() {
  return render(
    <MemoryRouter>
      <APropos />
    </MemoryRouter>,
  );
}

describe('APropos — biographie', () => {
  it('affiche le nom de l’artiste en titre', () => {
    afficher();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Maïlyss Borges');
  });

  it('affiche chaque paragraphe de la biographie', () => {
    afficher();
    BIOGRAPHIE.forEach((p) => expect(screen.getByText(p)).toBeInTheDocument());
  });

  it('oriente vers les œuvres et vers le contact', () => {
    afficher();
    expect(screen.getByRole('link', { name: 'Voir les œuvres' })).toHaveAttribute('href', '/oeuvres');
    expect(screen.getByRole('link', { name: /écrire à l'atelier/i })).toHaveAttribute('href', '/contact');
  });
});

describe('APropos — parcours', () => {
  it('présente les trois volets du parcours', () => {
    afficher();
    expect(screen.getByRole('heading', { name: 'Formation' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Résidences' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Enseignement' })).toBeInTheDocument();
  });

  it('affiche toutes les lignes de parcours et de presse', () => {
    afficher();
    const attendues =
      FORMATIONS.length + RESIDENCES.length + ENSEIGNEMENT.length + PRESSE.length;
    expect(screen.getAllByRole('listitem')).toHaveLength(attendues);
  });

  it('affiche période, intitulé et détail d’une formation', () => {
    afficher();
    const formation = FORMATIONS[0];
    const intitule = screen.getByText(formation.intitule);
    const ligne = intitule.closest('li') as HTMLElement;

    expect(within(ligne).getByText(formation.periode)).toBeInTheDocument();
    expect(within(ligne).getByText(formation.detail)).toBeInTheDocument();
  });
});

describe('APropos — presse et contact', () => {
  it('cite chaque mention de presse avec son support', () => {
    afficher();
    PRESSE.forEach((m) => {
      expect(screen.getByText(m.support)).toBeInTheDocument();
      expect(screen.getByText(new RegExp(m.titre))).toBeInTheDocument();
    });
  });

  it('expose l’adresse de l’atelier en lien mailto', () => {
    afficher();
    expect(screen.getByRole('link', { name: COURRIEL })).toHaveAttribute(
      'href',
      `mailto:${COURRIEL}`,
    );
  });
});
