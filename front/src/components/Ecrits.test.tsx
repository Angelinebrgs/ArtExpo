import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import Ecrits from './Ecrits';
import { ECRITS } from '../content';

describe('Ecrits — sommaire et lecteur', () => {
  it('ouvre le premier texte par défaut, afin de ne jamais afficher une page vide', () => {
    render(<Ecrits />);

    expect(screen.getByRole('heading', { name: ECRITS[0].title, level: 2 })).toBeInTheDocument();
  });

  it('liste tous les textes au sommaire, numérotés', () => {
    render(<Ecrits />);

    expect(screen.getAllByRole('listitem')).toHaveLength(ECRITS.length);
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText(String(ECRITS.length).padStart(2, '0'))).toBeInTheDocument();
  });

  it('affiche le texte sélectionné', async () => {
    render(<Ecrits />);
    const second = ECRITS[1];

    await userEvent.click(screen.getByRole('button', { name: new RegExp(second.title) }));

    expect(screen.getByRole('heading', { name: second.title, level: 2 })).toBeInTheDocument();
    expect(screen.getByText(second.body[0])).toBeInTheDocument();
  });

  it('signale l’entrée active du sommaire de façon accessible', async () => {
    render(<Ecrits />);
    const second = ECRITS[1];

    const bouton = screen.getByRole('button', { name: new RegExp(second.title) });
    expect(bouton).not.toHaveAttribute('aria-current');

    await userEvent.click(bouton);

    expect(bouton).toHaveAttribute('aria-current', 'true');
  });

  it('affiche chaque paragraphe du texte', () => {
    render(<Ecrits />);

    ECRITS[0].body
      .filter(Boolean)
      .forEach((paragraphe) => expect(screen.getByText(paragraphe)).toBeInTheDocument());
  });

  it('rend les respirations d’un poème sans les annoncer comme du texte', async () => {
    render(<Ecrits />);
    // Le poème « Reverdie » contient une ligne vide entre ses deux strophes.
    const poeme = ECRITS.find((t) => t.body.includes(''));
    expect(poeme).toBeDefined();

    await userEvent.click(screen.getByRole('button', { name: new RegExp(poeme!.title) }));

    expect(screen.getByText('tu poses la feuille')).toBeInTheDocument();
    expect(screen.getByText('qui ne sera pas le ciel')).toBeInTheDocument();
  });

  it('rappelle la source du texte affiché', () => {
    render(<Ecrits />);

    expect(
      screen.getByText(`Imprimé dans ${ECRITS[0].title}, ${ECRITS[0].year}`),
    ).toBeInTheDocument();
  });
});
