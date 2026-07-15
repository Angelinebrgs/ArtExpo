# Use the latest LTS version of Node.js
FROM node:22-alpine

# Native build toolchain needed to compile modules like sharp / better-sqlite3
RUN apk add --no-cache python3 make g++

# Set the working directory inside the container
WORKDIR /app

# Run against whichever project is bind-mounted at /app, e.g.:
#   docker run --rm -v ./back:/app node_install:latest
CMD ["npm","i"]