var VERSION = '14.3.1';
var URL_API = 'https://ddragon.leagueoflegends.com/cdn/' + VERSION + '/data/en_US/champion.json';
var POR_PAGINA = 12;
var ROLES = ['Todos', 'Fighter', 'Tank', 'Mage', 'Assassin', 'Marksman', 'Support'];

var campeones = [];
var rolActual = 'Todos';
var visibles = POR_PAGINA;

var modalCampeon = new bootstrap.Modal(document.querySelector('#modalCampeon'));

function urlImagen(id) {
    return 'https://ddragon.leagueoflegends.com/cdn/img/champion/loading/' + id + '_0.jpg';
}

async function obtenerCampeones() {
    var response = await fetch(URL_API);
    if (!response.ok) {
        throw new Error('Error ' + response.status + ' al pedir los campeones');
    }
    var data = await response.json();
    var lista = [];
    var clave;
    for (clave in data.data) {
        if (data.data.hasOwnProperty(clave)) {
            lista.push(data.data[clave]); 
        }
    }
    return lista;
}


function mostrarError(mensaje) {
    var aviso = document.querySelector('#error');
    aviso.textContent = mensaje;
    aviso.classList.remove('d-none');
}

function tieneTag(campeon, rol) {
    var i;
    for (i = 0; i < campeon.tags.length; i++) {
        if (campeon.tags[i] === rol) {
            return true;
        }
    }
    return false;
}

function campeonesFiltrados() {
    var resultado = [];
    var i;
    if (rolActual === 'Todos') {
        return campeones;
    }
    for (i = 0; i < campeones.length; i++) {
        if (tieneTag(campeones[i], rolActual)) {
            resultado.push(campeones[i]);
        }
    }
    return resultado;
}

function crearElemento(etiqueta, clases, texto) {
    var el = document.createElement(etiqueta);
    if (clases) {
        el.className = clases;
    }
    if (texto) {
        el.textContent = texto;
    }
    return el;
}


function crearFiltros() {
    var contenedor = document.querySelector('#filtros');
    var i;
    for (i = 0; i < ROLES.length; i++) {
        contenedor.appendChild(crearBotonFiltro(ROLES[i], contenedor));
    }
}

function crearBotonFiltro(rol, contenedor) {
    var boton = crearElemento('button', 'btn btn-sm btn-outline-warning', rol);
    boton.type = 'button';
    if (rol === rolActual) {
        boton.classList.add('active');
    }
    boton.addEventListener('click', function () {
        var botones = contenedor.querySelectorAll('button');
        var j;
        rolActual = rol;
        visibles = POR_PAGINA;
        for (j = 0; j < botones.length; j++) {
            botones[j].classList.remove('active');
        }
        boton.classList.add('active');
        renderizarGrilla();
    });
    return boton;
}


function crearCarta(campeon) {
    var col = crearElemento('div', 'col-6 col-md-4 col-lg-3');
    var carta = crearElemento('div', 'card carta');

    var img = crearElemento('img', 'card-img-top');
    img.src = urlImagen(campeon.id);
    img.alt = campeon.name;
    img.loading = 'lazy';

    var cuerpo = crearElemento('div', 'card-body d-flex flex-column');
    cuerpo.appendChild(crearElemento('h2', 'card-title', campeon.name));
    cuerpo.appendChild(crearElemento('p', 'text-body-secondary small mb-2', campeon.title));

    var roles = crearElemento('div', 'mb-3 d-flex flex-wrap gap-1');
    var i;
    for (i = 0; i < campeon.tags.length; i++) {
        roles.appendChild(crearElemento('span', 'badge text-bg-secondary', campeon.tags[i]));
    }
    cuerpo.appendChild(roles);

    var boton = crearElemento('button', 'btn btn-sm btn-outline-warning mt-auto', 'Ver mas informacion');
    boton.type = 'button';
    boton.addEventListener('click', function () {
        abrirModal(campeon);
    });
    cuerpo.appendChild(boton);

    carta.appendChild(img);
    carta.appendChild(cuerpo);
    col.appendChild(carta);
    return col;
}

function renderizarGrilla() {
    var lista = campeonesFiltrados();
    var grilla = document.querySelector('#grilla');
    var limite = Math.min(visibles, lista.length);
    var i;

    grilla.innerHTML = '';
    for (i = 0; i < limite; i++) {
        grilla.appendChild(crearCarta(lista[i]));
    }

    document.querySelector('#contador').textContent = 'Mostrando ' + limite + ' de ' + lista.length;
    if (visibles >= lista.length) {
        document.querySelector('#botonVerMas').classList.add('d-none');
    } else {
        document.querySelector('#botonVerMas').classList.remove('d-none');
    }
}


function abrirModal(c) {
    document.querySelector('#modalTitulo').textContent = c.name;
    document.querySelector('#modalSubtitulo').textContent = c.title;
    document.querySelector('#modalDescripcion').textContent = c.blurb;
    document.querySelector('#modalRoles').textContent = 'Roles: ' + c.tags.join(', ');

    document.querySelector('#modalAtaque').textContent = 'Ataque: ' + c.info.attack + '/10';
    document.querySelector('#modalDefensa').textContent = 'Defensa: ' + c.info.defense + '/10';
    document.querySelector('#modalMagia').textContent = 'Magia: ' + c.info.magic + '/10';
    document.querySelector('#modalDificultad').textContent = 'Dificultad: ' + c.info.difficulty + '/10';

    document.querySelector('#modalImg').src = urlImagen(c.id);
    document.querySelector('#modalImg').alt = c.name;

    modalCampeon.show();
}


document.querySelector('#botonVerMas').addEventListener('click', function () {
    visibles = visibles + POR_PAGINA;
    renderizarGrilla();
});

async function iniciar() {
    crearFiltros();

    try {
        campeones = await obtenerCampeones();
        renderizarGrilla();
    } catch (error) {
        console.error(error);
        mostrarError('No se pudieron cargar los campeones. Revisá tu conexión y recargá la página.');
    } finally {
    
    }
}

iniciar();
