FROM node:18-alpine

WORKDIR /APP

# COPIE 1 : Copie uniquement le package.json 
COPY package.json . / 

RUN npm install

# COPIE 2 : Copie tout le reste du répertoire /backend
COPY . / 

EXPOSE 3000

CMD ["npm", "start"]