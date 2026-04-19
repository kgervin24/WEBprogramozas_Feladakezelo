// Betöltjük az sqlite3 csomagot
const sqlite3 = require('sqlite3').verbose();

// Megadjuk az adatbázis fájl helyét
const dbPath = './database/WEBprogramozas_project.db';

// Létrehozunk egy kapcsolatot az adatbázishoz
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Hiba az adatbázis megnyitásakor:', err.message);
    } else {
        console.log('Sikeres kapcsolódás az SQLite adatbázishoz.');
    }
});

// Exportáljuk, hogy más fájlokból is tudjuk használni
module.exports = db;
