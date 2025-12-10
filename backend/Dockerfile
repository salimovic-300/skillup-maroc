FROM node:18-alpine

WORKDIR /APP

# Le chemin est maintenant relatif à 'backend'
COPY package.json . / 

RUN npm install

# Copie tout le contenu du répertoire 'backend' dans /APP
COPY . / 

EXPOSE 3000

CMD ["npm", "start"]