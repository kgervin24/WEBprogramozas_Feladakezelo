const request = require('supertest');
const app = require('../server');
const db = require('../db');

// ----------------------------------
// 1. Tesztek a /api/tasks végpontokhoz
// ----------------------------------

describe('Task API tesztek', () => {

    // ----------------------------------
    // 2. GET /api/tasks teszt
    // Ellenőrizzük, hogy a végpont válaszol-e
    // és tömböt ad-e vissza
    // ----------------------------------

    test('GET /api/tasks - visszaadja a feladatok listáját', async () => {
        const response = await request(app).get('/api/tasks');

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    // ----------------------------------
    // 3. POST /api/tasks teszt
    // Ellenőrizzük, hogy létrehozható-e egy új feladat
    // ----------------------------------

    test('POST /api/tasks - létrehoz egy új feladatot', async () => {
        const newTask = {
            task_name: 'Teszt feladat',
            description: 'Ez egy automatikus teszt feladat.',
            user_id: 1,
            state_id: 1
        };

        const response = await request(app)
            .post('/api/tasks')
            .send(newTask);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('A feladat mentése sikeres.');
        expect(response.body.taskId).toBeDefined();
    });

});

// ----------------------------------
// 4. Adatbázis kapcsolat lezárása a tesztek után
// Ez fontos, hogy a Jest le tudjon állni rendesen
// ----------------------------------

afterAll((done) => {
    db.close((err) => {
        if (err) {
            console.error('Hiba az adatbázis lezárásánál:', err.message);
        }
        done();
    });
});
