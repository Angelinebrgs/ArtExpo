/* =========================================================================
   Types métier — reflètent le schéma Strapi (content-type `art`) du dossier.
   ========================================================================= */

/** Médiums fermés (enumeration Strapi, §7.3.1). */
export type Medium = 'performance' | 'cyanotype' | 'edition' | 'installation_sonore';

/** Un format dérivé d'un média Strapi (thumbnail, small, medium, large). */
export interface FormatMedia {
  url: string;
  width: number;
  height: number;
}

/** Média Strapi (champ `img`). L'URL est relative à l'hôte Strapi. */
export interface Media {
  url: string;
  alternativeText?: string | null;
  width?: number;
  height?: number;
  formats?: {
    thumbnail?: FormatMedia;
    small?: FormatMedia;
    medium?: FormatMedia;
    large?: FormatMedia;
  } | null;
}

/**
 * Galerie thématique — c'est aussi l'entité qui porte les expositions
 * (voir §5.4 : « Expo 2024, Portfolio printemps »).
 *
 * Les champs éditoriaux sont facultatifs : lorsqu'une galerie est chargée
 * en relation depuis une œuvre, le populate est volontairement restreint à
 * `name` et `slug` (§7.3.3), et eux seuls sont alors présents.
 */
export interface Galerie {
  id?: number;
  name: string;
  slug: string;
  year?: number;
  month?: string;
  /** Nature de l'événement : individuelle, collective, résidence… */
  role?: string;
  place?: string;
  /** Commissariat ; absent lorsqu'il n'y en a pas. */
  curator?: string;
}

/** Une œuvre (entité ARTWORK). */
export interface Oeuvre {
  id: number;
  documentId?: string;
  name: string;
  slug: string;
  description: string;
  year: number;
  medium: Medium;
  img: Media | null;
  gallery?: Galerie | null;
}

/** Enveloppe de liste Strapi : données + méta de pagination. */
export interface Page<T> {
  data: T[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

/** Libellés lisibles des médiums, pour l'affichage et les filtres. */
export const MEDIUMS: { id: '' | Medium; label: string }[] = [
  { id: '', label: 'Tout' },
  { id: 'performance', label: 'Performance' },
  { id: 'cyanotype', label: 'Cyanotype' },
  { id: 'edition', label: 'Édition' },
  { id: 'installation_sonore', label: 'Installation sonore' },
];

/** Libellé lisible d'un médium ; retombe sur la valeur brute si elle est inconnue. */
export function libelleMedium(id: Medium): string {
  return MEDIUMS.find((m) => m.id === id)?.label ?? id;
}

/** Champs du formulaire de contact (§7.1.2). */
export interface Champs {
  name: string;
  email: string;
  body: string;
}
