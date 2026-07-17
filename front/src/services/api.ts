/* =========================================================================
   Client d'accès aux données — point d'entrée UNIQUE du front vers l'API.
   §7.3.2 du dossier : aucune adresse en dur, erreurs normalisées, annulation.
   Aucun composant n'appelle `fetch` directement.
   ========================================================================= */

import type { Champs, Oeuvre, Page } from '../types';

/** URL de base de l'API (ex. http://localhost:1337/api). Jamais écrite en dur. */
const BASE: string = import.meta.env.VITE_API_URL;

/** Hôte Strapi sans le suffixe /api — sert à résoudre les URLs de médias. */
const ORIGINE: string = BASE.replace(/\/api\/?$/, '');

/**
 * Résout l'URL absolue d'un média Strapi.
 * Les médias renvoient une URL relative à l'hôte (ex. /uploads/xxx.jpg) ;
 * en production derrière un CDN, l'URL peut déjà être absolue.
 */
export function urlMedia(chemin: string | undefined | null): string {
  if (!chemin) return '';
  return /^https?:\/\//.test(chemin) ? chemin : `${ORIGINE}${chemin}`;
}

/**
 * Erreur applicative normalisée. Distingue trois cas :
 *  - serveur injoignable (statut 0, erreur réseau) ;
 *  - erreur applicative avec détail par champ (validation refusée) ;
 *  - erreur générique.
 * Les composants réagissent sans connaître les codes HTTP.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statut: number,
    public readonly champs: Record<string, string> = {},
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Requête générique typée. */
async function requete<T>(chemin: string, init: RequestInit = {}): Promise<T> {
  let reponse: Response;
  try {
    reponse = await fetch(`${BASE}${chemin}`, {
      headers: { 'Content-Type': 'application/json', ...init.headers },
      ...init,
    });
  } catch (e) {
    // fetch ne rejette que sur erreur réseau : on la distingue d'une
    // erreur applicative pour pouvoir afficher un message adapté.
    if ((e as Error).name === 'AbortError') throw e;
    throw new ApiError('Serveur injoignable.', 0);
  }

  if (!reponse.ok) {
    const corps = await reponse.json().catch(() => ({}));
    throw new ApiError(
      corps?.error?.message ?? `Erreur ${reponse.status}`,
      reponse.status,
      corps?.error?.details?.erreurs ?? {},
    );
  }

  return reponse.json() as Promise<T>;
}

/** Encode un objet de query-params (valeurs undefined ignorées). */
function query(params: Record<string, string | number | undefined>): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') p.append(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : '';
}

/**
 * Liste les œuvres, avec filtre facultatif par médium.
 * Le populate est explicite et restreint (§7.3.3) : image + name/slug de la galerie.
 */
export function listerOeuvres(
  filtres: { medium?: string } = {},
  signal?: AbortSignal,
): Promise<Page<Oeuvre>> {
  const chemin =
    '/arts' +
    query({
      'populate[img]': 'true',
      'populate[gallery][fields][0]': 'name',
      'populate[gallery][fields][1]': 'slug',
      'filters[medium][$eq]': filtres.medium,
      'sort[0]': 'year:desc',
      'sort[1]': 'createdAt:desc',
    });
  return requete<Page<Oeuvre>>(chemin, { signal });
}

/** Récupère une œuvre par son slug. `null` si aucune ne correspond. */
export async function recupererOeuvre(
  slug: string,
  signal?: AbortSignal,
): Promise<Oeuvre | null> {
  const chemin =
    '/arts' +
    query({
      'filters[slug][$eq]': slug,
      'populate[img]': 'true',
      'populate[gallery][fields][0]': 'name',
      'populate[gallery][fields][1]': 'slug',
    });
  const page = await requete<Page<Oeuvre>>(chemin, { signal });
  return page.data[0] ?? null;
}

/**
 * Envoie un message de contact.
 * `website` est un pot de miel (honeypot) : rempli => rejeté côté serveur.
 */
export function envoyerMessage(
  message: Champs & { website?: string },
  signal?: AbortSignal,
): Promise<unknown> {
  return requete('/messages', {
    method: 'POST',
    body: JSON.stringify({ data: message }),
    signal,
  });
}
