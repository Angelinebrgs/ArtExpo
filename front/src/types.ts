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

/** Galerie thématique (relation manyToOne, populate restreint à name+slug). */
export interface Galerie {
  name: string;
  slug: string;
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
