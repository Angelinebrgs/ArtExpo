// This file is a React component that serves as the main entry point for the application.
import './App.css'

export default function Index() {
  return (
    <>
      <header className="main-header">
        <h1>ARTISTE</h1>
      </header>

      <main className="container">
        <section className="hero">
          <img src="/assets/ARtisteperfexample.jpg" alt="Artiste en performance" />
        </section>

        <section className="oeuvres">
          <h2>ŒUVRES</h2>
          <div className="grid">
            <img
              src="/assets/Oeuvreexample.png"
              alt="Performance"
              className="img-large"
            />
            <div className="img-text">
              <div className="text-box">
                <h3>Les mots, l’amour, les sorts..</h3>
                <p>
                  Les mots, l’amour, les sorts.., 2021<br />
                  avec Crys Aslanian<br />
                  Plateau radio...<br />
                  {/* le texte complet continue ici */}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="apropos">
          <h2>À PROPOS</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </section>

        <footer>
          <h2>CONTACT</h2>
          <p>info@exemple.com</p>
        </footer>
      </main>
    </>
  );
}
