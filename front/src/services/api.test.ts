import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ApiError,
  envoyerMessage,
  listerGaleries,
  listerOeuvres,
  recupererOeuvre,
  urlMedia,
} from './api';

/**
 * Tests unitaires du client d'accès aux données (§9.1 — portée « api.ts »).
 * Ils couvrent la construction des requêtes et la normalisation des erreurs.
 */

/** Prépare un faux `fetch` renvoyant une réponse JSON avec le statut voulu. */
function simulerReponse(corps: unknown, statut = 200) {
  const mock = vi.fn().mockResolvedValue({
    ok: statut >= 200 && statut < 300,
    status: statut,
    json: async () => corps,
  } as Response);
  vi.stubGlobal('fetch', mock);
  return mock;
}

/** Retourne l'URL passée au dernier appel de `fetch`. */
function urlAppelee(mock: ReturnType<typeof vi.fn>): string {
  return mock.mock.calls[0][0] as string;
}

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('listerOeuvres — construction de la requête', () => {
  it('place le médium et l’année dans la chaîne de requête', async () => {
    const mock = simulerReponse({ data: [] });

    await listerOeuvres({ medium: 'cyanotype', year: 2024 });

    const url = urlAppelee(mock);
    expect(url).toContain('filters%5Bmedium%5D%5B%24eq%5D=cyanotype');
    expect(url).toContain('filters%5Byear%5D%5B%24eq%5D=2024');
  });

  it('n’ajoute aucun paramètre superflu quand aucun filtre n’est fourni', async () => {
    const mock = simulerReponse({ data: [] });

    await listerOeuvres();

    const url = urlAppelee(mock);
    expect(url).not.toContain('filters');
    expect(url).not.toContain('pagination');
    // Le populate et le tri restent présents : ils ne dépendent pas des filtres.
    expect(url).toContain('populate');
    expect(url).toContain('sort');
  });

  it('ignore une année non entière', async () => {
    const mock = simulerReponse({ data: [] });

    await listerOeuvres({ year: Number.NaN });

    // Le tri porte légitimement sur `year` : seul le filtre doit être absent.
    expect(urlAppelee(mock)).not.toContain('filters%5Byear%5D');
  });

  it('filtre sur le slug de la collection', async () => {
    const mock = simulerReponse({ data: [] });

    await listerOeuvres({ collection: 'moisson-bleue' });

    expect(urlAppelee(mock)).toContain(
      'filters%5Bgallery%5D%5Bslug%5D%5B%24eq%5D=moisson-bleue',
    );
  });

  it('combine le médium et la collection', async () => {
    const mock = simulerReponse({ data: [] });

    await listerOeuvres({ medium: 'cyanotype', collection: 'moisson-bleue' });

    const url = urlAppelee(mock);
    expect(url).toContain('filters%5Bmedium%5D%5B%24eq%5D=cyanotype');
    expect(url).toContain('filters%5Bgallery%5D%5Bslug%5D%5B%24eq%5D=moisson-bleue');
  });

  it('borne la pagination à 24 éléments, en miroir du garde-fou serveur', async () => {
    const mock = simulerReponse({ data: [] });

    await listerOeuvres({ page: 0, pageSize: 500 });

    const url = urlAppelee(mock);
    expect(url).toContain('pagination%5BpageSize%5D=24');
    expect(url).toContain('pagination%5Bpage%5D=1');
  });

  it('interroge le chemin /arts sur l’URL de base configurée', async () => {
    const mock = simulerReponse({ data: [] });

    await listerOeuvres();

    expect(urlAppelee(mock)).toMatch(/^http:\/\/localhost:1337\/api\/arts/);
  });

  it('retourne les données de la page en cas de succès', async () => {
    simulerReponse({ data: [{ id: 1, name: 'Reverdie moi' }] });

    const page = await listerOeuvres();

    expect(page.data).toHaveLength(1);
    expect(page.data[0].name).toBe('Reverdie moi');
  });
});

describe('listerOeuvres — normalisation des erreurs', () => {
  it('signale un serveur injoignable par une ApiError de statut 0', async () => {
    // fetch ne rejette que sur erreur réseau.
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    const echec = listerOeuvres();

    await expect(echec).rejects.toBeInstanceOf(ApiError);
    await expect(echec).rejects.toMatchObject({
      statut: 0,
      message: 'Serveur injoignable.',
    });
  });

  it('propage l’AbortError sans la convertir en erreur applicative', async () => {
    const abort = new Error('The operation was aborted.');
    abort.name = 'AbortError';
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abort));

    // L'annulation doit rester reconnaissable par l'appelant, qui l'ignore
    // volontairement : sans cela, changer de filtre afficherait une erreur.
    await expect(listerOeuvres()).rejects.toMatchObject({ name: 'AbortError' });
    await expect(listerOeuvres()).rejects.not.toBeInstanceOf(ApiError);
  });

  it('transmet le signal d’annulation à fetch', async () => {
    const mock = simulerReponse({ data: [] });
    const controleur = new AbortController();

    await listerOeuvres({}, controleur.signal);

    const init = mock.mock.calls[0][1] as RequestInit;
    expect(init.signal).toBe(controleur.signal);
  });

  it('reprend le message d’erreur renvoyé par le serveur', async () => {
    simulerReponse({ error: { message: 'Ressource indisponible.' } }, 503);

    await expect(listerOeuvres()).rejects.toMatchObject({
      statut: 503,
      message: 'Ressource indisponible.',
    });
  });

  it('fournit un message par défaut si le serveur n’en donne aucun', async () => {
    simulerReponse({}, 500);

    await expect(listerOeuvres()).rejects.toMatchObject({
      statut: 500,
      message: 'Erreur 500',
    });
  });

  it('expose le détail des erreurs par champ', async () => {
    simulerReponse(
      { error: { message: 'Validation refusée.', details: { erreurs: { email: 'Adresse e-mail invalide.' } } } },
      400,
    );

    await expect(listerOeuvres()).rejects.toMatchObject({
      champs: { email: 'Adresse e-mail invalide.' },
    });
  });
});

describe('recupererOeuvre', () => {
  it('filtre sur le slug demandé', async () => {
    const mock = simulerReponse({ data: [{ id: 1, slug: 'reverdie-moi' }] });

    await recupererOeuvre('reverdie-moi');

    expect(urlAppelee(mock)).toContain('filters%5Bslug%5D%5B%24eq%5D=reverdie-moi');
  });

  it('retourne null quand aucune œuvre ne correspond', async () => {
    simulerReponse({ data: [] });

    await expect(recupererOeuvre('inconnue')).resolves.toBeNull();
  });
});

describe('listerGaleries', () => {
  it('interroge /galleries en triant par année décroissante', async () => {
    const mock = simulerReponse({ data: [] });

    await listerGaleries();

    const url = urlAppelee(mock);
    expect(url).toMatch(/^http:\/\/localhost:1337\/api\/galleries/);
    expect(url).toContain('sort%5B0%5D=year%3Adesc');
  });

  it('ne demande aucun populate : la chronologie n’affiche pas les œuvres', async () => {
    const mock = simulerReponse({ data: [] });

    await listerGaleries();

    expect(urlAppelee(mock)).not.toContain('populate');
  });

  it('transmet le signal d’annulation', async () => {
    const mock = simulerReponse({ data: [] });
    const controleur = new AbortController();

    await listerGaleries(controleur.signal);

    expect((mock.mock.calls[0][1] as RequestInit).signal).toBe(controleur.signal);
  });
});

describe('envoyerMessage', () => {
  it('envoie le message en POST, encapsulé dans une propriété data', async () => {
    const mock = simulerReponse({ data: { id: 1 } });

    await envoyerMessage({
      name: 'Ada Lovelace',
      email: 'ada@exemple.fr',
      body: 'Bonjour, je souhaite exposer.',
    });

    const [url, init] = mock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://localhost:1337/api/messages');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({
      data: {
        name: 'Ada Lovelace',
        email: 'ada@exemple.fr',
        body: 'Bonjour, je souhaite exposer.',
      },
    });
  });

  it('transmet le pot de miel au serveur', async () => {
    const mock = simulerReponse({ data: { id: 1 } });

    await envoyerMessage({
      name: 'Robot',
      email: 'robot@exemple.fr',
      body: 'Message automatique.',
      website: 'http://spam.example',
    });

    const init = mock.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(init.body as string).data.website).toBe('http://spam.example');
  });
});

describe('urlMedia', () => {
  it('préfixe une URL relative par l’hôte Strapi, sans le suffixe /api', () => {
    expect(urlMedia('/uploads/oeuvre.jpg')).toBe('http://localhost:1337/uploads/oeuvre.jpg');
  });

  it('laisse une URL absolue inchangée (cas d’un CDN)', () => {
    expect(urlMedia('https://cdn.exemple.fr/oeuvre.jpg')).toBe('https://cdn.exemple.fr/oeuvre.jpg');
  });

  it('retourne une chaîne vide si le média est absent', () => {
    expect(urlMedia(null)).toBe('');
    expect(urlMedia(undefined)).toBe('');
  });
});
