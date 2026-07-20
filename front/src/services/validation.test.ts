import { describe, expect, it } from 'vitest';

import { valider } from './validation';

/**
 * Tests unitaires des règles de validation côté client (§9.2).
 */

describe('valider — règles de validation côté client', () => {
  it('exige un nom d’au moins deux caractères', () => {
    expect(valider({ name: 'A', email: 'ada@exemple.fr', body: 'Un message assez long.' }))
      .toHaveProperty('name', 'Indiquez votre nom.');
  });

  it('refuse une adresse e-mail malformée', () => {
    expect(valider({ name: 'Ada', email: 'pas-un-email', body: 'Un message assez long.' }))
      .toHaveProperty('email', 'Adresse e-mail invalide.');
  });

  it('refuse un message de moins de dix caractères', () => {
    expect(valider({ name: 'Ada', email: 'ada@exemple.fr', body: 'court' }))
      .toHaveProperty('body', 'Votre message est trop court.');
  });

  it('n’émet aucune erreur sur une saisie valide', () => {
    expect(valider({ name: 'Ada', email: 'ada@exemple.fr', body: 'Bonjour, je souhaite exposer.' }))
      .toEqual({});
  });
});
