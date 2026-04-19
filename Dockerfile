# Alap Node.js image
FROM node:20

# Szükséges csomagok telepítése a natív modulok fordításához
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Munkakönyvtár létrehozása
WORKDIR /app

# package fájlok bemásolása
COPY package*.json ./

# Függőségek telepítése
RUN npm install

# sqlite3 újrafordítása a konténer saját környezetére
RUN npm rebuild sqlite3 --build-from-source

# A teljes projekt bemásolása
COPY . .

# Az alkalmazás a 3000-es portot használja
EXPOSE 3000

# A szerver indítása
CMD ["node", "server.js"]
