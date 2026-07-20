import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { ApiError, listerOeuvres, urlMedia } from '../services/api';
import { MEDIUMS, type Medium, type Oeuvre } from '../types';
import Reveal from './ui/Reveal';
import CyanoSlot from './ui/CyanoSlot';

/**
 * Liste des œuvres — gabarit de liste paramétrable (§7.1.1).
 *
 * Trois décisions structurent ce composant :
 *  - il n'appelle jamais `fetch` directement, mais consomme le client
 *    d'accès aux données : il ignore tout du protocole HTTP ;
 *  - les trois états (chargement, erreur, succès) sont traités
 *    explicitement, ainsi que le cas « aucun résultat » ;
 *  - la requête est annulée au démontage grâce à AbortController, afin
 *    qu'une réponse obsolète n'écrase jamais la plus récente.
 *
 * La collection éventuelle est lue dans l'URL (?collection=slug) plutôt que
 * dans un état local : le filtre reste ainsi partageable et navigable avec
 * les boutons précédent/suivant du navigateur.
 */
export default function GalleryList() {
  const [parametres, setParametres] = useSearchParams();
  const collection = parametres.get('collection') ?? '';

  const [oeuvres, setOeuvres] = useState<Oeuvre[]>([]);
  const [medium, setMedium] = useState<'' | Medium>('');
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    const controleur = new AbortController();
    setChargement(true);
    setErreur(null);

    listerOeuvres(
      { medium: medium || undefined, collection: collection || undefined },
      controleur.signal,
    )
      .then((page) => setOeuvres(page.data))
      .catch((e: unknown) => {
        // Une requête annulée (filtre changé avant la fin) n'est pas une erreur.
        if ((e as Error).name === 'AbortError') return;
        setErreur(e instanceof ApiError ? e.message : 'Erreur inattendue.');
      })
      .finally(() => setChargement(false));

    // Annulation : évite qu'une réponse obsolète n'écrase la plus récente.
    return () => controleur.abort();
  }, [medium, collection]);

  /** Retire le filtre de collection sans toucher au reste de l'URL. */
  function retirerCollection() {
    const suivants = new URLSearchParams(parametres);
    suivants.delete('collection');
    setParametres(suivants);
  }

  return (
    <div className="view-enter container" style={{ padding: '80px 48px' }}>
      <Reveal>
        <div className="small-cap" style={{ color: 'var(--cyan-wash)' }}>Œuvres</div>
        <h2
          style={{
            fontFamily: 'var(--serif)',
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 'clamp(40px, 6vw, 64px)',
            color: 'var(--cyan-deep)',
            margin: '12px 0 32px',
          }}
        >
          La collection
        </h2>
      </Reveal>

      {/* Collection active : l'utilisateur doit pouvoir voir d'où vient le
          filtre appliqué, et s'en défaire. */}
      {collection && (
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 20,
            flexWrap: 'wrap',
            marginBottom: 32,
            paddingBottom: 20,
            borderBottom: '1px solid var(--gray-2)',
          }}
        >
          <span className="small-cap" style={{ color: 'var(--terre)' }}>
            Collection · {collection}
          </span>
          <button type="button" className="btn-ghost" onClick={retirerCollection}>
            Retirer le filtre
          </button>
        </div>
      )}

      {/* Filtres par médium */}
      <div className="filtres" role="group" aria-label="Filtrer par médium" style={{ marginBottom: 48 }}>
        {MEDIUMS.map((m) => (
          <button
            key={m.id || 'tout'}
            type="button"
            className={`chip ${medium === m.id ? 'is-on' : ''}`}
            aria-pressed={medium === m.id}
            onClick={() => setMedium(m.id)}
            style={{ marginRight: 28 }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* État : chargement. Un composant qui n'affiche rien pendant qu'il
          charge donne l'impression d'être cassé. */}
      {chargement && (
        <p role="status" className="legend" style={{ color: 'var(--terre)' }}>
          Chargement des œuvres…
        </p>
      )}

      {/* État : erreur */}
      {!chargement && erreur && (
        <p role="alert" className="legend" style={{ color: 'var(--cyan-deep)' }}>
          {erreur}
        </p>
      )}

      {/* État : aucun résultat */}
      {!chargement && !erreur && oeuvres.length === 0 && (
        <p className="legend" style={{ color: 'var(--terre)' }}>
          {collection
            ? 'Aucune œuvre dans cette collection pour ce filtre.'
            : 'Aucune œuvre ne correspond à ce filtre.'}
        </p>
      )}

      {/* État : succès */}
      {!chargement && !erreur && oeuvres.length > 0 && (
        <ul className="grille-oeuvres">
          {oeuvres.map((o, i) => (
            <li key={o.id}>
              <Reveal delay={i * 60}>
                <Link to={`/oeuvres/${o.slug}`} data-hover>
                  {o.img ? (
                    <img
                      src={urlMedia(o.img.formats?.medium?.url ?? o.img.url)}
                      alt={o.img.alternativeText ?? o.name}
                      style={{ width: '100%', aspectRatio: '3 / 4', objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <CyanoSlot caption={o.name} credit={String(o.year)} />
                  )}
                  <div style={{ marginTop: 14 }}>
                    <h3
                      style={{
                        fontFamily: 'var(--serif)',
                        fontStyle: 'italic',
                        fontWeight: 400,
                        fontSize: 22,
                        color: 'var(--cyan-deep)',
                        margin: 0,
                      }}
                    >
                      {o.name}
                    </h3>
                    <div className="small-cap" style={{ marginTop: 6 }}>{o.year}</div>
                  </div>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
