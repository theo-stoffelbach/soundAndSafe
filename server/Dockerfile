FROM node:20-slim

# Installer OpenSSL et autres dépendances nécessaires
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installer les dépendances
RUN npm install

# Générer le client Prisma
RUN npx prisma generate

# Copier le reste du code
COPY . .

# Exposer le port
EXPOSE 3002

# Script de démarrage
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed || true && npm run dev"]
