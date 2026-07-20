import { useState } from 'react';

import { ApiError, envoyerMessage } from '../services/api';
import { valider } from '../services/validation';
import type { Champs } from '../types';
import Reveal from './ui/Reveal';

/**
 * Formulaire de contact (§7.1.2).
 *
 * La validation est effectuée deux fois, et ce n'est pas une redondance :
 * la validation navigateur sert le confort de l'utilisateur (retour
 * immédiat, sans aller-retour réseau), tandis que la validation serveur
 * assure la sécurité. La première est trivialement contournable — un appel
 * direct à l'API ne passe jamais par le formulaire — et ne protège rien.
 */

type Etat = 'saisie' | 'envoi' | 'succes';

export default function ContactForm() {
  const [champs, setChamps] = useState<Champs>({ name: '', email: '', body: '' });
  const [erreurs, setErreurs] = useState<Partial<Champs>>({});
  const [erreurServeur, setErreurServeur] = useState<string | null>(null);
  const [etat, setEtat] = useState<Etat>('saisie');
  // Pot de miel : un champ invisible que seuls les robots remplissent.
  const [potDeMiel, setPotDeMiel] = useState('');

  function modifier(champ: keyof Champs, valeur: string) {
    setChamps((c) => ({ ...c, [champ]: valeur }));
  }

  async function soumettre(ev: React.FormEvent) {
    ev.preventDefault();
    const trouvees = valider(champs);
    setErreurs(trouvees);
    if (Object.keys(trouvees).length > 0) return;

    setEtat('envoi');
    setErreurServeur(null);
    try {
      await envoyerMessage({ ...champs, website: potDeMiel });
      setEtat('succes');
    } catch (e) {
      setEtat('saisie');
      if (e instanceof ApiError) {
        // Le serveur peut invalider des champs que le client a laissé passer.
        setErreurs(e.champs as Partial<Champs>);
        setErreurServeur(Object.keys(e.champs).length ? null : e.message);
      } else {
        setErreurServeur('Envoi impossible. Réessayez plus tard.');
      }
    }
  }

  if (etat === 'succes') {
    return (
      <div className="view-enter container" style={{ padding: '120px 48px', maxWidth: 720 }}>
        <div className="small-cap" style={{ color: 'var(--cyan-wash)' }}>Contact</div>
        <h2
          style={{
            fontFamily: 'var(--serif)',
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 'clamp(36px, 5vw, 56px)',
            color: 'var(--cyan-deep)',
            margin: '12px 0 20px',
          }}
        >
          Message envoyé
        </h2>
        <p role="status" style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--ink)' }}>
          Merci, votre message est bien parti. Une réponse vous parviendra depuis l'atelier.
        </p>
      </div>
    );
  }

  return (
    <div className="view-enter container" style={{ padding: '80px 48px', maxWidth: 720 }}>
      <Reveal>
        <div className="small-cap" style={{ color: 'var(--cyan-wash)' }}>Contact</div>
        <h2
          style={{
            fontFamily: 'var(--serif)',
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 'clamp(36px, 5vw, 56px)',
            color: 'var(--cyan-deep)',
            margin: '12px 0 40px',
          }}
        >
          Écrire à l'atelier
        </h2>
      </Reveal>

      <form onSubmit={soumettre} noValidate>
        <div style={{ marginBottom: 32 }}>
          <label className="small-cap" htmlFor="name">Nom</label>
          <input
            id="name"
            name="name"
            className="field"
            value={champs.name}
            onChange={(e) => modifier('name', e.target.value)}
            aria-invalid={!!erreurs.name}
            aria-describedby={erreurs.name ? 'err-name' : undefined}
            placeholder="Votre nom"
          />
          {erreurs.name && (
            <p id="err-name" role="alert" className="legend" style={{ color: 'var(--cyan-deep)', marginTop: 8 }}>
              {erreurs.name}
            </p>
          )}
        </div>

        <div style={{ marginBottom: 32 }}>
          <label className="small-cap" htmlFor="email">E-mail</label>
          <input
            id="email"
            name="email"
            type="email"
            className="field"
            value={champs.email}
            onChange={(e) => modifier('email', e.target.value)}
            aria-invalid={!!erreurs.email}
            aria-describedby={erreurs.email ? 'err-email' : undefined}
            placeholder="vous@exemple.fr"
          />
          {erreurs.email && (
            <p id="err-email" role="alert" className="legend" style={{ color: 'var(--cyan-deep)', marginTop: 8 }}>
              {erreurs.email}
            </p>
          )}
        </div>

        <div style={{ marginBottom: 32 }}>
          <label className="small-cap" htmlFor="body">Message</label>
          <textarea
            id="body"
            name="body"
            className="field"
            value={champs.body}
            onChange={(e) => modifier('body', e.target.value)}
            aria-invalid={!!erreurs.body}
            aria-describedby={erreurs.body ? 'err-body' : undefined}
            placeholder="Votre message"
          />
          {erreurs.body && (
            <p id="err-body" role="alert" className="legend" style={{ color: 'var(--cyan-deep)', marginTop: 8 }}>
              {erreurs.body}
            </p>
          )}
        </div>

        {/* Pot de miel : masqué aux humains, laissé accessible aux robots. */}
        <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }}>
          <label htmlFor="website">Site web</label>
          <input
            id="website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={potDeMiel}
            onChange={(e) => setPotDeMiel(e.target.value)}
          />
        </div>

        {erreurServeur && (
          <p role="alert" className="legend" style={{ color: 'var(--cyan-deep)', marginBottom: 24 }}>
            {erreurServeur}
          </p>
        )}

        <button type="submit" className="btn-ink" disabled={etat === 'envoi'}>
          {etat === 'envoi' ? 'Envoi…' : 'Envoyer'}
        </button>
      </form>
    </div>
  );
}
