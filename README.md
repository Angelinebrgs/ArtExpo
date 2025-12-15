# ArtExpo

**ArtExpo** est un site vitrine dédié à une artiste contemporaine, mettant en valeur ses performances et ses textes. Ce projet propose une interface épurée, avec une dominante de bleu, et une mise en page en une à deux colonnes, offrant une expérience immersive et élégante.

## 🎨 Aperçu

![Aperçu du site](./assets/preview.png)

## 🚀 Installation et lancement du projet

### 1. Cloner le dépôt

```bash
git clone https://github.com/Angelinebrgs/ArtExpo.git
cd ArtExpo
docker build -f ./docker/dockerfile -t node_install:latest .
docker compose up
```

### Utilisation de Docker (optionnel)

Si vous rencontrez des problèmes d'installation, vous pouvez utiliser Docker pour construire l'image du projet. Créez un fichier `Dockerfile` dans le dossier `docker` et exécutez :

```bash
docker build -f ./docker/dockerfile -t node_install:latest .
docker run --rm -it -v $(pwd):/app node_install:latest
docker compose up

```

Pour éviter que les problèmes ne persistent après le build, effectuez les mises à jour directement dans le terminal du conteneur via la commande `exec`.

## 🧾 Structure du projet

Voici la structure complète du projet :

```
ArtExpo/
├── front/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── assets/
│   │   │   └── images/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Gallery.jsx
│   │   │   └── Footer.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Performances.jsx
│   │   │   └── Texts.jsx
│   │   ├── App.jsx
│   │   └── index.js
│   ├── package.json
│   └── README.md
├── back/
│   ├── config/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── extensions/
│   │   └── middlewares/
│   ├── .env
│   ├── package.json
│   └── README.md
├── docker/
│   └── dockerfile
├── .gitignore
└── README.md
```

## 🖌️ Technologies utilisées

- React.js
- React Router
- CSS Modules / Styled Components
- Node.js (pour le gestionnaire de paquets)
- Strapi (pour le back-end)

## 📬 Contact

Pour toute question ou suggestion, veuillez contacter : [titou.borges@gmail.com](mailto:titou.borges@gmail.com)