# Gebruik Node.js als basis
FROM node:18

# Maak een app directory
WORKDIR /app

# Kopieer package.json en installeer dependencies
COPY package*.json ./
RUN npm install

# Kopieer de rest van de code (server.js enz.)
COPY . .

# Expose de poort
EXPOSE 8080

# Start de app
CMD ["node", "server.js"]
