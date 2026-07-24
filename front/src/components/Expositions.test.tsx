import { render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Expositions from './Expositions';
import { ApiError } from '../services/api';
import type { Galerie, Page } from '../types';

/**
 * Tests unitaires de la chronologie des expositions.
 * Les expositions sont les galeries de l'API ; le client d'accès aux
 * données est simulé.
 */

vi.mock('../services/api', async () => {
  const reel = await vi.importActual<typeof import('../services/api')>('../services/api');
  return { ...reel, listerGaleries: vi.fn() };
});

const { listerGaleries } = await import('../services/api');
const listerMock = vi.mocked(listerGaleries);

function galerie(partiel: Partial<Galerie> = {}): Galerie {
  return {
    id: 1,
    name: 'Moisson Bleue',
    slug: 'moisson-bleue',
    year: 2025,
    month: 'Juin',
    role: 'Exposition collective',
    place: "Le Creux de l'Enfer, Thiers",
    ...partiel,
  };
}

function page(donnees: Galerie[]): Page<Galerie> {
  return { data: donnees };
}

function afficher() {
  return render(
    <MemoryRouter>
      <Expositions />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  listerMock.mockReset();
  listerMock.mockResolvedValue(page([]));
});

describe('Expositions — états d’affichage', () => {
  it('affiche le titre de la page', async () => {
    afficher();
    // On laisse le chargement se terminer avant d'observer.
    await waitFor(() => expect(listerMock).toHaveBeenCalled());

    expect(screen.getByRole('heading', { name: 'Expositions', level: 1 })).toBeInTheDocument();
  });

  it('annonce le chargement avant l’arrivée des données', () => {
    listerMock.mockReturnValue(new Promise(() => {}));
    afficher();

    expect(screen.getByRole('status')).toHaveTextContent('Chargement des expositions…');
  });

  it('traite explicitement le cas « aucune exposition »', async () => {
    afficher();
    expect(await screen.findByText("Aucune exposition n'est encore publiée.")).toBeInTheDocument();
  });

  it('affiche le message d’une ApiError', async () => {
    listerMock.mockRejectedValue(new ApiError('Serveur injoignable.', 0));
    afficher();

    expect(await screen.findByRole('alert')).toHaveTextContent('Serveur injoignable.');
  });

  it('affiche un message de repli sur une erreur inattendue', async () => {
    listerMock.mockRejectedValue(new Error('boum'));
    afficher();

    expect(await screen.findByRole('alert')).toHaveTextContent('Erreur inattendue.');
  });

  it('n’affiche aucune erreur lorsque la requête est annulée', async () => {
    const abort = new Error('The operation was aborted.');
    abort.name = 'AbortError';
    listerMock.mockRejectedValue(abort);
    afficher();

    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('Expositions — chronologie', () => {
  it('groupe les expositions par année décroissante', async () => {
    listerMock.mockResolvedValue(
      page([
        galerie({ id: 1, name: 'A', slug: 'a', year: 2023 }),
        galerie({ id: 2, name: 'B', slug: 'b', year: 2025 }),
        galerie({ id: 3, name: 'C', slug: 'c', year: 2025 }),
      ]),
    );
    afficher();

    await screen.findByRole('heading', { name: 'A' });
    const annees = screen.getAllByText(/^20\d{2}$/).map((n) => n.textContent);
    expect(annees).toEqual(['2025', '2023']);
  });

  it('accorde le compteur d’événements', async () => {
    listerMock.mockResolvedValue(
      page([
        galerie({ id: 1, name: 'A', slug: 'a', year: 2025 }),
        galerie({ id: 2, name: 'B', slug: 'b', year: 2025 }),
        galerie({ id: 3, name: 'C', slug: 'c', year: 2024 }),
      ]),
    );
    afficher();

    expect(await screen.findByText('2 événements')).toBeInTheDocument();
    expect(screen.getByText('1 événement')).toBeInTheDocument();
  });

  it('écarte de la chronologie une exposition sans année', async () => {
    listerMock.mockResolvedValue(
      page([galerie(), { name: 'Sans date', slug: 'sans-date' } as Galerie]),
    );
    afficher();

    expect(await screen.findByRole('heading', { name: 'Moisson Bleue' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Sans date' })).not.toBeInTheDocument();
  });

  it('renvoie vers les œuvres de l’exposition', async () => {
    listerMock.mockResolvedValue(page([galerie()]));
    afficher();

    const lien = await screen.findByRole('link', { name: 'Moisson Bleue' });
    expect(lien).toHaveAttribute('href', '/oeuvres?collection=moisson-bleue');
  });
});

describe('Expositions — champs facultatifs', () => {
  it('affiche la nature de l’événement et son commissariat', async () => {
    listerMock.mockResolvedValue(page([galerie({ curator: 'Sophie Auger' })]));
    afficher();

    expect(await screen.findByText('Exposition collective — Sophie Auger')).toBeInTheDocument();
  });

  it('n’ajoute aucun tiret quand le commissariat est absent', async () => {
    listerMock.mockResolvedValue(page([galerie()]));
    afficher();

    expect(await screen.findByText('Exposition collective')).toBeInTheDocument();
  });

  it('omet la ligne descriptive quand ni nature ni commissariat ne sont renseignés', async () => {
    listerMock.mockResolvedValue(page([galerie({ role: undefined, curator: undefined })]));
    afficher();

    const titre = await screen.findByRole('heading', { name: 'Moisson Bleue' });
    const ligne = titre.closest('li') as HTMLElement;
    expect(within(ligne).queryByText(/—/)).not.toBeInTheDocument();
  });

  it('affiche le lieu et le mois', async () => {
    listerMock.mockResolvedValue(page([galerie()]));
    afficher();

    expect(await screen.findByText("Le Creux de l'Enfer, Thiers")).toBeInTheDocument();
    expect(screen.getByText('Juin')).toBeInTheDocument();
  });

  it('renvoie vers le formulaire de contact', async () => {
    afficher();
    await waitFor(() => expect(listerMock).toHaveBeenCalled());

    expect(screen.getByRole('link', { name: "Écrire à l'atelier" })).toHaveAttribute('href', '/contact');
  });
});
