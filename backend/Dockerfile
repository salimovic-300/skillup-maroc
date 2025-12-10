FROM node:18-alpine

WORKDIR /APP

# Correction : Utiliser le chemin relatif car la racine est maintenant 'backend'
COPY package.json . /
RUN npm install

# Correction : Copie tout le contenu du répertoire 'backend' dans /APP
COPY . /
EXPOSE 3000

CMD ["npm", "start"]