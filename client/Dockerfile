FROM node:20-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code
COPY . .

# Exposer le port
EXPOSE 5173

# Lancer Vite en mode dev avec host exposé
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
