# Gebruik Node.js image
FROM node:18

# Stel werkdirectory in
WORKDIR /app

# Kopieer benodigde bestanden
COPY package.json ./
COPY server.js ./

# Installeer dependencies
RUN npm install

# Poort instellen
EXPOSE 3000

# Start de server
CMD ["npm", "start
