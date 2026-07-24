/* =========================================================================
   Limitation de débit du point d'écriture public.

   Deux compteurs distincts, et c'est tout l'intérêt de ce module.

   Un premier compteur plafonne les **écritures** effectives : il n'est
   incrémenté qu'après une création réussie. Une requête rejetée en
   validation n'écrit rien, elle ne consomme donc pas ce quota — un
   utilisateur qui se trompe cinq fois de saisie ne doit pas se voir
   refuser son sixième envoi, pourtant valide (correction de l'écart n° 2
   du dossier, §9.4).

   Un second compteur, plus permissif, plafonne le nombre total de
   **requêtes** : il conserve la protection contre un envoi massif de
   requêtes invalides, que le premier compteur ne verrait pas.

   L'état est conservé en mémoire, ce qui suffit pour un site à instance
   unique. Une mise à l'échelle horizontale imposerait un stockage partagé.
   ========================================================================= */

/** Quotas par adresse IP et par fenêtre. */
export const QUOTAS = {
  /** Créations effectivement enregistrées. */
  ecritures: 5,
  /** Requêtes reçues, valides ou non. */
  requetes: 30,
} as const;

/** Durée de la fenêtre glissante, en millisecondes (15 minutes). */
export const FENETRE_MS = 15 * 60 * 1000;

interface Compteurs {
  ecritures: number[];
  requetes: number[];
}

export type Motif = 'ecritures' | 'requetes';

export interface Verdict {
  autorise: boolean;
  motif?: Motif;
}

/**
 * Limiteur à fenêtre glissante. Chaque instance est indépendante, ce qui
 * permet de la réinitialiser entre deux tests.
 */
export class Limiteur {
  private readonly parIp = new Map<string, Compteurs>();

  constructor(
    private readonly quotas: { ecritures: number; requetes: number } = QUOTAS,
    private readonly fenetreMs: number = FENETRE_MS,
  ) {}

  /** Récupère les compteurs d'une IP, purgés des horodatages expirés. */
  private compteurs(ip: string, maintenant: number): Compteurs {
    const limite = maintenant - this.fenetreMs;
    const actuels = this.parIp.get(ip) ?? { ecritures: [], requetes: [] };
    const purges: Compteurs = {
      ecritures: actuels.ecritures.filter((t) => t > limite),
      requetes: actuels.requetes.filter((t) => t > limite),
    };
    this.parIp.set(ip, purges);
    return purges;
  }

  /**
   * Enregistre une requête reçue et indique si elle peut être traitée.
   * Appelé au tout début du traitement, avant même la validation.
   */
  enregistrerRequete(ip: string, maintenant: number = Date.now()): Verdict {
    const c = this.compteurs(ip, maintenant);
    if (c.requetes.length >= this.quotas.requetes) {
      return { autorise: false, motif: 'requetes' };
    }
    c.requetes.push(maintenant);
    return { autorise: true };
  }

  /**
   * Indique si une écriture supplémentaire est permise, sans rien
   * consommer. La consommation n'a lieu qu'après une création réussie.
   */
  peutEcrire(ip: string, maintenant: number = Date.now()): Verdict {
    const c = this.compteurs(ip, maintenant);
    if (c.ecritures.length >= this.quotas.ecritures) {
      return { autorise: false, motif: 'ecritures' };
    }
    return { autorise: true };
  }

  /** Enregistre une écriture réussie. */
  enregistrerEcriture(ip: string, maintenant: number = Date.now()): void {
    this.compteurs(ip, maintenant).ecritures.push(maintenant);
  }

  /** Vide l'état — utile en test et lors d'un redémarrage à chaud. */
  reinitialiser(): void {
    this.parIp.clear();
  }
}

/** Instance partagée par le contrôleur. */
export const limiteur = new Limiteur();
