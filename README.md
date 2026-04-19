# Feladatkezelő webalkalmazás

## Projekt leírása

Ez a projekt egy egyszerű feladatkezelő webalkalmazás, amelyben feladatokat lehet létrehozni, megjeleníteni, módosítani, törölni és követni.

A feladatokhoz delegált személy rendelhető, státusz állítható, valamint folyamat-megjegyzések is rögzíthetők.

## Használt technológiák

- Node.js
- Express
- SQLite
- HTML
- CSS
- JavaScript
- Jest
- Supertest

## Megvalósított funkciók

- Új feladat létrehozása
- Feladatok listázása
- Feladat státuszának módosítása
- Feladat törlése
- Feladat szerkesztése
- Delegált személy kezelése
- Folyamat-megjegyzések hozzáadása
- Megjegyzések listázása
- Létrehozási idő megjelenítése
- Automatizált backend tesztek futtatása

## Projekt felépítése

- `server.js` – backend szerver és API végpontok
- `db.js` – SQLite adatbázis kapcsolat
- `public/index.html` – felhasználói felület HTML szerkezete
- `public/style.css` – megjelenés és formázás
- `public/script.js` – kliensoldali működés
- `database/WEBprogramozas_project.db` – SQLite adatbázis fájl
- `tests/tasks.test.js` – automatizált backend tesztek

## Adatbázis szerkezete

Az adatbázis a következő fő táblákat tartalmazza:

### users
- `id`
- `name`

### states
- `id`
- `state_name`

### tasks
- `id`
- `task_name`
- `description`
- `user_id`
- `state_id`
- `created_at`

### task_notes
- `id`
- `task_id`
- `note_text`
- `created_at`

## API végpontok

### Felhasználók
- `GET /api/users` – felhasználók lekérdezése

### Feladatok
- `GET /api/tasks` – feladatok listázása
- `POST /api/tasks` – új feladat létrehozása
- `PUT /api/tasks/:id` – feladat szerkesztése
- `PUT /api/tasks/:id/state` – feladat státuszának módosítása
- `DELETE /api/tasks/:id` – feladat törlése

### Megjegyzések
- `GET /api/tasks/:id/notes` – feladathoz tartozó megjegyzések lekérdezése
- `POST /api/tasks/:id/notes` – új megjegyzés létrehozása

## Telepítés és indítás

### Függőségek telepítése
```bash
npm install
