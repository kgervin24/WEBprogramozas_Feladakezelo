-- =========================================
-- Feladatkezelő projekt - adatbázis inicializálás
-- =========================================

PRAGMA foreign_keys = ON;

-- Régi táblák törlése, hogy újra futtatható legyen a script
DROP TABLE IF EXISTS task_notes;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS states;
DROP TABLE IF EXISTS users;

-- =========================================
-- 1. users tábla
-- Delegált személyek
-- =========================================
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

-- =========================================
-- 2. states tábla
-- Feladat állapotok
-- =========================================
CREATE TABLE states (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    state_name TEXT NOT NULL
);

-- =========================================
-- 3. tasks tábla
-- Feladatok alapadatai
-- =========================================
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_name TEXT NOT NULL,
    description TEXT,
    user_id INTEGER,
    state_id INTEGER,
    created_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (state_id) REFERENCES states(id)
);

-- =========================================
-- 4. task_notes tábla
-- Feladathoz tartozó folyamat-megjegyzések
-- =========================================
CREATE TABLE task_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    note_text TEXT NOT NULL,
    created_at TEXT,
    FOREIGN KEY (task_id) REFERENCES tasks(id)
);

-- =========================================
-- Alap adatok feltöltése
-- =========================================

-- Állapotok
INSERT INTO states (state_name) VALUES ('Új');
INSERT INTO states (state_name) VALUES ('Folyamatban');
INSERT INTO states (state_name) VALUES ('Kész');

-- Felhasználók / dolgozók
INSERT INTO users (name) VALUES ('Teszt Elek');
INSERT INTO users (name) VALUES ('Pum Pál');
INSERT INTO users (name) VALUES ('Cserepes Virág');
INSERT INTO users (name) VALUES ('Szomja Zoltán');

-- =========================================
-- Minta feladatok (opcionális, de hasznos teszthez/bemutatáshoz)
-- =========================================
INSERT INTO tasks (task_name, description, user_id, state_id, created_at)
VALUES ('Első minta feladat', 'Ez egy példa feladat az adatbázis inicializálásához.', 1, 1, '2026.04.20 10:00');

INSERT INTO tasks (task_name, description, user_id, state_id, created_at)
VALUES ('Második minta feladat', 'Ez egy folyamatban lévő példa feladat.', 2, 2, '2026.04.20 10:15');

-- Minta megjegyzések
INSERT INTO task_notes (task_id, note_text, created_at)
VALUES (2, 'Első folyamat-megjegyzés a minta feladathoz.', '2026.04.20 10:20');
