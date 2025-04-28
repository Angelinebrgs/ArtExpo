
# ArtExpo

**ArtExpo** est un site vitrine dédié à une artiste contemporaine, mettant en valeur ses performances et ses textes. Ce projet propose une interface épurée, avec une dominante de bleu, et une mise en page en une à deux colonnes, offrant une expérience immersive et élégante.

## 🎨 Aperçu

![Aperçu du site](./assets/preview.png)

## 🚀 Installation et lancement du projet

### 1. Cloner le dépôt

```bash
git clone https://github.com/Angelinebrgs/ArtExpo.git
cd ArtExpo
```

### 2. Installer les dépendances

Assurez-vous d'avoir [Node.js](https://nodejs.org/) installé. Ensuite, exécutez :

```bash
npm install
```
### Si vous rencontrez des problèmes d'installation, vous pouvez utiliser Docker pour construire l'image du projet. en créant un dockerfile dans le dossier docker.
### pour eviter que le probleme ne revienne / persiste une fois le build fait faire les update directement dans le terminal du conteneur qui se trouve dans la partie exec.
```bash
docker build -f ./docker/dockerfile -t node_install:latest .
docker run --rm -it -v $(pwd):/app node_install:latest
```

### 3. Lancer le serveur de développement

```bash
npm start
```

Le site sera accessible à l'adresse : [http://localhost:3000](http://localhost:3000)

## 🧾 Structure du projet

```
ArtExpo/
├── public/
│   └── index.html
├── src/
│   ├── assets/
│   │   └── images/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Gallery.jsx
│   │   └── Footer.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Performances.jsx
│   │   └── Texts.jsx
│   ├── App.jsx
│   └── index.js
├── package.json
└── README.md
```

## 🖌️ Technologies utilisées

- React.js
- React Router
- CSS Modules / Styled Components
- Node.js (pour le gestionnaire de paquets)

## 📬 Contact

Pour toute question ou suggestion, veuillez contacter : [angeline@example.com](mailto:titou.borges@gmail.com)
