# ArtExpo

**ArtExpo** est un site vitrine artistique composé d’un **frontend React (Vite)** et d’un **backend Strapi**, entièrement orchestré avec **Docker** afin de garantir une installation **identique sur Linux, Windows et macOS**.

Ce README explique **pas à pas** comment lancer le projet sans rencontrer les problèmes classiques (Node, `sharp`, `sqlite`, `node_modules`, etc.).

---

## 🎯 Philosophie du projet

* ❌ Aucune dépendance Node installée sur la machine hôte
* ✅ Tout s’exécute **dans Docker**
* ✅ Compatible **Linux / Windows / macOS**
* ✅ Modules natifs (`sharp`, `better-sqlite3`) compilés **uniquement dans le conteneur**
* ✅ Environnement reproductible pour toute nouvelle machine

> Conséquence : on ne lance **jamais** `npm install` sur l’hôte. L’installation des dépendances se fait à l’intérieur des conteneurs, et les `node_modules` sont stockés dans des **volumes Docker** dédiés.

---

## 🧰 Prérequis

* **Docker** ≥ 24
* **Docker Compose** v2
* (Windows) Docker Desktop avec **WSL2 activé**
* Ports **3000** et **1337** libres sur la machine

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

Le fichier `.env` **n’est jamais versionné** (il est listé dans `.gitignore`).

Créer `.env` à la racine du projet :

```env
NODE_ENV=development
APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=change_me
ADMIN_JWT_SECRET=change_me
JWT_SECRET=change_me
```

> ⚠️ **Sécurité** : remplace les valeurs `change_me` et les `APP_KEYS` par des secrets réellement aléatoires — ne laisse jamais ces valeurs par défaut. Tu peux en générer avec :
> ```bash
> node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
> ```
> Pour `APP_KEYS`, Strapi attend **plusieurs** clés séparées par des virgules.

> ℹ️ Ces variables sont lues par le conteneur **backend**. Assure-toi que le service `backend` du `docker-compose.yml` référence bien ce fichier (`env_file: .env`).

---

### 3️⃣ Lancer le projet avec Docker

Commande unique (fonctionne sur toutes les machines) :

```bash
docker compose up -d --build
```

> ⏳ Le **premier** build peut prendre plusieurs minutes : les modules natifs (`sharp`, `better-sqlite3`) sont compilés dans le conteneur. Les builds suivants sont bien plus rapides grâce au cache Docker.

Suivre les logs du backend :

```bash
docker compose logs -f backend
```

---

## 🌍 Accès aux applications

* **Frontend** : [http://localhost:3000](http://localhost:3000)
* **Strapi Admin** : [http://localhost:1337/admin](http://localhost:1337/admin)

Au premier lancement de Strapi, l’interface `/admin` te demande de créer le **compte administrateur**.

---

## ⏹️ Arrêter le projet

Pour arrêter les conteneurs **sans perdre** la base ni les uploads :

```bash
docker compose down
```

Les volumes (DB SQLite, uploads, `node_modules`) sont conservés. Au prochain `docker compose up -d`, tu retrouves tout en l’état.

---

## 📦 Volumes Docker (important)

Le projet utilise des volumes Docker pour garantir la compatibilité multi‑OS :

| Volume               | Rôle               |
| -------------------- | ------------------ |
| `front_node_modules` | Dépendances React  |
| `back_node_modules`  | Dépendances Strapi |
| `back_data`          | Base SQLite        |
| `back_uploads`       | Uploads Strapi     |

👉 Les `node_modules` vivent **dans ces volumes**, jamais sur la machine hôte. C’est ce qui évite les conflits entre OS.

---

## 🧹 Nettoyage / reset complet (en cas de souci)

Comme les `node_modules` et la base vivent dans des **volumes Docker**, le vrai reset se fait côté Docker :

```bash
docker compose down -v        # supprime conteneurs + volumes (node_modules, DB SQLite, uploads)
docker compose up -d --build  # tout est recompilé et recréé proprement
```

⚠️ `-v` supprime aussi la **base SQLite** et les **uploads** : tu repars d’un état vierge.

> 🩹 **Filet de sécurité** — uniquement si quelqu’un a lancé `npm install` sur l’hôte par erreur (ce dossier ne devrait normalement pas exister) :
> ```bash
> rm -rf front/node_modules back/node_modules
> ```

---

## 🚫 Erreurs courantes évitées par ce setup

* ❌ `libnode.so not found`
* ❌ `sharp build failed`
* ❌ `better-sqlite3 incompatible`
* ❌ conflits Windows / Linux
* ❌ `node_modules` de l’hôte écrasés par les volumes

Tout est compilé **dans Docker**, jamais sur l’OS hôte.

---

## 🗂️ Structure du projet

```
ArtExpo/
├── front/                 # Frontend React (Vite)
│   └── package.json       # dépendances React/Vite (versionné)
├── back/                  # Backend Strapi
│   └── package.json       # dépendances Strapi (versionné)
├── docker-compose.yml
├── .env                   # Local uniquement (non versionné)
├── .gitignore
└── README.md
```

> Chaque sous‑projet (`front` et `back`) est un projet Node autonome avec son propre `package.json` et son propre `package-lock.json` — les deux sont **versionnés dans Git**. Seuls les `node_modules` (gérés par les volumes Docker) sont ignorés.

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