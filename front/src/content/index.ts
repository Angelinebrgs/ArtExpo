/* =========================================================================
   Contenu éditorial du site.

   À remplacer par des appels à l'API le jour où les entités Strapi
   correspondantes existent (voir src/content/types.ts).
   ========================================================================= */

import type { Ecrit, LigneParcours, MentionPresse } from './types';

export const ECRITS: Ecrit[] = [
  {
    id: 'pourquoi-tu-hurles-extrait',
    title: 'Pourquoi tu hurles ? <3',
    sub: 'Extrait — fragment 12',
    year: 2025,
    body: [
      "On ne parle pas. On respire l'un en face de l'autre comme deux animaux qui n'ont pas encore décidé.",
      "Tu dis : « pourquoi tu hurles ? » avec un cœur à la fin, comme si ça pouvait éteindre quelque chose. Mais ce n'est pas un cri. C'est ce qui reste après le cri. C'est le vide qui se remplit doucement de sel.",
    ],
  },
  {
    id: 'lavoir-et-la-menthe-extrait',
    title: 'Le Lavoir et la Menthe',
    sub: 'Extrait — notes de septembre',
    year: 2024,
    body: [
      "Le lavoir est fermé depuis 1972. Il reste un filet d'eau qui passe sous une pierre, et la pierre est lisse comme une joue.",
      "Je mets l'hydrophone là-dedans. Ça fait un son qui ressemble à un piano qu'on aurait noyé. Je rentre chez moi avec la menthe sur les doigts.",
    ],
  },
  {
    id: 'reverdie-poeme',
    title: 'Reverdie',
    sub: 'Poème inédit',
    year: 2024,
    body: [
      'tu poses la feuille',
      'sur le creux du ventre',
      'le soleil fait le reste',
      '',
      'dans une heure',
      'il y aura un bleu',
      'qui ne sera pas le ciel',
    ],
  },
  {
    id: 'carnet-allier-extrait',
    title: "Carnet de l'Allier",
    sub: 'Page 47 — Brioude',
    year: 2023,
    body: [
      "Une vieille femme me dit, sur le pont : « ma mère lavait là, en bas, on entendait les bras taper l'eau jusqu'à la place du marché ». Je note. Je ne sais pas encore que je vais en faire un son.",
    ],
  },
];

/** Texte de présentation de la page « À propos ». */
export const BIOGRAPHIE: string[] = [
  "Née en 1999 à Aubenas. Vit et travaille à Clermont-Ferrand, au bord de l'Allier. Sa pratique explore la rencontre du corps et du lieu comme écriture plastique — performance, son, eau, cyanotype, écriture poétique.",
  "Diplômée du DNSEP de l'ESACM en 2025, avec les félicitations du jury, elle développe un travail attentif aux temps lents, aux gestes domestiques, et à la manière dont un lieu s'imprime sur la peau et sur le tissu.",
  "Son travail a été présenté au Creux de l'Enfer (Thiers), à La Tôlerie (Clermont), au Festival Hors-Champs (Vichy), et en édition auto-publiée.",
];

export const FORMATIONS: LigneParcours[] = [
  { periode: '2023 — 2025', intitule: 'DNSEP Art', detail: "École Supérieure d'Art de Clermont Métropole (ESACM) — mention félicitations du jury" },
  { periode: '2020 — 2023', intitule: 'DNA Art', detail: 'ESACM, Clermont-Ferrand' },
  { periode: '2019 — 2020', intitule: 'Année préparatoire', detail: 'Beaux-Arts de Saint-Étienne' },
];

export const RESIDENCES: LigneParcours[] = [
  { periode: '2024', intitule: 'Maison de la Rivière, Brioude', detail: "6 semaines — Carnet de l'Allier" },
  { periode: '2023', intitule: "Le Creux de l'Enfer, Thiers", detail: 'Atelier-recherche son & matière, 4 semaines' },
  { periode: '2022', intitule: 'Festival Hors-Champs, Vichy', detail: 'Production déléguée, 2 semaines' },
];

export const ENSEIGNEMENT: LigneParcours[] = [
  { periode: '2025', intitule: 'Atelier cyanotype', detail: 'Médiathèque de Riom — public ados' },
  { periode: '2024', intitule: 'Workshop écriture & son', detail: 'ESACM, étudiants 2e année' },
];

export const PRESSE: MentionPresse[] = [
  { titre: 'Une artiste de la lenteur', support: 'La Montagne', date: 'oct. 2025' },
  { titre: 'Le bleu comme matière', support: 'Possible Magazine', date: 'mars 2025' },
  { titre: "Sons d'eau dormante", support: 'Hémisphère son', date: 'oct. 2024' },
];

/** Adresse de contact publiée sur le site. */
export const COURRIEL = 'atelier@mailyss-borges.fr';
