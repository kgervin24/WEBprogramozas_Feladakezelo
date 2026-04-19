const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3000;

// ----------------------------------
// 1. Alap middleware-ek
// ----------------------------------

// JSON adatok fogadása a frontend felől
app.use(express.json());

// A public mappa statikus kiszolgálása
app.use(express.static(path.join(__dirname, 'public')));

// ----------------------------------
// 2. Főoldal kiszolgálása
// ----------------------------------

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ----------------------------------
// 3. Felhasználók lekérése
// ----------------------------------
// Ezt használja a legördülő lista feltöltésére a frontend

app.get('/api/users', (req, res) => {
    const sql = 'SELECT * FROM users ORDER BY name';

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Hiba a users lekérdezésénél:', err.message);
            return res.status(500).json({
                error: 'Nem sikerült lekérdezni a felhasználókat.'
            });
        }

        res.json(rows);
    });
});

// ----------------------------------
// 4. Feladatok lekérése
// ----------------------------------
// Itt már JOIN-nal kérjük le a feladatokat,
// hogy rögtön megkapjuk a user nevét és az állapot nevét is.

app.get('/api/tasks', (req, res) => {
    const sql = `
        SELECT
            tasks.id,
            tasks.task_name,
            tasks.description,
            tasks.user_id,
            tasks.state_id,
            tasks.created_at,
            users.name AS user_name,
            states.state_name
        FROM tasks
        LEFT JOIN users ON tasks.user_id = users.id
        LEFT JOIN states ON tasks.state_id = states.id
        ORDER BY tasks.id DESC
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Hiba a tasks lekérdezésénél:', err.message);
            return res.status(500).json({
                error: 'Nem sikerült lekérdezni a feladatokat.'
            });
        }

        res.json(rows);
    });
});

// ----------------------------------
// 5. Új feladat mentése
// ----------------------------------

app.post('/api/tasks', (req, res) => {
    const { task_name, description, user_id, state_id } = req.body;

    if (!task_name || !user_id || !state_id) {
        return res.status(400).json({
            error: 'Hiányzik a task_name, user_id vagy state_id.'
        });
    }

    // Létrehozzuk az időbélyeget a kívánt formátumban
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const createdAt = `${year}.${month}.${day} ${hours}:${minutes}`;

    const sql = `
        INSERT INTO tasks (task_name, description, user_id, state_id, created_at)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.run(sql, [task_name, description, user_id, state_id, createdAt], function (err) {
        if (err) {
            console.error('Hiba a task mentésénél:', err.message);
            return res.status(500).json({
                error: 'Hiba történt a mentés során.'
            });
        }

        res.json({
            message: 'A feladat mentése sikeres.',
            taskId: this.lastID
        });
    });
});

// ----------------------------------
// 6. Feladat státuszának módosítása
// ----------------------------------
// Ezzel tudjuk majd az "Új" -> "Folyamatban"
// illetve "Folyamatban" -> "Kész" váltást menteni.

app.put('/api/tasks/:id/state', (req, res) => {
    const taskId = req.params.id;
    const { state_id } = req.body;

    if (!state_id) {
        return res.status(400).json({
            error: 'Hiányzik a state_id.'
        });
    }

    const sql = `
        UPDATE tasks
        SET state_id = ?
        WHERE id = ?
    `;

    db.run(sql, [state_id, taskId], function (err) {
        if (err) {
            console.error('Hiba a státusz módosításánál:', err.message);
            return res.status(500).json({
                error: 'Nem sikerült módosítani a státuszt.'
            });
        }

        res.json({
            message: 'A státusz módosítása sikeres.',
            changedRows: this.changes
        });
    });
});

// ----------------------------------
// 6/A. Feladat szerkesztése
// ----------------------------------

app.put('/api/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    const { task_name, description, user_id } = req.body;

    if (!task_name || !user_id) {
        return res.status(400).json({
            error: 'Hiányzik a task_name vagy a user_id.'
        });
    }

    const sql = `
        UPDATE tasks
        SET task_name = ?, description = ?, user_id = ?
        WHERE id = ?
    `;

    db.run(sql, [task_name, description, user_id, taskId], function (err) {
        if (err) {
            console.error('Hiba a feladat szerkesztésénél:', err.message);
            return res.status(500).json({
                error: 'Nem sikerült módosítani a feladatot.'
            });
        }

        res.json({
            message: 'A feladat módosítása sikeres.',
            changedRows: this.changes
        });
    });
});

// ----------------------------------
// 7. Feladat törlése
// ----------------------------------
// Előbb töröljük a megjegyzéseket,
// utána magát a feladatot.

app.delete('/api/tasks/:id', (req, res) => {
    const taskId = req.params.id;

    const deleteNotesSql = `
        DELETE FROM task_notes
        WHERE task_id = ?
    `;

    db.run(deleteNotesSql, [taskId], function (err) {
        if (err) {
            console.error('Hiba a task_notes törlésénél:', err.message);
            return res.status(500).json({
                error: 'Nem sikerült törölni a feladathoz tartozó megjegyzéseket.'
            });
        }

        const deleteTaskSql = `
            DELETE FROM tasks
            WHERE id = ?
        `;

        db.run(deleteTaskSql, [taskId], function (err) {
            if (err) {
                console.error('Hiba a task törlésénél:', err.message);
                return res.status(500).json({
                    error: 'Nem sikerült törölni a feladatot.'
                });
            }

            res.json({
                message: 'A feladat törlése sikeres.',
                changedRows: this.changes
            });
        });
    });
});

// ----------------------------------
// 8. Egy feladathoz tartozó megjegyzések lekérése
// ----------------------------------

app.get('/api/tasks/:id/notes', (req, res) => {
    const taskId = req.params.id;

    const sql = `
        SELECT *
        FROM task_notes
        WHERE task_id = ?
        ORDER BY id ASC
    `;

    db.all(sql, [taskId], (err, rows) => {
        if (err) {
            console.error('Hiba a megjegyzések lekérdezésénél:', err.message);
            return res.status(500).json({
                error: 'Nem sikerült lekérdezni a megjegyzéseket.'
            });
        }

        res.json(rows);
    });
});

// ----------------------------------
// 9. Új megjegyzés mentése
// ----------------------------------

app.post('/api/tasks/:id/notes', (req, res) => {
    const taskId = req.params.id;
    const { note_text } = req.body;

    if (!note_text) {
        return res.status(400).json({
            error: 'Hiányzik a note_text.'
        });
    }

    // Létrehozzuk az időbélyeget a kívánt formátumban
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const createdAt = `${year}.${month}.${day} ${hours}:${minutes}`;

    const sql = `
        INSERT INTO task_notes (task_id, note_text, created_at)
        VALUES (?, ?, ?)
    `;

    db.run(sql, [taskId, note_text, createdAt], function (err) {
        if (err) {
            console.error('Hiba a megjegyzés mentésénél:', err.message);
            return res.status(500).json({
                error: 'Nem sikerült menteni a megjegyzést.'
            });
        }

        res.json({
            message: 'A megjegyzés mentése sikeres.',
            noteId: this.lastID
        });
    });
});

// ----------------------------------
// 10. Szerver indítása
// ----------------------------------

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`A szerver fut a ${PORT} porton.`);
    });
}

module.exports = app;
