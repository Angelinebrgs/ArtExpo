import { FENETRE_MS, Limiteur, QUOTAS } from '../../src/api/message/services/limiteur';

/**
 * Tests unitaires de la limitation de débit (§9.2).
 *
 * L'horloge est injectée à chaque appel plutôt que simulée globalement :
 * les scénarios temporels restent ainsi lisibles et déterministes.
 */

const IP = '192.0.2.10';
const AUTRE_IP = '192.0.2.20';

let limiteur: Limiteur;

beforeEach(() => {
  limiteur = new Limiteur();
});

describe('quota d’écritures', () => {
  it('autorise une écriture tant que le quota n’est pas atteint', () => {
    expect(limiteur.peutEcrire(IP).autorise).toBe(true);
  });

  it('refuse au-delà du quota', () => {
    for (let i = 0; i < QUOTAS.ecritures; i += 1) {
      expect(limiteur.peutEcrire(IP).autorise).toBe(true);
      limiteur.enregistrerEcriture(IP);
    }

    const verdict = limiteur.peutEcrire(IP);
    expect(verdict.autorise).toBe(false);
    expect(verdict.motif).toBe('ecritures');
  });

  it('ne consomme rien lors d’une simple vérification', () => {
    // Vérifier dix fois ne doit pas épuiser un quota de cinq.
    for (let i = 0; i < 10; i += 1) limiteur.peutEcrire(IP);

    expect(limiteur.peutEcrire(IP).autorise).toBe(true);
  });

  it('compte séparément chaque adresse IP', () => {
    for (let i = 0; i < QUOTAS.ecritures; i += 1) limiteur.enregistrerEcriture(IP);

    expect(limiteur.peutEcrire(IP).autorise).toBe(false);
    expect(limiteur.peutEcrire(AUTRE_IP).autorise).toBe(true);
  });
});

describe('écart n° 2 : le quota d’écritures n’est pas consommé par les échecs', () => {
  it('accepte un envoi valide après plusieurs tentatives invalides', () => {
    const t = Date.now();

    // Cinq requêtes rejetées en validation : elles sont comptées comme
    // requêtes, mais n'écrivent rien, donc ne consomment aucune écriture.
    for (let i = 0; i < 5; i += 1) {
      expect(limiteur.enregistrerRequete(IP, t).autorise).toBe(true);
    }

    // Le sixième envoi, valide, doit être accepté.
    expect(limiteur.enregistrerRequete(IP, t).autorise).toBe(true);
    expect(limiteur.peutEcrire(IP, t).autorise).toBe(true);
  });

  it('épuise le quota uniquement par des écritures réussies', () => {
    const t = Date.now();
    for (let i = 0; i < QUOTAS.ecritures; i += 1) {
      limiteur.enregistrerRequete(IP, t);
      limiteur.enregistrerEcriture(IP, t);
    }

    expect(limiteur.peutEcrire(IP, t).autorise).toBe(false);
  });
});

describe('quota global de requêtes', () => {
  it('reste plus permissif que le quota d’écritures', () => {
    expect(QUOTAS.requetes).toBeGreaterThan(QUOTAS.ecritures);
  });

  it('refuse au-delà du plafond, même sans aucune écriture', () => {
    const t = Date.now();
    for (let i = 0; i < QUOTAS.requetes; i += 1) {
      expect(limiteur.enregistrerRequete(IP, t).autorise).toBe(true);
    }

    const verdict = limiteur.enregistrerRequete(IP, t);
    expect(verdict.autorise).toBe(false);
    expect(verdict.motif).toBe('requetes');
  });
});

describe('fenêtre glissante', () => {
  it('libère le quota une fois la fenêtre écoulée', () => {
    const t = Date.now();
    for (let i = 0; i < QUOTAS.ecritures; i += 1) limiteur.enregistrerEcriture(IP, t);
    expect(limiteur.peutEcrire(IP, t).autorise).toBe(false);

    // Juste après l'expiration de la fenêtre.
    expect(limiteur.peutEcrire(IP, t + FENETRE_MS + 1).autorise).toBe(true);
  });

  it('maintient le refus tant que la fenêtre court', () => {
    const t = Date.now();
    for (let i = 0; i < QUOTAS.ecritures; i += 1) limiteur.enregistrerEcriture(IP, t);

    expect(limiteur.peutEcrire(IP, t + FENETRE_MS - 1000).autorise).toBe(false);
  });

  it('n’oublie que les horodatages expirés', () => {
    const t = Date.now();
    // Quatre écritures anciennes, une récente.
    for (let i = 0; i < 4; i += 1) limiteur.enregistrerEcriture(IP, t);
    limiteur.enregistrerEcriture(IP, t + FENETRE_MS);

    // Les quatre premières ont expiré : il reste de la place.
    expect(limiteur.peutEcrire(IP, t + FENETRE_MS + 1).autorise).toBe(true);
  });
});

describe('paramétrage et réinitialisation', () => {
  it('accepte des quotas personnalisés', () => {
    const strict = new Limiteur({ ecritures: 1, requetes: 2 });
    strict.enregistrerEcriture(IP);

    expect(strict.peutEcrire(IP).autorise).toBe(false);
  });

  it('vide entièrement son état', () => {
    for (let i = 0; i < QUOTAS.ecritures; i += 1) limiteur.enregistrerEcriture(IP);
    expect(limiteur.peutEcrire(IP).autorise).toBe(false);

    limiteur.reinitialiser();

    expect(limiteur.peutEcrire(IP).autorise).toBe(true);
  });
});
