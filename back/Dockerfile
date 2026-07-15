FROM node:22-bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
  python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

EXPOSE 1337

CMD ["npm","run","develop"]
