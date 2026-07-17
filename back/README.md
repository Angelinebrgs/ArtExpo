# ArtExpo — Backend (Strapi)

Backend de la plateforme **ArtExpo**, construit avec **Strapi 5** et une base **SQLite**.
Il expose une **API REST** consommée par le frontend React (Vite) et gère le contenu du site vitrine ainsi que le formulaire de contact.

> 📦 **Installation & lancement** : ce projet ne se lance **pas** seul. Toute l’installation (Docker, `.env`, volumes) est décrite dans le **README à la racine du dépôt**. Ce fichier documente uniquement la partie backend.

---

## 🧱 Stack technique

* **Strapi 5** — Headless CMS / API REST
* **SQLite** — base de données (choix assumé pour le développement et une commanditaire autonome, faible volume d’écriture)
* **Node.js** (exécuté dans le conteneur Docker)
* Modules natifs compilés dans le conteneur : `better-sqlite3`, `sharp`

> 💡 **Pourquoi SQLite plutôt que PostgreSQL ?** Volume d’écriture faible (site vitrine + quelques messages de contact), pas de besoin de concurrence forte, et autonomie totale de la commanditaire sans serveur de base à administrer. Le choix est documenté dans le dossier de projet.

---

## 🗂️ Structure du backend

```
back/
├── config/                 # Configuration Strapi (database, server, middlewares, plugins)
├── src/
│   ├── api/                # Collections : schémas, controllers, routes, services
│   ├── extensions/         # Extensions éventuelles
│   └── middlewares/        # Middlewares personnalisés (ex : rate-limit)
├── database/               # Base SQLite (montée en volume Docker)
├── public/uploads/         # Fichiers uploadés (monté en volume Docker)
├── package.json
└── README.md
```

---

## 📚 Contenu géré (Content-Types)

> ⚠️ **À ajuster** avec les noms exacts de tes collections.

| Collection | Rôle |
| ---------- | ---- |
| `Message` (contact) | Messages envoyés depuis le formulaire de contact du site |
| *(vos autres collections : œuvres, expositions, pages…)* | Contenu du site vitrine |

---

## 🔌 API REST

Strapi expose automatiquement une API REST pour chaque collection. Base de l’API : `http://localhost:1337/api`.

> ⚠️ **À ajuster** avec tes routes réelles.

| Méthode | Endpoint | Description | Accès |
| ------- | -------- | ----------- | ----- |
| `POST`  | `/api/messages` | Envoi d’un message via le formulaire de contact | Public (protégé, voir sécurité) |
| `GET`   | `/api/…` | Récupération du contenu du site vitrine | Public (lecture) |

L’administration du contenu se fait via le panneau d’administration Strapi : `http://localhost:1337/admin`.

---

## 🔒 Sécurité

Le formulaire de contact étant un point d’entrée public, plusieurs protections ont été mises en place côté backend.

### Rate limiting

Un **middleware personnalisé** limite le nombre de requêtes par IP sur l’endpoint d’envoi de message, afin de prévenir le spam et les abus.

> ⚠️ **Correction importante identifiée en test** : le compteur de rate-limit ne doit s’incrémenter **que** sur les requêtes valides. Une version antérieure incrémentait le compteur même sur des requêtes invalides, ce qui permettait de bloquer un utilisateur légitime avec des requêtes malformées. Corrigé.

### Honeypot anti-bot

Le controller d’envoi de message intègre un **champ honeypot** : un champ invisible pour l’utilisateur humain mais rempli par les bots. Toute requête où ce champ est renseigné est rejetée silencieusement.

### Validation & sanitisation des messages

Le contenu des messages est **validé** (longueur maximale) puis **assaini** avant enregistrement.

> ⚠️ **Correction importante identifiée en test** : la validation de longueur doit s’exécuter **avant** la sanitisation. Dans une version antérieure, la sanitisation tournait en premier et pouvait **tronquer silencieusement** un message trop long au lieu de le rejeter proprement. L’ordre a été corrigé : on valide d’abord, on assainit ensuite.

---

## 🧪 Tests

Les tests backend sont écrits avec **Vitest**.

```bash
# à exécuter dans le conteneur backend
npm run test
```

> C’est en écrivant ces tests que les deux vulnérabilités ci-dessus (troncature silencieuse et compteur de rate-limit) ont été mises en évidence puis corrigées.

⚠️ **À ajuster** si le script `test` n’existe pas encore dans le `package.json`.

---

## 🛠️ Scripts Strapi

Ces commandes sont exécutées **dans le conteneur** (voir README racine), pas sur l’hôte.

| Script | Rôle |
| ------ | ---- |
| `npm run develop` | Démarre Strapi en mode développement (auto-reload) |
| `npm run start`   | Démarre Strapi sans auto-reload |
| `npm run build`   | Build le panneau d’administration |

---

## 🔑 Variables d’environnement

Les secrets Strapi (`APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `JWT_SECRET`, etc.) sont fournis via le fichier `.env` **non versionné**.
Voir le **README racine** pour la création du `.env` et la génération de secrets réellement aléatoires.

---

## 📖 Documentation Strapi

Pour les aspects génériques du framework : [documentation officielle Strapi](https://docs.strapi.io).