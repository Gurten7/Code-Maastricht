# Gebruik Node.js image
FROM node:18

# Werkdirectory instellen
WORKDIR /app

# Kopieer projectbestanden
COPY package.json ./
COPY server.js ./

# Installeer dependencies
RUN npm install

# Poort beschikbaar maken
EXPOSE 3000

# Start de server
CMD ["node", "server.js"]
