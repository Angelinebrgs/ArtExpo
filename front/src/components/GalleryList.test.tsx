import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import GalleryList from './GalleryList';
import { ApiError } from '../services/api';
import type { Oeuvre, Page } from '../types';

/**
 * Tests unitaires de la liste des œuvres (§9.2).
 * Le client d'accès aux données est simulé : le composant ignore tout du
 * protocole HTTP, on vérifie donc son comportement, pas le réseau.
 */

vi.mock('../services/api', async () => {
  const reel = await vi.importActual<typeof import('../services/api')>('../services/api');
  return { ...reel, listerOeuvres: vi.fn() };
});

const { listerOeuvres } = await import('../services/api');
const listerMock = vi.mocked(listerOeuvres);

/** Construit une œuvre de test. */
function oeuvre(partiel: Partial<Oeuvre> = {}): Oeuvre {
  return {
    id: 1,
    name: 'Reverdie moi',
    slug: 'reverdie-moi',
    description: 'Série de cyanotypes.',
    year: 2024,
    medium: 'cyanotype',
    img: null,
    ...partiel,
  };
}

/** Enveloppe de page renvoyée par l'API. */
function page(donnees: Oeuvre[]): Page<Oeuvre> {
  return { data: donnees };
}

function afficher(url = '/oeuvres') {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <GalleryList />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  listerMock.mockReset();
});

describe('GalleryList — états d’affichage', () => {
  it('annonce le chargement avant l’arrivée des données', async () => {
    listerMock.mockReturnValue(new Promise(() => {})); // jamais résolue
    afficher();

    // Un composant qui n'affiche rien pendant qu'il charge paraît cassé.
    expect(screen.getByRole('status')).toHaveTextContent('Chargement des œuvres…');
  });

  it('affiche les œuvres reçues', async () => {
    listerMock.mockResolvedValue(
      page([oeuvre(), oeuvre({ id: 2, name: 'Love and Mold', slug: 'love-and-mold', year: 2025 })]),
    );
    afficher();

    // Le titre est ciblé par son rôle : le nom figure aussi dans la légende
    // du visuel de repli, ce qui rendrait une recherche par texte ambiguë.
    expect(await screen.findByRole('heading', { name: 'Reverdie moi' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Love and Mold' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('lie chaque œuvre à sa page de détail', async () => {
    listerMock.mockResolvedValue(page([oeuvre()]));
    afficher();

    const lien = await screen.findByRole('link');
    expect(lien).toHaveAttribute('href', '/oeuvres/reverdie-moi');
  });

  it('traite explicitement le cas « aucun résultat »', async () => {
    listerMock.mockResolvedValue(page([]));
    afficher();

    expect(await screen.findByText('Aucune œuvre ne correspond à ce filtre.')).toBeInTheDocument();
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

    // L'annulation est un événement normal, pas une panne à signaler.
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('GalleryList — image de l’œuvre', () => {
  it('utilise le format medium de l’image quand il existe', async () => {
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

  it('retombe sur le nom de l’œuvre si aucun texte alternatif n’est fourni', async () => {
    listerMock.mockResolvedValue(
      page([oeuvre({ img: { url: '/uploads/original.jpg', alternativeText: null } })]),
    );
    afficher();

    expect(await screen.findByRole('img', { name: 'Reverdie moi' })).toBeInTheDocument();
  });
});

describe('GalleryList — filtres', () => {
  it('ne transmet aucun médium au premier chargement', async () => {
    listerMock.mockResolvedValue(page([]));
    afficher();

    await waitFor(() => expect(listerMock).toHaveBeenCalled());
    expect(listerMock.mock.calls[0][0]).toEqual({ medium: undefined });
  });

  it('relance la requête avec le médium choisi', async () => {
    listerMock.mockResolvedValue(page([]));
    afficher();
    await waitFor(() => expect(listerMock).toHaveBeenCalledTimes(1));

    await userEvent.click(screen.getByRole('button', { name: 'Cyanotype' }));

    await waitFor(() => expect(listerMock).toHaveBeenCalledTimes(2));
    expect(listerMock.mock.calls[1][0]).toEqual({ medium: 'cyanotype' });
  });

  it('marque le filtre actif de façon accessible', async () => {
    listerMock.mockResolvedValue(page([]));
    afficher();

    const groupe = screen.getByRole('group', { name: 'Filtrer par médium' });
    expect(within(groupe).getByRole('button', { name: 'Tout' })).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(within(groupe).getByRole('button', { name: 'Édition' }));

    expect(within(groupe).getByRole('button', { name: 'Édition' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(groupe).getByRole('button', { name: 'Tout' })).toHaveAttribute('aria-pressed', 'false');
  });
});

describe('GalleryList — concurrence', () => {
  it('annule la requête en cours lorsque le filtre change', async () => {
    listerMock.mockReturnValue(new Promise(() => {}));
    afficher();
    await waitFor(() => expect(listerMock).toHaveBeenCalledTimes(1));

    const premierSignal = listerMock.mock.calls[0][1] as AbortSignal;
    expect(premierSignal.aborted).toBe(false);

    await userEvent.click(screen.getByRole('button', { name: 'Performance' }));

    // Sans cette annulation, une réponse obsolète pourrait écraser la plus récente.
    await waitFor(() => expect(premierSignal.aborted).toBe(true));
  });

  it('n’écrase pas le résultat récent par une réponse obsolète', async () => {
    // Première requête lente, seconde rapide : l'ordre d'arrivée est inversé.
    // Le faux client reproduit le comportement réel de `fetch` : une requête
    // annulée est rejetée par une AbortError et ne livre jamais sa réponse.
    let livrerLaReponseObsolete: () => void = () => {};

    listerMock.mockImplementationOnce(
      (_filtres, signal) =>
        new Promise<Page<Oeuvre>>((resoudre, rejeter) => {
          livrerLaReponseObsolete = () => resoudre(page([oeuvre({ id: 1, name: 'Reverdie moi' })]));
          signal?.addEventListener('abort', () => {
            const abort = new Error('The operation was aborted.');
            abort.name = 'AbortError';
            rejeter(abort);
          });
        }),
    );
    listerMock.mockResolvedValueOnce(
      page([oeuvre({ id: 2, name: 'Love and Mold', slug: 'love-and-mold' })]),
    );

    afficher();
    await waitFor(() => expect(listerMock).toHaveBeenCalledTimes(1));

    await userEvent.click(screen.getByRole('button', { name: 'Performance' }));
    expect(await screen.findByRole('heading', { name: 'Love and Mold' })).toBeInTheDocument();

    // La réponse tardive de la requête abandonnée ne doit rien remplacer.
    livrerLaReponseObsolete();

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Love and Mold' })).toBeInTheDocument(),
    );
    expect(screen.queryByRole('heading', { name: 'Reverdie moi' })).not.toBeInTheDocument();
    // Aucune erreur ne doit être affichée : une annulation n'est pas une panne.
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('GalleryList — filtre par collection', () => {
  it('transmet la collection lue dans l’URL', async () => {
    listerMock.mockResolvedValue(page([]));
    afficher('/oeuvres?collection=moisson-bleue');

    await waitFor(() => expect(listerMock).toHaveBeenCalled());
    expect(listerMock.mock.calls[0][0]).toEqual({
      medium: undefined,
      collection: 'moisson-bleue',
    });
  });

  it('annonce la collection active et permet de la retirer', async () => {
    listerMock.mockResolvedValue(page([]));
    afficher('/oeuvres?collection=moisson-bleue');

    expect(screen.getByText(/Collection · moisson-bleue/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Retirer le filtre' }));

    // Le filtre disparaît et la liste est rechargée sans collection.
    await waitFor(() => expect(screen.queryByText(/Collection ·/)).not.toBeInTheDocument());
    const appels = listerMock.mock.calls;
    expect(appels[appels.length - 1][0]).toEqual({ medium: undefined, collection: undefined });
  });

  it('n’affiche aucun bandeau quand aucune collection n’est demandée', async () => {
    listerMock.mockResolvedValue(page([]));
    afficher();

    await waitFor(() => expect(listerMock).toHaveBeenCalled());
    expect(screen.queryByText(/Collection ·/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retirer le filtre' })).not.toBeInTheDocument();
  });

  it('combine collection et médium', async () => {
    listerMock.mockResolvedValue(page([]));
    afficher('/oeuvres?collection=moisson-bleue');
    await waitFor(() => expect(listerMock).toHaveBeenCalledTimes(1));

    await userEvent.click(screen.getByRole('button', { name: 'Cyanotype' }));

    await waitFor(() => expect(listerMock).toHaveBeenCalledTimes(2));
    expect(listerMock.mock.calls[1][0]).toEqual({
      medium: 'cyanotype',
      collection: 'moisson-bleue',
    });
  });

  it('adapte le message quand la collection ne contient aucune œuvre', async () => {
    listerMock.mockResolvedValue(page([]));
    afficher('/oeuvres?collection=vide');

    expect(
      await screen.findByText('Aucune œuvre dans cette collection pour ce filtre.'),
    ).toBeInTheDocument();
  });
});
