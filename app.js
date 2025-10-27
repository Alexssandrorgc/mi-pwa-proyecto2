// --- Elementos del DOM ---
const btnSubmit = document.getElementById('submit');
const inputName = document.getElementById('name');
const inputAge = document.getElementById('age');
const inputEmail = document.getElementById('email');
const personList = document.getElementById('person-list');

// --- Crear BD con PouchDB ---
const db = new PouchDB('personas');

// --- Evento para ENVIAR formulario ---
btnSubmit.addEventListener('click', (event) => {
    event.preventDefault();

    const persona = {
        _id: new Date().toISOString(),
        name: inputName.value,
        age: inputAge.value,
        email: inputEmail.value,
        estatus: 'pending'
    };
    
    db.put(persona)
    .then((response) => {
        console.log(response);
        console.log('Documento guardado correctamente');
        // Limpiar formulario
        inputName.value = '';
        inputAge.value = '';
        inputEmail.value = '';
    })
    .catch((error) => {
        console.error('Error al guardar el documento', error);
    });
});

// --- FUNCIÓN: Renderizar (dibujar) la lista de personas ---
function renderPersonList() {
    personList.innerHTML = '';
    
    db.allDocs({ include_docs: true })
    .then((result) => {
        result.rows.forEach(row => {
            const doc = row.doc;

            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center'; 
            
            const div = document.createElement('div');
            const button = document.createElement('button');
            
            div.innerHTML = `<strong>${doc.name}</strong> (${doc.age} años) <br><small class="text-muted">${doc.email}</small>`;
            button.innerText = 'Eliminar';
            
            button.dataset.id = doc._id;
            button.dataset.rev = doc._rev;
            
            button.className = 'btn btn-danger btn-sm delete-btn'; 
            
            li.appendChild(div);
            li.appendChild(button);
            
            personList.appendChild(li);
        });
    })
    .catch((err) => {
        console.error('Error al obtener a las personas', err);
    });
}

// --- FUNCIÓN: Eliminar persona ---
function deletePerson(event) {
    if (event.target.classList.contains('delete-btn')) {
        const id = event.target.dataset.id;
        const rev = event.target.dataset.rev;
        
        console.log(`Eliminando doc: ${id} con rev: ${rev}`);
        
        db.remove(id, rev)
        .then((response) => {
            console.log('Documento eliminado', response);
        })
        .catch((err) => {
            console.error('Error al eliminar', err);
        });
    }
}

// --- INICIALIZACIÓN DE LA APP ---
renderPersonList();

db.changes({
    live: true,
    since: 'now',
    include_docs: true
}).on('change', () => {
    console.log('Hubo un cambio en la BD, actualizando lista...');
    renderPersonList();
});

personList.addEventListener('click', deletePerson);