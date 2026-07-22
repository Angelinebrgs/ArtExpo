/**
 * Routeur message — expose les routes REST standard du type de contenu.
 * Sans ce fichier, aucune action n'est liée à une route : le type est
 * chargé mais reste invisible dans l'écran des permissions.
 */
import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::message.message');
