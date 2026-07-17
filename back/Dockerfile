FROM node:22-bookworm-slim

WORKDIR /app

# Outils de compilation pour les modules natifs (sharp, better-sqlite3)
# → utilisés en fallback si node-gyp doit compiler depuis les sources.
RUN apt-get update && apt-get install -y \
  python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

EXPOSE 1337

# Dépendances et lancement gérés au runtime par le compose (npm ci && npm run develop).
# CMD documentaire uniquement (écrasé par le `command` du docker-compose) :
# CMD ["npm", "run", "develop"]