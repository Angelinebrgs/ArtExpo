import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Accueil from './Accueil';
import { ApiError } from '../services/api';
import type { Oeuvre, Page } from '../types';

/**
 * Tests unitaires de la page d'accueil.
 * La section « œuvres récentes » est alimentée par l'API ; le reste de la
 * page est éditorial et doit rester lisible même si cet appel échoue.
 */

vi.mock('../services/api', async () => {
  const reel = await vi.importActual<typeof import('../services/api')>('../services/api');
  return { ...reel, listerOeuvres: vi.fn() };
});

const { listerOeuvres } = await import('../services/api');
const listerMock = vi.mocked(listerOeuvres);

function oeuvre(partiel: Partial<Oeuvre> = {}): Oeuvre {
  return {
    id: 1,
    name: 'Reverdie moi',
    slug: 'reverdie-moi',
    description: 'Série de douze cyanotypes.',
    year: 2024,
    medium: 'cyanotype',
    img: null,
    ...partiel,
  };
}

function page(donnees: Oeuvre[]): Page<Oeuvre> {
  return { data: donnees };
}

function afficher() {
  return render(
    <MemoryRouter>
      <Accueil />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  listerMock.mockReset();
  listerMock.mockResolvedValue(page([]));
});

describe('Accueil — contenu éditorial', () => {
  it('affiche le nom de l’artiste en couverture', async () => {
    afficher();

    const titre = await screen.findByRole('heading', { level: 1 });
    expect(titre).toHaveTextContent('maïlyss');
    expect(titre).toHaveTextContent('borges');
  });

  it('oriente vers la collection et vers le contact', async () => {
    afficher();
    // On laisse le chargement des œuvres récentes se terminer avant d'observer.
    await waitFor(() => expect(listerMock).toHaveBeenCalled());

    expect(screen.getByRole('link', { name: 'Voir les œuvres' })).toHaveAttribute('href', '/oeuvres');
    expect(screen.getByRole('link', { name: /écrire à l'atelier/i })).toHaveAttribute('href', '/contact');
  });
});

describe('Accueil — œuvres récentes', () => {
  it('affiche les œuvres renvoyées par l’API', async () => {
    listerMock.mockResolvedValue(
      page([oeuvre(), oeuvre({ id: 2, name: 'Love and Mold', slug: 'love-and-mold', medium: 'performance' })]),
    );
    afficher();

    expect(await screen.findByRole('heading', { name: 'Reverdie moi', level: 3 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Love and Mold', level: 3 })).toBeInTheDocument();
  });

  it('ne demande que les quatre œuvres nécessaires', async () => {
    afficher();

    await waitFor(() => expect(listerMock).toHaveBeenCalled());
    expect(listerMock.mock.calls[0][0]).toEqual({ pageSize: 4 });
  });

  it('n’affiche jamais plus de quatre œuvres', async () => {
    listerMock.mockResolvedValue(
      page(
        Array.from({ length: 6 }, (_, i) =>
          oeuvre({ id: i + 1, name: `Œuvre ${i + 1}`, slug: `oeuvre-${i + 1}` }),
        ),
      ),
    );
    afficher();

    await screen.findByRole('heading', { name: 'Œuvre 1', level: 3 });
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
  });

  it('lie chaque œuvre à sa page de détail', async () => {
    listerMock.mockResolvedValue(page([oeuvre()]));
    afficher();

    const lien = await screen.findByRole('link', { name: /Reverdie moi/ });
    expect(lien).toHaveAttribute('href', '/oeuvres/reverdie-moi');
  });

  it('utilise le libellé lisible du médium', async () => {
    listerMock.mockResolvedValue(page([oeuvre({ medium: 'installation_sonore' })]));
    afficher();

    // Le libellé figure aussi dans la légende du visuel de repli : on cible
    // la ligne descriptive de l'œuvre pour lever l'ambiguïté.
    const item = (await screen.findAllByRole('listitem'))[0];
    expect(item).toHaveTextContent('Installation sonore — 2024');
  });

  it('affiche l’image de l’œuvre quand elle existe', async () => {
    listerMock.mockResolvedValue(
      page([
        oeuvre({
          img: {
            url: '/uploads/original.jpg',
            alternativeText: 'Planche 07',
            formats: { medium: { url: '/uploads/medium_original.jpg', width: 750, height: 1000 } },
          },
        }),
      ]),
    );
    afficher();

    const image = await screen.findByRole('img', { name: 'Planche 07' });
    expect(image).toHaveAttribute('src', 'http://localhost:1337/uploads/medium_original.jpg');
  });

  it('masque la section quand l’API ne renvoie aucune œuvre', async () => {
    afficher();

    await waitFor(() => expect(listerMock).toHaveBeenCalled());
    expect(screen.queryByRole('heading', { name: 'Œuvres récentes' })).not.toBeInTheDocument();
  });

  it('reste lisible si l’API échoue, sans afficher d’erreur', async () => {
    listerMock.mockRejectedValue(new ApiError('Serveur injoignable.', 0));
    afficher();

    // Le contenu éditorial est indépendant de l'API.
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('borges');
    // Aucune alerte ne doit polluer la page d'accueil pour une section secondaire.
    await waitFor(() => expect(listerMock).toHaveBeenCalled());
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Œuvres récentes' })).not.toBeInTheDocument();
  });
});
