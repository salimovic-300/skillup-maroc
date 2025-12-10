FROM node:18-alpine

WORKDIR /APP

# Utilisez des chemins relatifs à la racine de 'backend'
COPY package.json . / 

RUN npm install

COPY . / 

EXPOSE 3000

CMD ["npm", "start"]