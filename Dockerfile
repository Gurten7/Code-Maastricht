# Gebruik een geschikte Node.js versie
FROM node:18

# Werkmap maken
WORKDIR /app

# Kopieer bestanden
COPY package.json ./
COPY server.js ./

# Installeer dependencies
RUN npm install

# Poort voor Fly.io
EXPOSE 3000

# Start de server
CMD ["npm", "start"]

RUN npm install multer@1.4.5-lts.1 express cors firebase-admin
