// This file is a React component that serves as the main entry point for the application.
import './assets/style/style.css';
import img from '/src/assets/img/ARtisteperfexample.jpg';


export default function Index() {
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
            <img src="http://localhost:1337/uploads/medium_mental_foundry_unnamed_9_c3761a83eb.jpg" alt="Performance" className="img-large"/>
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
