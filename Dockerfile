
cd /Users/salimelghazoui/Downloads/skillup-maroc\ 2

# Crée Dockerfile à la RACINE (pas dans backend/)
cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copie package.json depuis backend/
COPY backend/package*.json ./

RUN npm install

# Copie tout le code backend
COPY backend/ ./

EXPOSE 10000

CMD ["npm", "start"]
