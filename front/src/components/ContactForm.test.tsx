import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ContactForm from './ContactForm';
import { ApiError } from '../services/api';

/**
 * Tests unitaires du formulaire de contact (§9.2).
 * Le client d'accès aux données est simulé : on teste le comportement du
 * composant, pas le réseau.
 */

vi.mock('../services/api', async () => {
  const reel = await vi.importActual<typeof import('../services/api')>('../services/api');
  return { ...reel, envoyerMessage: vi.fn() };
});

const { envoyerMessage } = await import('../services/api');
const envoyerMock = vi.mocked(envoyerMessage);

/** Remplit le formulaire avec un jeu de valeurs. */
async function remplir(
  valeurs: { nom?: string; email?: string; message?: string } = {},
) {
  const user = userEvent.setup();
  const { nom = 'Ada Lovelace', email = 'ada@exemple.fr', message = 'Bonjour, je souhaite exposer.' } = valeurs;

  if (nom) await user.type(screen.getByLabelText('Nom'), nom);
  if (email) await user.type(screen.getByLabelText('E-mail'), email);
  if (message) await user.type(screen.getByLabelText('Message'), message);

  return user;
}

beforeEach(() => {
  envoyerMock.mockReset();
});

describe('ContactForm — validation côté client', () => {
  it('affiche une erreur et n’appelle pas le réseau si l’e-mail est invalide', async () => {
    render(<ContactForm />);
    const user = await remplir({ email: 'pas-un-email' });

    await user.click(screen.getByRole('button', { name: 'Envoyer' }));

    expect(await screen.findByText('Adresse e-mail invalide.')).toBeInTheDocument();
    // La validation navigateur évite un aller-retour réseau inutile.
    expect(envoyerMock).not.toHaveBeenCalled();
  });

  it('affiche l’erreur au niveau du champ message quand il est trop court', async () => {
    render(<ContactForm />);
    const user = await remplir({ message: 'court' });

    await user.click(screen.getByRole('button', { name: 'Envoyer' }));

    const champ = screen.getByLabelText('Message');
    expect(await screen.findByText('Votre message est trop court.')).toBeInTheDocument();
    // L'erreur est rattachée au champ, et non affichée globalement.
    expect(champ).toHaveAttribute('aria-invalid', 'true');
    expect(champ).toHaveAccessibleDescription('Votre message est trop court.');
    expect(envoyerMock).not.toHaveBeenCalled();
  });
});

describe('ContactForm — envoi', () => {
  it('affiche une confirmation après un envoi valide', async () => {
    envoyerMock.mockResolvedValue({ data: { id: 1 } });
    render(<ContactForm />);
    const user = await remplir();

    await user.click(screen.getByRole('button', { name: 'Envoyer' }));

    expect(await screen.findByText('Message envoyé')).toBeInTheDocument();
    expect(envoyerMock).toHaveBeenCalledTimes(1);
  });

  it('transmet les champs saisis et le pot de miel vide', async () => {
    envoyerMock.mockResolvedValue({ data: { id: 1 } });
    render(<ContactForm />);
    const user = await remplir();

    await user.click(screen.getByRole('button', { name: 'Envoyer' }));

    await waitFor(() => expect(envoyerMock).toHaveBeenCalled());
    expect(envoyerMock).toHaveBeenCalledWith({
      name: 'Ada Lovelace',
      email: 'ada@exemple.fr',
      body: 'Bonjour, je souhaite exposer.',
      website: '',
    });
  });

  it('réaffiche sur le champ concerné une erreur renvoyée par le serveur', async () => {
    // Le serveur peut invalider un champ que le client a laissé passer.
    envoyerMock.mockRejectedValue(
      new ApiError('Validation refusée.', 400, { email: 'Adresse e-mail déjà signalée.' }),
    );
    render(<ContactForm />);
    const user = await remplir();

    await user.click(screen.getByRole('button', { name: 'Envoyer' }));

    expect(await screen.findByText('Adresse e-mail déjà signalée.')).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail')).toHaveAttribute('aria-invalid', 'true');
    // Aucune confirmation ne doit apparaître.
    expect(screen.queryByText('Message envoyé')).not.toBeInTheDocument();
  });

  it('affiche un message global quand l’erreur serveur ne vise aucun champ', async () => {
    envoyerMock.mockRejectedValue(new ApiError('Serveur injoignable.', 0));
    render(<ContactForm />);
    const user = await remplir();

    await user.click(screen.getByRole('button', { name: 'Envoyer' }));

    expect(await screen.findByText('Serveur injoignable.')).toBeInTheDocument();
  });

  it('affiche un message de repli sur une erreur inattendue', async () => {
    envoyerMock.mockRejectedValue(new Error('boum'));
    render(<ContactForm />);
    const user = await remplir();

    await user.click(screen.getByRole('button', { name: 'Envoyer' }));

    expect(await screen.findByText('Envoi impossible. Réessayez plus tard.')).toBeInTheDocument();
  });

  it('désactive le bouton pendant l’envoi pour empêcher un double envoi', async () => {
    let resoudre: (v: unknown) => void = () => {};
    envoyerMock.mockReturnValue(new Promise((r) => { resoudre = r; }));
    render(<ContactForm />);
    const user = await remplir();

    await user.click(screen.getByRole('button', { name: 'Envoyer' }));

    const bouton = await screen.findByRole('button', { name: 'Envoi…' });
    expect(bouton).toBeDisabled();

    resoudre({ data: { id: 1 } });
    expect(await screen.findByText('Message envoyé')).toBeInTheDocument();
  });
});
