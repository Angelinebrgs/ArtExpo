import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import OeuvreDetail from './OeuvreDetail';
import { ApiError } from '../services/api';
import type { Oeuvre, Page } from '../types';

/**
 * Tests unitaires de la page de détail d'une œuvre.
 * Le client d'accès aux données est simulé : on vérifie le comportement du
 * composant, pas le réseau.
 */

vi.mock('../services/api', async () => {
  const reel = await vi.importActual<typeof import('../services/api')>('../services/api');
  return { ...reel, recupererOeuvre: vi.fn(), listerOeuvres: vi.fn() };
});

const { recupererOeuvre, listerOeuvres } = await import('../services/api');
const recupererMock = vi.mocked(recupererOeuvre);
const listerMock = vi.mocked(listerOeuvres);

function oeuvre(partiel: Partial<Oeuvre> = {}): Oeuvre {
  return {
    id: 1,
    name: 'Reverdie moi',
    slug: 'reverdie-moi',
    description: 'Série de douze cyanotypes réalisés à même la peau.',
    year: 2024,
    medium: 'cyanotype',
    img: null,
    ...partiel,
  };
}

function page(donnees: Oeuvre[]): Page<Oeuvre> {
  return { data: donnees };
}

/** Monte le composant sur la route /oeuvres/:slug. */
function afficher(slug = 'reverdie-moi') {
  return render(
    <MemoryRouter initialEntries={[`/oeuvres/${slug}`]}>
      <Routes>
        <Route path="/oeuvres/:slug" element={<OeuvreDetail />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  recupererMock.mockReset();
  listerMock.mockReset();
  // L'œuvre suivante est un confort de navigation : par défaut, liste vide.
  listerMock.mockResolvedValue(page([]));
});

describe('OeuvreDetail — états d’affichage', () => {
  it('annonce le chargement avant l’arrivée des données', () => {
    recupererMock.mockReturnValue(new Promise(() => {}));
    afficher();

    expect(screen.getByRole('status')).toHaveTextContent("Chargement de l'œuvre…");
  });

  it('affiche le titre, le médium et l’année de l’œuvre', async () => {
    recupererMock.mockResolvedValue(oeuvre());
    afficher();

    expect(await screen.findByRole('heading', { name: 'Reverdie moi', level: 1 })).toBeInTheDocument();

    // La fiche technique est ciblée par ses rôles : le médium et l'année
    // figurent aussi dans le fil d'Ariane, ce qui rendrait une recherche par
    // texte ambiguë.
    const definitions = screen.getAllByRole('definition').map((d) => d.textContent);
    // Le libellé lisible est utilisé, pas la valeur brute de l'énumération.
    expect(definitions).toContain('Cyanotype');
    expect(definitions).toContain('2024');
  });

  it('interroge l’API avec le slug de l’URL', async () => {
    recupererMock.mockResolvedValue(oeuvre({ slug: 'love-and-mold', name: 'Love and Mold' }));
    afficher('love-and-mold');

    await waitFor(() => expect(recupererMock).toHaveBeenCalled());
    expect(recupererMock.mock.calls[0][0]).toBe('love-and-mold');
  });

  it('annonce explicitement une œuvre introuvable et propose un retour', async () => {
    // L'URL est valide au sens du routeur, mais ne désigne aucune œuvre.
    recupererMock.mockResolvedValue(null);
    afficher('inconnue');

    expect(await screen.findByRole('heading', { name: "Cette œuvre n'existe pas" })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voir la collection' })).toHaveAttribute('href', '/oeuvres');
  });

  it('affiche le message d’une ApiError', async () => {
    recupererMock.mockRejectedValue(new ApiError('Serveur injoignable.', 0));
    afficher();

    expect(await screen.findByRole('alert')).toHaveTextContent('Serveur injoignable.');
    expect(screen.getByRole('link', { name: 'Retour à la collection' })).toBeInTheDocument();
  });

  it('affiche un message de repli sur une erreur inattendue', async () => {
    recupererMock.mockRejectedValue(new Error('boum'));
    afficher();

    expect(await screen.findByRole('alert')).toHaveTextContent('Erreur inattendue.');
  });

  it('n’affiche aucune erreur lorsque la requête est annulée', async () => {
    const abort = new Error('The operation was aborted.');
    abort.name = 'AbortError';
    recupererMock.mockRejectedValue(abort);
    afficher();

    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('OeuvreDetail — contenu', () => {
  it('découpe la description en paragraphes', async () => {
    recupererMock.mockResolvedValue(
      oeuvre({ description: 'Premier paragraphe.\n\nSecond paragraphe.' }),
    );
    afficher();

    expect(await screen.findByText('Premier paragraphe.')).toBeInTheDocument();
    expect(screen.getByText('Second paragraphe.')).toBeInTheDocument();
  });

  it('affiche la collection rattachée et y renvoie', async () => {
    recupererMock.mockResolvedValue(
      oeuvre({ gallery: { name: 'Moisson Bleue', slug: 'moisson-bleue' } }),
    );
    afficher();

    const lien = await screen.findByRole('link', { name: 'Moisson Bleue' });
    expect(lien).toHaveAttribute('href', '/oeuvres?collection=moisson-bleue');
  });

  it('omet la ligne Collection quand l’œuvre n’est rattachée à aucune galerie', async () => {
    recupererMock.mockResolvedValue(oeuvre({ gallery: null }));
    afficher();

    await screen.findByRole('heading', { name: 'Reverdie moi', level: 1 });
    expect(screen.queryByText('Collection')).not.toBeInTheDocument();
  });

  it('utilise le format large de l’image quand il existe', async () => {
    recupererMock.mockResolvedValue(
      oeuvre({
        img: {
          url: '/uploads/original.jpg',
          alternativeText: 'Planche 07',
          formats: { large: { url: '/uploads/large_original.jpg', width: 1000, height: 563 } },
        },
      }),
    );
    afficher();

    const image = await screen.findByRole('img', { name: 'Planche 07' });
    expect(image).toHaveAttribute('src', 'http://localhost:1337/uploads/large_original.jpg');
  });

  it('retombe sur l’image d’origine si aucun format large n’est fourni', async () => {
    recupererMock.mockResolvedValue(
      oeuvre({ img: { url: '/uploads/original.jpg', alternativeText: null } }),
    );
    afficher();

    const image = await screen.findByRole('img', { name: 'Reverdie moi' });
    expect(image).toHaveAttribute('src', 'http://localhost:1337/uploads/original.jpg');
  });
});

describe('OeuvreDetail — œuvre suivante', () => {
  it('propose l’œuvre suivante de la collection', async () => {
    recupererMock.mockResolvedValue(oeuvre());
    listerMock.mockResolvedValue(
      page([oeuvre(), oeuvre({ id: 2, name: 'Love and Mold', slug: 'love-and-mold' })]),
    );
    afficher();

    const lien = await screen.findByRole('link', { name: 'Love and Mold' });
    expect(lien).toHaveAttribute('href', '/oeuvres/love-and-mold');
  });

  it('boucle sur la première œuvre lorsque la dernière est affichée', async () => {
    recupererMock.mockResolvedValue(oeuvre({ id: 2, name: 'Love and Mold', slug: 'love-and-mold' }));
    listerMock.mockResolvedValue(
      page([oeuvre(), oeuvre({ id: 2, name: 'Love and Mold', slug: 'love-and-mold' })]),
    );
    afficher('love-and-mold');

    expect(await screen.findByRole('link', { name: 'Reverdie moi' })).toBeInTheDocument();
  });

  it('n’affiche rien quand l’œuvre est la seule de la collection', async () => {
    recupererMock.mockResolvedValue(oeuvre());
    listerMock.mockResolvedValue(page([oeuvre()]));
    afficher();

    await screen.findByRole('heading', { name: 'Reverdie moi', level: 1 });
    expect(screen.queryByText('Œuvre suivante')).not.toBeInTheDocument();
  });

  it('reste silencieux si la liste échoue : la page principale n’est pas dégradée', async () => {
    recupererMock.mockResolvedValue(oeuvre());
    listerMock.mockRejectedValue(new ApiError('Serveur injoignable.', 0));
    afficher();

    // Le contenu principal s'affiche normalement...
    expect(await screen.findByRole('heading', { name: 'Reverdie moi', level: 1 })).toBeInTheDocument();
    // ...et aucun message d'erreur ne pollue la page pour un élément secondaire.
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByText('Œuvre suivante')).not.toBeInTheDocument();
  });
});
