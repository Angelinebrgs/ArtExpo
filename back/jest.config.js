/**
 * Configuration Jest — tests unitaires du back.
 *
 * La portée est volontairement restreinte aux modules purs
 * (assainissement, limitation de débit) : ils concentrent la logique
 * métier et n'ont besoin ni de Strapi ni d'une base de données.
 *
 * Le contrôleur, lui, relève des tests d'intégration (Supertest), qui
 * traversent la pile complète.
 *
 * Une configuration TypeScript dédiée est utilisée, afin de ne pas
 * interférer avec celle du projet Strapi.
 */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },
  collectCoverageFrom: ['src/api/**/services/*.ts'],
  coverageThreshold: {
    global: { branches: 70, functions: 70, lines: 70, statements: 70 },
  },
};
