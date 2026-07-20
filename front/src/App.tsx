import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import './assets/style/style.css';
import './assets/style/responsive.css';

import Cursor from './components/ui/Cursor';
import Nav from './components/layout/Nav';
import Footer from './components/layout/Footer';

import Accueil from './components/Accueil';
import GalleryList from './components/GalleryList';
import OeuvreDetail from './components/OeuvreDetail';
import Expositions from './components/Expositions';
import Ecrits from './components/Ecrits';
import APropos from './components/APropos';
import ContactForm from './components/ContactForm';
import NonTrouve from './components/NonTrouve';

/** Remonte en haut de page à chaque changement de route. */
function ScrollHaut() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
}

export default function App() {
  // Retrait du splash de chargement après le montage.
  useEffect(() => {
    const t = setTimeout(() => {
      const s = document.getElementById('splash');
      if (s) {
        s.classList.add('gone');
        setTimeout(() => s.remove(), 1000);
      }
    }, 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <Cursor />
      <ScrollHaut />
      <Nav />
      <main>
        {/* Le découpage en routes reprend l'enchaînement des maquettes.
            La route attrape-tout est traitée explicitement (§7.4.3). */}
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/oeuvres" element={<GalleryList />} />
          <Route path="/oeuvres/:slug" element={<OeuvreDetail />} />
          <Route path="/expositions" element={<Expositions />} />
          <Route path="/ecrits" element={<Ecrits />} />
          <Route path="/a-propos" element={<APropos />} />
          <Route path="/contact" element={<ContactForm />} />
          {/* Toute URL inconnue est traitée explicitement, jamais ignorée. */}
          <Route path="*" element={<NonTrouve />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
