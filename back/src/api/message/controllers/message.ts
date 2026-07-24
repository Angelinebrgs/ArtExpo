/**
 * Contrôleur « Message » — validation côté serveur (§7.2.2).
 *
 * Le formulaire de contact est le seul point d'écriture ouvert au public.
 * Quatre mesures y sont appliquées : revalidation et bornage des entrées,
 * neutralisation des chevrons, statut imposé par le serveur, et pot de
 * miel contre les robots.
 *
 * Le contrôleur n'implémente aucune de ces règles lui-même : il orchestre
 * des modules purs, testables indépendamment du contexte HTTP.
 */
import { factories } from '@strapi/strapi';

import { estRobot, validerMessage } from '../services/assainissement';
import { limiteur } from '../services/limiteur';

/**
 * Écrit la réponse directement dans le contexte.
 *
 * Les raccourcis du type `ctx.created` ou `ctx.tooManyRequests` ne sont pas
 * garantis d'une version à l'autre, alors que `status` et `body` le sont
 * toujours : la réponse est donc composée explicitement.
 */
function repondre(ctx: any, status: number, body: unknown) {
  ctx.status = status;
  ctx.body = body;
  return ctx.body;
}

export default factories.createCoreController('api::message.message', ({ strapi }: any) => {
  // Trace de chargement : permet de vérifier dans les journaux que ce
  // contrôleur remplace bien celui d'origine.
  strapi.log.info('[message] contrôleur personnalisé chargé');

  return {
    async create(ctx: any) {
      const corps = (ctx.request.body?.data ?? {}) as Record<string, unknown>;
      const ip = ctx.request.ip ?? 'inconnue';

      // 1. Plafond global de requêtes : protège contre un envoi massif,
      //    y compris de requêtes invalides.
      if (!limiteur.enregistrerRequete(ip).autorise) {
        return repondre(ctx, 429, {
          error: {
            status: 429,
            name: 'TooManyRequests',
            message: 'Trop de requêtes. Réessayez plus tard.',
          },
        });
      }

      // 2. Pot de miel. Un succès simulé est retourné sans rien écrire :
      //    signaler l'échec renseignerait le robot sur l'existence du piège.
      if (estRobot(corps)) {
        return repondre(ctx, 201, { data: { ok: true } });
      }

      // 3. Validation. Une requête rejetée ici n'écrit rien : elle ne
      //    consomme donc pas le quota d'écritures.
      const { erreurs, valeurs } = validerMessage(corps);
      if (Object.keys(erreurs).length > 0) {
        return repondre(ctx, 400, {
          error: {
            status: 400,
            name: 'ValidationError',
            message: 'Validation échouée',
            details: { erreurs },
          },
        });
      }

      // 4. Quota d'écritures, vérifié sans être consommé.
      if (!limiteur.peutEcrire(ip).autorise) {
        return repondre(ctx, 429, {
          error: {
            status: 429,
            name: 'TooManyRequests',
            message: 'Trop de messages envoyés. Réessayez plus tard.',
          },
        });
      }

      // 5. Le statut est imposé par le serveur : un appelant ne peut pas
      //    créer un message déjà marqué « replied » en le glissant dans la
      //    charge utile.
      const message = await strapi.documents('api::message.message').create({
        data: { ...valeurs, status: 'new' },
      });

      // Le quota n'est consommé qu'après une création réussie.
      limiteur.enregistrerEcriture(ip);

      // On ne renvoie pas l'entité complète : l'identifiant interne et les
      // horodatages n'ont aucune utilité pour le client public.
      return repondre(ctx, 201, { data: { ok: true, id: message.documentId } });
    },
  };
});