/* =========================================================================
   Règles de validation du formulaire de contact (§7.1.2).

   Cette validation sert le confort de l'utilisateur : elle donne un retour
   immédiat, sans aller-retour réseau. Elle ne protège rien — un appel direct
   à l'API ne passe jamais par le formulaire — et double donc, sans la
   remplacer, la validation serveur qui, elle, assure la sécurité.
   ========================================================================= */

import type { Champs } from '../types';

const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Retourne les messages d'erreur par champ. Un objet vide vaut « saisie valide ». */
export function valider(c: Champs): Partial<Champs> {
  const e: Partial<Champs> = {};
  if (c.name.trim().length < 2) e.name = 'Indiquez votre nom.';
  if (!RE_EMAIL.test(c.email)) e.email = 'Adresse e-mail invalide.';
  if (c.body.trim().length < 10) e.body = 'Votre message est trop court.';
  return e;
}
