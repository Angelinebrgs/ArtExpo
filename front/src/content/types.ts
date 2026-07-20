/* =========================================================================
   Types du contenu éditorial (expositions, écrits, à propos).

   Ces trois rubriques ne sont pas encore gérées par le CMS : elles n'ont pas
   d'entité Strapi correspondante. Leur contenu vit donc dans `src/content/`,
   mais il est typé et façonné comme une réponse d'API. Le jour où les
   entités sont créées côté back, seul le module de contenu est remplacé par
   un appel à `services/api.ts` : les composants d'affichage ne changent pas.
   ========================================================================= */

/** Une entrée de la chronologie des expositions. */
export interface Exposition {
  id: string;
  year: number;
  month: string;
  title: string;
  /** Nature de l'événement : individuelle, collective, résidence… */
  role: string;
  place: string;
  /** Commissariat ; absent lorsqu'il n'y en a pas. */
  curator?: string;
}

/** Un texte publié ou un extrait de carnet. */
export interface Ecrit {
  id: string;
  title: string;
  /** Sous-titre : nature de l'extrait (« Extrait — fragment 12 »). */
  sub: string;
  year: number;
  /** Paragraphes ; une chaîne vide marque une respiration typographique. */
  body: string[];
}

/** Une ligne de parcours (formation, résidence, enseignement). */
export interface LigneParcours {
  /** Période affichée telle quelle (« 2023 — 2025 »). */
  periode: string;
  intitule: string;
  detail: string;
}

/** Une mention dans la presse. */
export interface MentionPresse {
  titre: string;
  support: string;
  date: string;
}
