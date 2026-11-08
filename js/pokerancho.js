// =========================================
// CONFIGURACIÓN
// =========================================


const API_URL = "https://web-usun-shibuya.onrender.com/api";

const tablaPokemon = document.getElementById("tablaPokemon");

const filtroParticipante = document.getElementById("filtroParticipante");
const filtroEstado = document.getElementById("filtroEstado");
const filtroUbicacion = document.getElementById("filtroUbicacion");

const btnFiltrar = document.getElementById("btnFiltrar");
const btnLimpiar = document.getElementById("btnLimpiar");

const limitePagina = document.getElementById("limitePagina");

const paginaAnterior = document.getElementById("paginaAnterior");
const paginaSiguiente = document.getElementById("paginaSiguiente");

const numeroPagina = document.getElementById("numeroPagina");
const infoResultados = document.getElementById("infoResultados");


// =========================================
// ESTADO DE LA PÁGINA
// =========================================

let paginaActual = 1;
let totalPaginas = 1;


// =========================================
// CARGAR PARTICIPANTES
// =========================================

async function cargarParticipantes() {

    try {

        const respuesta = await fetch(`${API_URL}/pokemon/filters`);

        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }

        const participantes = await respuesta.json();

        participantes.forEach(participante => {

            const opcion = document.createElement("option");

            opcion.value = participante.id;
            opcion.textContent = participante.nombre;

            filtroParticipante.appendChild(opcion);

        });

    } catch (error) {

        console.error("Error cargando participantes:", error);

    }

}


// =========================================
// CARGAR POKÉMON
// =========================================

async function cargarPokemon() {

    try {

        tablaPokemon.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4">
                    Cargando Pokémon...
                </td>
            </tr>
        `;


        // Construir parámetros
        const parametros = new URLSearchParams({

            page: paginaActual,
            limit: limitePagina.value

        });


        // Filtros seleccionados
        if (filtroParticipante.value) {
            parametros.set("participante", filtroParticipante.value);
        }

        if (filtroEstado.value) {
            parametros.set("estado", filtroEstado.value);
        }

        if (filtroUbicacion.value) {
            parametros.set("ubicacion", filtroUbicacion.value);
        }


        // Consultar API
        const respuesta = await fetch(
            `${API_URL}/pokemon?${parametros.toString()}`
        );

        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }

        const resultado = await respuesta.json();

        const pokemon = resultado.pokemon;
        const paginacion = resultado.paginacion;

        totalPaginas = paginacion.total_paginas;


        // Mostrar resultados
        tablaPokemon.innerHTML = "";

        if (pokemon.length === 0) {

            tablaPokemon.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-muted py-4">
                        No se han encontrado Pokémon.
                    </td>
                </tr>
            `;

        } else {

            pokemon.forEach(p => {

                tablaPokemon.innerHTML += generarFilaPokemon(p);

            });

        }


        // Actualizar paginación
        actualizarPaginacion(paginacion);


    } catch (error) {

        console.error("Error cargando Pokémon:", error);

        tablaPokemon.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-danger py-4">
                    No se han podido cargar los Pokémon.
                </td>
            </tr>
        `;

        infoResultados.textContent = "Error cargando resultados.";

    }

}


// =========================================
// GENERAR FILA DE POKÉMON
// =========================================

function generarFilaPokemon(pokemon) {

    const numero = Number(pokemon.especie_id);

    const esValido = Number.isInteger(numero) &&
                     numero >= 1 &&
                     numero <= 1025;

    const imagen = esValido
        ? `https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/${String(numero).padStart(3, "0")}.png`
        : "assets/desconocido.png";


    const nombre = pokemon.nombre || `Pokémon ${numero}`;
    const mote = pokemon.mote || "-";

    const propietario = pokemon.participante?.nombre || "Desconocido";

    const lugar = pokemon.lugar_obtencion || "-";
    const metodo = pokemon.metodo_obtencion || "-";


    // Estado
    const estado = pokemon.estado === "Vivo"
        ? `<span class="badge bg-success">❤️ Vivo</span>`
        : `<span class="badge bg-danger">💀 Muerto</span>`;


    // Ubicación
    const ubicacion = pokemon.ubicacion === "Equipo"
        ? `<span class="badge bg-primary">⚔️ Equipo</span>`
        : `<span class="badge bg-secondary">📦 Caja</span>`;


    return `
        <tr>

            <!-- Imagen -->
            <td class="text-center">

                <img src="${imagen}"
                     alt="${escaparHTML(nombre)}"
                     title="${escaparHTML(nombre)}"
                     width="65"
                     height="65"
                     style="object-fit: contain;"
                     loading="lazy"
                     onerror="this.onerror=null; this.src='assets/desconocido.png';">

            </td>


            <!-- Especie -->
            <td class="fw-bold">
                ${escaparHTML(nombre)}
            </td>


            <!-- Mote -->
            <td>
                ${escaparHTML(mote)}
            </td>


            <!-- Propietario -->
            <td>
                ${escaparHTML(propietario)}
            </td>


            <!-- Estado -->
            <td>
                ${estado}
            </td>


            <!-- Ubicación -->
            <td>
                ${ubicacion}
            </td>


            <!-- Lugar -->
            <td>
                ${escaparHTML(lugar)}
            </td>


            <!-- Método -->
            <td>
                ${escaparHTML(metodo)}
            </td>

        </tr>
    `;

}


// =========================================
// ACTUALIZAR PAGINACIÓN
// =========================================

function actualizarPaginacion(paginacion) {

    const total = paginacion.total_resultados;

    totalPaginas = Math.max(1, paginacion.total_paginas);

    numeroPagina.textContent =
        `${paginacion.pagina_actual} / ${totalPaginas}`;


    // Información de resultados
    if (total === 0) {

        infoResultados.textContent = "No hay Pokémon registrados.";

    } else {

        const inicio = (paginaActual - 1) * Number(limitePagina.value) + 1;

        const fin = Math.min(
            paginaActual * Number(limitePagina.value),
            total
        );

        infoResultados.textContent =
            `Mostrando ${inicio}-${fin} de ${total} Pokémon`;

    }


    // Botón anterior
    paginaAnterior.classList.toggle(
        "disabled",
        paginaActual <= 1
    );


    // Botón siguiente
    paginaSiguiente.classList.toggle(
        "disabled",
        paginaActual >= totalPaginas
    );

}


// =========================================
// EVENTOS
// =========================================

// Buscar
btnFiltrar.addEventListener("click", () => {

    paginaActual = 1;
    cargarPokemon();

});


// Limpiar filtros
btnLimpiar.addEventListener("click", () => {

    filtroParticipante.value = "";
    filtroEstado.value = "";
    filtroUbicacion.value = "";

    paginaActual = 1;

    cargarPokemon();

});


// Cambiar cantidad de resultados
limitePagina.addEventListener("change", () => {

    paginaActual = 1;
    cargarPokemon();

});


// Página anterior
paginaAnterior.addEventListener("click", () => {

    if (paginaActual > 1) {

        paginaActual--;
        cargarPokemon();

    }

});


// Página siguiente
paginaSiguiente.addEventListener("click", () => {

    if (paginaActual < totalPaginas) {

        paginaActual++;
        cargarPokemon();

    }

});

function escaparHTML(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, caracter => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[caracter]);
}

// =========================================
// INICIAR
// =========================================

async function iniciarPokerancho() {

    await cargarParticipantes();

    await cargarPokemon();

}

iniciarPokerancho();