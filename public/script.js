// ----------------------------------
// 1. Alap elemek megkeresése
// ----------------------------------

// Feladat neve
const taskInput = document.getElementById('taskInput');

// Feladat leírása
const descriptionInput = document.getElementById('descriptionInput');

// Delegált személy kiválasztása
const personSelect = document.getElementById('personSelect');

// Hozzáadás gomb
const addButton = document.getElementById('addButton');

// Feladatlista helye
const taskList = document.querySelector('.task-list');

// ----------------------------------
// 2. Adattömbök
// ----------------------------------

// Userek listája
let users = [];

// Feladatok listája
let tasks = [];

// ----------------------------------
// 3. Userek betöltése a szerverről
// ----------------------------------

async function loadUsers() {
    try {
        const response = await fetch('/api/users');
        const data = await response.json();

        users = data;

        // Select mező újratöltése
        personSelect.innerHTML = '<option value="">Válassz delegált személyt...</option>';

        for (let i = 0; i < users.length; i++) {
            const option = document.createElement('option');
            option.value = users[i].id;
            option.textContent = users[i].name;
            personSelect.appendChild(option);
        }
    } catch (error) {
        console.error('Hiba a users betöltésénél:', error);
    }
}

// ----------------------------------
// 4. Feladatok betöltése a szerverről
// ----------------------------------

async function loadTasksFromServer() {
    try {
        const response = await fetch('/api/tasks');
        const data = await response.json();

        tasks = data;

        renderTasks();
    } catch (error) {
        console.error('Hiba a tasks betöltésénél:', error);
    }
}

// ----------------------------------
// 5. Megjegyzések betöltése egy adott feladathoz
// ----------------------------------

async function loadNotes(taskId, noteList) {
    try {
        const response = await fetch(`/api/tasks/${taskId}/notes`);
        const data = await response.json();

        // Kiürítjük a listát
        noteList.innerHTML = '';

        // Feltöltjük az adatbázisból érkező megjegyzésekkel
        for (let i = 0; i < data.length; i++) {
            const noteItem = document.createElement('li');

            if (data[i].created_at) {
                noteItem.textContent = data[i].created_at + ' - ' + data[i].note_text;
            } else {
                noteItem.textContent = data[i].note_text;
            }

            noteList.appendChild(noteItem);
        }
    } catch (error) {
        console.error('Hiba a megjegyzések betöltésénél:', error);
    }
}

// ----------------------------------
// 6. Státusz módosítása adatbázisban
// ----------------------------------

async function updateTaskState(taskId, newStateId) {
    try {
        const response = await fetch(`/api/tasks/${taskId}/state`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                state_id: newStateId
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || 'Nem sikerült módosítani a státuszt.');
            return;
        }

        // Sikeres módosítás után újratöltjük a listát
        loadTasksFromServer();
    } catch (error) {
        console.error('Hiba a státusz módosításánál:', error);
        alert('Hiba történt a státusz módosításakor.');
    }
}

// ----------------------------------
// 7. Feladat törlése adatbázisból
// ----------------------------------

async function deleteTask(taskId) {
    try {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || 'Nem sikerült törölni a feladatot.');
            return;
        }

        // Sikeres törlés után újratöltjük a listát
        loadTasksFromServer();
    } catch (error) {
        console.error('Hiba a feladat törlésénél:', error);
        alert('Hiba történt a törlés során.');
    }
}

// ----------------------------------
// 7/A. Feladat szerkesztésének mentése
// ----------------------------------

async function updateTask(taskId, taskName, description, userId) {
    try {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                task_name: taskName,
                description: description,
                user_id: Number(userId)
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || 'Nem sikerült módosítani a feladatot.');
            return false;
        }

        return true;
    } catch (error) {
        console.error('Hiba a feladat szerkesztésénél:', error);
        alert('Hiba történt a feladat szerkesztésekor.');
        return false;
    }
}

// ----------------------------------
// 8. Megjegyzés mentése adatbázisba
// ----------------------------------

async function saveNote(taskId, noteText) {
    try {
        const response = await fetch(`/api/tasks/${taskId}/notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                note_text: noteText
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || 'Nem sikerült menteni a megjegyzést.');
            return false;
        }

        return true;
    } catch (error) {
        console.error('Hiba a megjegyzés mentésénél:', error);
        alert('Hiba történt a megjegyzés mentésekor.');
        return false;
    }
}

// ----------------------------------
// 9. Feladatok kirajzolása
// ----------------------------------

function renderTasks() {
    // Kiürítjük a listát
    taskList.innerHTML = '';

    // Végigmegyünk az összes feladaton
    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];

        // ----------------------------------
        // Alap feladatdoboz létrehozása
        // ----------------------------------

        const newTask = document.createElement('li');

        // Feladat neve
        const taskTitle = document.createElement('div');
        taskTitle.textContent = 'Feladat: ' + task.task_name;
        taskTitle.className = 'task-title';

        // Leírás
        const taskDescription = document.createElement('div');
        taskDescription.textContent = 'Leírás: ' + (task.description || 'Nincs megadva leírás.');
        taskDescription.className = 'task-description';

        // Státusz
        const taskStatus = document.createElement('div');
        taskStatus.textContent = 'Státusz: ' + task.state_name;
        taskStatus.className = 'task-status';

        // Státusz színezése
        if (task.state_name === 'Új') {
            taskStatus.classList.add('status-new');
        } else if (task.state_name === 'Folyamatban') {
            taskStatus.classList.add('status-in-progress');
        } else if (task.state_name === 'Kész') {
            taskStatus.classList.add('status-done');
        }

        // Feladat létrehozási ideje
        const taskCreatedAt = document.createElement('div');
        taskCreatedAt.textContent = 'Létrehozva: ' + (task.created_at || 'Nincs adat');
        taskCreatedAt.className = 'task-created-at';

        // Delegált személy
        const taskPerson = document.createElement('div');
        taskPerson.textContent = 'Delegált személy: ' + (task.user_name || 'Nincs kijelölve');
        taskPerson.className = 'task-person';

        // ----------------------------------
        // Gombterület
        // ----------------------------------

        const buttonArea = document.createElement('div');
        buttonArea.className = 'button-area';

        const startButton = document.createElement('button');
        startButton.textContent = 'Folyamatba';

        const finishButton = document.createElement('button');
        finishButton.textContent = 'Kész';

        const editButton = document.createElement('button');
        editButton.textContent = 'Szerkesztés';

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Törlés';

        // Gombok tiltása az aktuális státusz alapján
        if (task.state_name === 'Új') {
            finishButton.disabled = true;
        }

        if (task.state_name === 'Folyamatban') {
            startButton.disabled = true;
        }

        if (task.state_name === 'Kész') {
            startButton.disabled = true;
            finishButton.disabled = true;
        }

        // ----------------------------------
        // Szerkesztő rész létrehozása
        // Ez alapból rejtett, csak a Szerkesztés gombra nyílik meg
        // ----------------------------------

        const editArea = document.createElement('div');
        editArea.className = 'edit-area';
        editArea.style.display = 'none';

        // Szerkeszthető feladatnév
        const editTaskInput = document.createElement('input');
        editTaskInput.type = 'text';
        editTaskInput.value = task.task_name;
        editTaskInput.className = 'edit-input';

        // Szerkeszthető leírás
        const editDescriptionInput = document.createElement('textarea');
        editDescriptionInput.value = task.description || '';
        editDescriptionInput.className = 'edit-textarea';

        // Szerkeszthető delegált személy
        const editUserSelect = document.createElement('select');
        editUserSelect.className = 'edit-select';

        // Feltöltjük a select mezőt a users tömb alapján
        for (let j = 0; j < users.length; j++) {
            const option = document.createElement('option');
            option.value = users[j].id;
            option.textContent = users[j].name;

            // Az aktuálisan kiválasztott user legyen alapból kijelölve
            if (users[j].id === task.user_id) {
                option.selected = true;
            }

            editUserSelect.appendChild(option);
        }

        // Mentés gomb
        const saveEditButton = document.createElement('button');
        saveEditButton.textContent = 'Mentés';
        saveEditButton.className = 'save-edit-button';

        // Mégse gomb
        const cancelEditButton = document.createElement('button');
        cancelEditButton.textContent = 'Mégse';
        cancelEditButton.className = 'cancel-edit-button';

        // A szerkesztő mezők összerakása
        editArea.appendChild(editTaskInput);
        editArea.appendChild(editDescriptionInput);
        editArea.appendChild(editUserSelect);
        editArea.appendChild(saveEditButton);
        editArea.appendChild(cancelEditButton);

        // ----------------------------------
        // Gombok eseménykezelői
        // ----------------------------------

        // Folyamatba gomb
        startButton.addEventListener('click', function () {
            updateTaskState(task.id, 2);
        });

        // Kész gomb
        finishButton.addEventListener('click', function () {
            updateTaskState(task.id, 3);
        });

        // Törlés gomb
        deleteButton.addEventListener('click', function () {
            deleteTask(task.id);
        });

        // Szerkesztés gomb
        editButton.addEventListener('click', function () {
            // Megjelenítjük a szerkesztő területet
            editArea.style.display = 'block';

            // Amíg szerkesztünk, a szerkesztés gombot letiltjuk
            editButton.disabled = true;
        });

        // Mégse gomb
        cancelEditButton.addEventListener('click', function () {
            // Elrejtjük a szerkesztő területet
            editArea.style.display = 'none';

            // A Szerkesztés gomb újra használható lesz
            editButton.disabled = false;

            // Az input mezők értékét visszaállítjuk az eredeti adatokra
            editTaskInput.value = task.task_name;
            editDescriptionInput.value = task.description || '';
            editUserSelect.value = task.user_id;
        });

        // Mentés gomb
        saveEditButton.addEventListener('click', async function () {
            const newTaskName = editTaskInput.value.trim();
            let newDescription = editDescriptionInput.value.trim();
            const newUserId = editUserSelect.value;

            // Egyszerű ellenőrzések mentés előtt
            if (newTaskName === '') {
                alert('A feladat neve nem lehet üres.');
                return;
            }

            if (newDescription === '') {
                newDescription = 'Nincs megadva leírás.';
            }

            if (newUserId === '') {
                alert('Válassz delegált személyt!');
                return;
            }

            // Meghívjuk a backend mentő függvényt
            const success = await updateTask(task.id, newTaskName, newDescription, newUserId);

            // Sikeres mentés után újratöltjük a feladatlistát
            if (success) {
                loadTasksFromServer();
            }
        });

        // Gombok hozzáadása a gombsorhoz
        buttonArea.appendChild(startButton);
        buttonArea.appendChild(finishButton);
        buttonArea.appendChild(editButton);
        buttonArea.appendChild(deleteButton);

        // ----------------------------------
        // Megjegyzések rész
        // ----------------------------------

        const noteTitle = document.createElement('div');
        noteTitle.textContent = 'Folyamat megjegyzések:';
        noteTitle.className = 'note-title';

        const noteInput = document.createElement('input');
        noteInput.type = 'text';
        noteInput.placeholder = 'Új megjegyzés...';
        noteInput.className = 'note-input';

        const noteButton = document.createElement('button');
        noteButton.textContent = 'Megjegyzés hozzáadása';
        noteButton.className = 'note-button';

        const noteList = document.createElement('ul');
        noteList.className = 'note-list';

        // Csak folyamatban lévő feladatnál lehessen új megjegyzést hozzáadni
        if (task.state_name !== 'Folyamatban') {
            noteInput.disabled = true;
            noteButton.disabled = true;
        }

        // Betöltjük az adott feladat megjegyzéseit
        loadNotes(task.id, noteList);

        // Új megjegyzés mentése
        async function addNote() {
            const noteText = noteInput.value.trim();

            if (noteText === '') {
                return;
            }

            const success = await saveNote(task.id, noteText);

            if (success) {
                noteInput.value = '';
                loadNotes(task.id, noteList);
            }
        }

        noteButton.addEventListener('click', addNote);

        noteInput.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                addNote();
            }
        });

        // ----------------------------------
        // Minden elem hozzáadása a feladatdobozhoz
        // ----------------------------------

        newTask.appendChild(taskTitle);
        newTask.appendChild(taskDescription);
        newTask.appendChild(taskStatus);
        newTask.appendChild(taskPerson);
        newTask.appendChild(taskCreatedAt);
        newTask.appendChild(buttonArea);
        newTask.appendChild(editArea);
        newTask.appendChild(noteTitle);
        newTask.appendChild(noteInput);
        newTask.appendChild(noteButton);
        newTask.appendChild(noteList);

        taskList.appendChild(newTask);
    }
}

// ----------------------------------
// 10. Új feladat mentése
// ----------------------------------

async function addTask() {
    const taskText = taskInput.value.trim();
    let descriptionText = descriptionInput.value.trim();
    const selectedUserId = personSelect.value;

    if (taskText === '') {
        return;
    }

    if (descriptionText === '') {
        descriptionText = 'Nincs megadva leírás.';
    }

    if (selectedUserId === '') {
        alert('Válassz delegált személyt!');
        return;
    }

    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                task_name: taskText,
                description: descriptionText,
                user_id: Number(selectedUserId),
                state_id: 1
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || 'Hiba történt a mentés során.');
            return;
        }

        // Űrlap kiürítése
        taskInput.value = '';
        descriptionInput.value = '';
        personSelect.value = '';

        taskInput.focus();

        // Lista frissítése
        loadTasksFromServer();

    } catch (error) {
        console.error('Hiba a task mentésénél:', error);
        alert('Nem sikerült elküldeni a feladatot a szervernek.');
    }
}

// ----------------------------------
// 11. Eseménykezelők
// ----------------------------------

addButton.addEventListener('click', addTask);

taskInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        addTask();
    }
});

// ----------------------------------
// 12. Induláskor adatok betöltése
// ----------------------------------

loadUsers();
loadTasksFromServer();
