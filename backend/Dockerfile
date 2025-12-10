FROM node:18-alpine

WORKDIR /APP

# Correction : Le contexte est maintenant 'backend'
COPY package.json . / 

RUN npm install

# Correction : Le contenu de 'backend' est copié
COPY . / 

EXPOSE 3000

CMD ["npm", "start"]