/* =========================================================================
   Types du contenu éditorial (écrits, à propos).

   Les écrits et la page « À propos » ne sont pas encore gérés par le CMS :
   ils n'ont pas d'entité Strapi correspondante. Leur contenu vit donc dans
   `src/content/`,
   mais il est typé et façonné comme une réponse d'API. Le jour où les
   entités sont créées côté back, seul le module de contenu est remplacé par
   un appel à `services/api.ts` : les composants d'affichage ne changent pas.
   ========================================================================= */

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
