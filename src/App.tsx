// This file is a React component that serves as the main entry point for the application.
import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebase/Config';
import './assets/style/style.css';
import img from '/src/assets/img/ARtisteperfexample.jpg';
import img2 from '/src/assets/img/Oeuvreexample.png';


export default function Index() {

  const [oeuvres, setOeuvres] = useState([]);
  
  useEffect(() => {
    const fetchOeuvres = async () => {
      try {
        const oeuvresCollection = collection(db, 'oeuvres'); // 'oeuvres' est le nom de votre collection
        const oeuvresQuery = query(oeuvresCollection, orderBy('createdAt', 'desc'));
        const oeuvresSnapshot = await getDocs(oeuvresQuery);
        const oeuvresList = oeuvresSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOeuvres(oeuvresList);
      } catch (error) {
        console.error("Erreur lors de la récupération des œuvres :", error);
      }
    };
    fetchOeuvres();
  }, []);

  return (
    <>
      <header className="main-header">
        <h1>ARTISTE</h1> 
      </header>

      <main className="container">
        <section className="hero">
          <img src={img} alt="Artiste en performance" />
        </section>

        <section className="oeuvres">
          <h2>ŒUVRES</h2>
          <div className="grid">
            <img src={img2} alt="Performance" className="img-large"/>
            <div className="img-text">
              <div className="text-box">
                <h3>Les mots, l’amour, les sorts..</h3>
                <p>
                  Oeuvre réalisé, 2021<br />
                  avec Crys Aslanian<br />
                  Sur un Plateau radio...<br />
                Workshop d’une semaine avec l’artiste Crys Aslanian.
                Les Mots, l’amour, les sorts est une proposition d’atelier autour des pratiques de l’écriture collective. Durant une semaine, 6 étudiantes ont coécrit des textes, des poèmes et des extraits de
                journal en créant et en laissant circuler des éléments produits par chacune puis transformés par
                d’autre..
                Rêver de Travers est le résultat d’un exercice de création de monde autour du jeu de rôle Dream
                Askew de l’autrice Avery Adler. Ce jeu invite à créer un monde post apocalyptique dans lequel
                survit une enclave queer entourée de gangs, d’un Maelstrom Psychique et d’une Société restée
                intacte.
                Enregistrement réalisé au Fotomat le 19 Mars 2021 à Clermont-Ferrand.
                Proposition de Crys Aslanian et Nelly Girardeau
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="apropos">
          <h2>À PROPOS</h2>
          <p>Arts Contemporain</p>
        </section>

        <footer>
          <h2>CONTACT</h2>
          <p>info@exemple.com</p>
        </footer>
      </main>
    </>
  );
}
