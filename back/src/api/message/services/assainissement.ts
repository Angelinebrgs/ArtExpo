/* =========================================================================
   Assainissement et validation des messages de contact.

   Le formulaire de contact est le seul point d'écriture ouvert au public :
   c'est la principale surface d'attaque de l'application (§7.2.2).

   Ce module ne contient que des fonctions pures, sans dépendance à Strapi
   ni au contexte HTTP : elles sont donc testables unitairement, et le
   contrôleur se limite à les orchestrer.
   ========================================================================= */

/** Longueurs maximales acceptées, par champ. */
export const LIMITES = {
  name: 160,
  email: 254, // maximum d'une adresse selon la RFC 5321
  body: 2000,
} as const;

/** Longueurs minimales exigées. */
export const MINIMA = {
  name: 2,
  body: 10,
} as const;

export const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Champs attendus dans la charge utile. */
export interface ChampsMessage {
  name: string;
  email: string;
  body: string;
}

export interface Resultat {
  erreurs: Record<string, string>;
  valeurs: ChampsMessage;
}

/**
 * Normalise une valeur brute sans rien lui retirer d'autre que ses espaces
 * de bordure. La longueur est jugée sur cette valeur : c'est elle que
 * l'utilisateur a réellement saisie.
 */
export function normaliser(valeur: unknown): string {
  return String(valeur ?? '').trim();
}

/**
 * Neutralise les chevrons pour éviter toute injection HTML en aval, et
 * borne la longueur en ultime garde-fou.
 *
 * La troncature ne s'applique qu'à des valeurs dont la longueur a déjà été
 * jugée acceptable : elle ne peut donc plus masquer la règle métier
 * (correction de l'écart n° 1 du dossier, §9.4).
 */
export function assainir(valeur: unknown, max: number): string {
  return normaliser(valeur)
    .replace(/[<>]/g, '')
    .slice(0, max);
}

/**
 * Valide la charge utile et retourne les valeurs assainies.
 *
 * L'ordre importe : la longueur est vérifiée sur la valeur brute, avant
 * tout assainissement. Un dépassement produit une erreur explicite plutôt
 * qu'une troncature silencieuse — une donnée ne doit jamais être modifiée
 * en silence entre ce que l'utilisateur envoie et ce qui est stocké.
 */
export function validerMessage(corps: Record<string, unknown>): Resultat {
  const erreurs: Record<string, string> = {};

  const nomBrut = normaliser(corps.name);
  const emailBrut = normaliser(corps.email).toLowerCase();
  const corpsBrut = normaliser(corps.body);

  if (nomBrut.length < MINIMA.name) {
    erreurs.name = `Le nom doit comporter au moins ${MINIMA.name} caractères.`;
  } else if (nomBrut.length > LIMITES.name) {
    erreurs.name = `Le nom ne peut pas dépasser ${LIMITES.name} caractères.`;
  }

  if (!RE_EMAIL.test(emailBrut)) {
    erreurs.email = 'Adresse e-mail invalide.';
  } else if (emailBrut.length > LIMITES.email) {
    erreurs.email = `L'adresse ne peut pas dépasser ${LIMITES.email} caractères.`;
  }

  if (corpsBrut.length < MINIMA.body) {
    erreurs.body = `Le message doit comporter au moins ${MINIMA.body} caractères.`;
  } else if (corpsBrut.length > LIMITES.body) {
    erreurs.body = `Le message ne peut pas dépasser ${LIMITES.body} caractères.`;
  }

  return {
    erreurs,
    valeurs: {
      name: assainir(nomBrut, LIMITES.name),
      email: assainir(emailBrut, LIMITES.email),
      body: assainir(corpsBrut, LIMITES.body),
    },
  };
}

/**
 * Détecte le pot de miel : un champ invisible à l'écran et retiré du
 * parcours clavier, qu'un humain ne peut pas remplir.
 */
export function estRobot(corps: Record<string, unknown>): boolean {
  return normaliser(corps.website).length > 0;
}
