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

/** Filtres acceptés par la liste des œuvres (miroir du service métier). */
export interface FiltresOeuvres {
  medium?: string;
  year?: number;
  /** Slug de la galerie thématique à laquelle l'œuvre est rattachée. */
  collection?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Liste les œuvres, avec filtres facultatifs par médium et par année.
 * Le populate est explicite et restreint (§7.3.3) : image + name/slug de la galerie.
 * Un filtre vide n'ajoute aucun paramètre superflu à l'URL.
 */
export function listerOeuvres(
  filtres: FiltresOeuvres = {},
  signal?: AbortSignal,
): Promise<Page<Oeuvre>> {
  // Bornage de la pagination, en miroir du garde-fou serveur (§7.2) :
  // le client ne demande jamais plus que ce que le serveur accorderait.
  const pageSize =
    filtres.pageSize === undefined
      ? undefined
      : Math.min(24, Math.max(1, filtres.pageSize));
  const page = filtres.page === undefined ? undefined : Math.max(1, filtres.page);

  const chemin =
    '/arts' +
    query({
      'populate[img]': 'true',
      'populate[gallery][fields][0]': 'name',
      'populate[gallery][fields][1]': 'slug',
      'filters[medium][$eq]': filtres.medium,
      'filters[year][$eq]': Number.isInteger(filtres.year) ? filtres.year : undefined,
      'filters[gallery][slug][$eq]': filtres.collection,
      'pagination[page]': page,
      'pagination[pageSize]': pageSize,
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
