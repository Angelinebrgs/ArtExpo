# ArtExpo

**ArtExpo** est un site vitrine artistique composé d’un **frontend React (Vite)** et d’un **backend Strapi**, entièrement orchestré avec **Docker** afin de garantir une installation **identique sur Linux, Windows et macOS**.

Ce README explique **pas à pas** comment lancer le projet sans rencontrer les problèmes classiques (Node, sharp, sqlite, node_modules, etc.).

---

## 🎯 Philosophie du projet

* ❌ Aucune dépendance Node installée sur la machine hôte
* ✅ Tout s’exécute **dans Docker**
* ✅ Compatible **Linux / Windows / macOS**
* ✅ Modules natifs (`sharp`, `better-sqlite3`) compilés **uniquement dans le conteneur**
* ✅ Environnement reproductible pour toute nouvelle machine

---

## 🧰 Prérequis

* **Docker** ≥ 24
* **Docker Compose** v2
* (Windows) Docker Desktop avec **WSL2 activé**

Vérification :

```bash
docker --version
docker compose version
```

---

## 🚀 Installation et lancement (méthode officielle)

### 1️⃣ Cloner le projet

```bash
git clone https://github.com/Angelinebrgs/ArtExpo.git
cd ArtExpo
```

---

### 2️⃣ Créer le fichier `.env`

Le fichier `.env` **n’est jamais versionné**.

Créer `.env` à la racine du projet :

```env
NODE_ENV=development
APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=change_me
ADMIN_JWT_SECRET=change_me
JWT_SECRET=change_me
```

---

### 3️⃣ Lancer le projet avec Docker

Commande unique (fonctionne sur toutes les machines) :

```bash
docker compose up -d --build
```

Suivre les logs du backend :

```bash
docker compose logs -f backend
```

---

## 🌍 Accès aux applications

* **Frontend** : [http://localhost:3000](http://localhost:3000)
* **Strapi Admin** : [http://localhost:1337/admin](http://localhost:1337/admin)

---

## 📦 Volumes Docker (important)

Le projet utilise des volumes Docker pour garantir la compatibilité multi‑OS :

| Volume               | Rôle               |
| -------------------- | ------------------ |
| `front_node_modules` | Dépendances React  |
| `back_node_modules`  | Dépendances Strapi |
| `back_data`          | Base SQLite        |
| `back_uploads`       | Uploads Strapi     |

👉 Les `node_modules` **ne doivent jamais être installés sur la machine hôte**.

---

## 🧹 Nettoyage / reset complet (en cas de souci)

Si tu rencontres une erreur liée à `sharp`, `better-sqlite3`, ou à des dépendances :

```bash
docker compose down -v
rm -rf front/node_modules back/node_modules
docker compose up -d --build
```

⚠️ Cette commande supprime aussi la base SQLite locale.

---

## 🚫 Erreurs courantes évitées par ce setup

* ❌ `libnode.so not found`
* ❌ `sharp build failed`
* ❌ `better-sqlite3 incompatible`
* ❌ conflits Windows / Linux
* ❌ `node_modules` écrasés par les volumes

Tout est compilé **dans Docker**, jamais sur l’OS hôte.

---

## 🗂️ Structure du projet

```
ArtExpo/
├── front/              # Frontend React (Vite)
├── back/               # Backend Strapi
├── docker-compose.yml
├── .env                # Local uniquement
├── .gitignore
└── README.md
```

---

## 🖌️ Technologies utilisées

* React (Vite)
* Strapi
* SQLite (dev)
* Docker & Docker Compose

---

## 📬 Contact

Pour toute question :
📧 [titou.borges@gmail.com](mailto:titou.borges@gmail.com)

---

✨ **Ce projet est conçu pour être cloné et lancé sans friction, sur n’importe quelle machine.**
