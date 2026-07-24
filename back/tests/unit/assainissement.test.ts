import {
  LIMITES,
  MINIMA,
  assainir,
  estRobot,
  normaliser,
  validerMessage,
} from '../../src/api/message/services/assainissement';

/**
 * Tests unitaires de l'assainissement et de la validation des messages
 * (§9.2 — point d'écriture public).
 */

/** Construit une charge utile valide, éventuellement altérée. */
function corps(partiel: Record<string, unknown> = {}) {
  return {
    name: 'Ada Lovelace',
    email: 'ada@exemple.fr',
    body: 'Bonjour, je souhaite exposer vos œuvres.',
    ...partiel,
  };
}

describe('normaliser', () => {
  it('retire les espaces de bordure', () => {
    expect(normaliser('  Ada  ')).toBe('Ada');
  });

  it('convertit les valeurs absentes en chaîne vide', () => {
    expect(normaliser(null)).toBe('');
    expect(normaliser(undefined)).toBe('');
  });

  it('accepte une valeur non textuelle sans lever d’erreur', () => {
    expect(normaliser(42)).toBe('42');
  });
});

describe('assainir', () => {
  it('neutralise les chevrons pour empêcher une injection HTML', () => {
    expect(assainir('<script>alert(1)</script>', 100)).toBe('scriptalert(1)/script');
  });

  it('borne la longueur en ultime garde-fou', () => {
    expect(assainir('a'.repeat(50), 10)).toHaveLength(10);
  });

  it('laisse intacte une valeur déjà acceptable', () => {
    expect(assainir('Ada Lovelace', 160)).toBe('Ada Lovelace');
  });
});

describe('validerMessage — champs valides', () => {
  it('n’émet aucune erreur sur une saisie correcte', () => {
    expect(validerMessage(corps()).erreurs).toEqual({});
  });

  it('normalise l’adresse e-mail en minuscules', () => {
    expect(validerMessage(corps({ email: 'Ada@Exemple.FR' })).valeurs.email).toBe(
      'ada@exemple.fr',
    );
  });

  it('retourne des valeurs assainies', () => {
    const { valeurs } = validerMessage(
      corps({ name: '<b>Ada</b>', body: 'Bonjour <script>alert(1)</script> à vous.' }),
    );

    expect(valeurs.name).toBe('bAda/b');
    expect(valeurs.body).not.toContain('<');
    expect(valeurs.body).not.toContain('>');
  });
});

describe('validerMessage — champs refusés', () => {
  it('refuse un nom trop court', () => {
    expect(validerMessage(corps({ name: 'A' })).erreurs.name).toContain(
      `au moins ${MINIMA.name}`,
    );
  });

  it('refuse une adresse e-mail malformée', () => {
    expect(validerMessage(corps({ email: 'pas-un-email' })).erreurs.email).toBe(
      'Adresse e-mail invalide.',
    );
  });

  it('refuse un message trop court', () => {
    expect(validerMessage(corps({ body: 'court' })).erreurs.body).toContain(
      `au moins ${MINIMA.body}`,
    );
  });

  it('refuse des champs absents', () => {
    const { erreurs } = validerMessage({});
    expect(Object.keys(erreurs).sort()).toEqual(['body', 'email', 'name']);
  });

  it('cumule les erreurs de plusieurs champs', () => {
    const { erreurs } = validerMessage(corps({ name: 'A', email: 'x' }));
    expect(erreurs).toHaveProperty('name');
    expect(erreurs).toHaveProperty('email');
    expect(erreurs).not.toHaveProperty('body');
  });
});

describe('validerMessage — écart n° 1 : plus de troncature silencieuse', () => {
  it('refuse un message dépassant la longueur maximale, au lieu de le tronquer', () => {
    // Le cas de test n° 8 du dossier : 2 500 caractères doivent produire
    // un refus explicite, et non une confirmation d'envoi trompeuse.
    const { erreurs } = validerMessage(corps({ body: 'a'.repeat(2500) }));

    expect(erreurs.body).toContain(`dépasser ${LIMITES.body}`);
  });

  it('accepte un message exactement à la longueur maximale', () => {
    expect(validerMessage(corps({ body: 'a'.repeat(LIMITES.body) })).erreurs).toEqual({});
  });

  it('refuse dès le premier caractère excédentaire', () => {
    const { erreurs } = validerMessage(corps({ body: 'a'.repeat(LIMITES.body + 1) }));
    expect(erreurs).toHaveProperty('body');
  });

  it('refuse un nom trop long', () => {
    const { erreurs } = validerMessage(corps({ name: 'a'.repeat(LIMITES.name + 1) }));
    expect(erreurs.name).toContain(`dépasser ${LIMITES.name}`);
  });

  it('juge la longueur sur la valeur brute, avant assainissement', () => {
    // Sans cette précaution, une valeur trop longue pourrait passer la
    // validation après avoir été raccourcie par le retrait des chevrons.
    const trop = '<'.repeat(600) + 'a'.repeat(LIMITES.body);
    expect(validerMessage(corps({ body: trop })).erreurs).toHaveProperty('body');
  });
});

describe('estRobot — pot de miel', () => {
  it('détecte un champ invisible rempli', () => {
    expect(estRobot(corps({ website: 'http://spam.example' }))).toBe(true);
  });

  it('ignore un champ vide ou absent', () => {
    expect(estRobot(corps())).toBe(false);
    expect(estRobot(corps({ website: '' }))).toBe(false);
    expect(estRobot(corps({ website: '   ' }))).toBe(false);
  });
});
