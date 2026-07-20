import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import Expositions from './Expositions';
import { EXPOSITIONS } from '../content';

function afficher() {
  return render(
    <MemoryRouter>
      <Expositions />
    </MemoryRouter>,
  );
}

describe('Expositions — affichage', () => {
  it('affiche le titre de la page', () => {
    afficher();
    expect(screen.getByRole('heading', { name: 'Expositions', level: 1 })).toBeInTheDocument();
  });

  it('affiche toutes les expositions du contenu', () => {
    afficher();
    expect(screen.getAllByRole('listitem')).toHaveLength(EXPOSITIONS.length);
  });

  it('accorde le compteur d’événements au singulier comme au pluriel', () => {
    afficher();
    // Le contenu comporte au moins une année à événement unique et une autre
    // à plusieurs : les deux accords doivent être présents.
    expect(screen.getAllByText(/\d+ événements/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^1 événement$/).length).toBeGreaterThan(0);
  });

  it('affiche le commissariat lorsqu’il existe', () => {
    afficher();
    expect(screen.getByText(/Sophie Auger/)).toBeInTheDocument();
  });

  it('n’ajoute aucun tiret quand le commissariat est absent', () => {
    afficher();
    const titre = screen.getByRole('heading', { name: 'Premiers murmures' });
    const ligne = titre.closest('li');
    expect(ligne).not.toBeNull();
    expect(within(ligne as HTMLElement).getByText('Exposition collective de 2e année')).toBeInTheDocument();
  });

  it('renvoie vers le formulaire de contact', () => {
    afficher();
    expect(screen.getByRole('link', { name: "Écrire à l'atelier" })).toHaveAttribute('href', '/contact');
  });
});
