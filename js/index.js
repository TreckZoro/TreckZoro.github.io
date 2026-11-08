const contenedor = document.getElementById("equipos");

const API_URL = "https://web-usun-shibuya.onrender.com/api/teams";
//const API_URL = "http://localhost:3005/api/teams";

async function cargarEquipos() {
    try {
        const respuesta = await fetch(API_URL);

        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }

        const equipos = await respuesta.json();

        contenedor.innerHTML = "";

        if (equipos.length === 0) {
            contenedor.innerHTML = `
                <p class="text-center text-muted">
                    Todavía no hay equipos registrados.
                </p>
            `;
            return;
        }

        equipos.forEach(equipo => {
            contenedor.innerHTML += generarEquipoLocke(equipo);
        });

    } catch (error) {
        console.error("Error cargando equipos:", error);

        contenedor.innerHTML = `
            <div class="alert alert-danger">
                No se han podido cargar los equipos.
            </div>
        `;
    }
}


// =========================================
// GENERAR TARJETA DE UNA PAREJA
// =========================================

/* function generarEquipoLocke(equipo) {

    const participantes = equipo.participantes || [];

    return `
        <div class="card team-card shadow mb-5">

            <!-- Nombre del equipo -->
            <div class="team-header text-center">
                <h2 class="mb-0">
                    ${escaparHTML(equipo.nombre)}
                </h2>
            </div>

            <div class="card-body">

                <!-- Participantes -->
                <div class="row g-4">

                    ${participantes.map(participante =>
                        generarParticipante(participante)
                    ).join("")}

                </div>

                <!-- Vidas compartidas -->
                <div class="shared-lives text-center mt-4">
                    <div class="small text-muted">
                        VIDAS COMPARTIDAS
                    </div>

                    <div class="lives-number">
                        ❤️ ${equipo.vidas}
                    </div>
                </div>

            </div>
        </div>
    `;
} */
function generarEquipoLocke(equipo) {

    const participantes = equipo.participantes || [];

    return `
        <div class="card team-card shadow mb-5">

            <!-- Nombre del equipo -->
            <div class="team-header text-center">
                <h2 class="mb-0">
                    ${escaparHTML(equipo.nombre)}
                </h2>
            </div>

            <!-- Vidas compartidas -->
            <div class="shared-lives text-center">
                <div class="small text-muted">
                    VIDAS COMPARTIDAS
                </div>

                <div class="lives-number">
                    ❤️ ${equipo.vidas}
                </div>
            </div>

            <div class="card-body">

                <!-- Participantes -->
                <div class="row g-4">

                    ${participantes.map(participante =>
                        generarParticipante(participante)
                    ).join("")}

                </div>

            </div>
        </div>
    `;
}

// =========================================
// GENERAR INFORMACIÓN DE UN PARTICIPANTE
// =========================================

function generarParticipante(participante) {

    const foto = participante.foto || "assets/desconocido.png";

    return `
        <div class="col-12 col-md-6">

            <div class="participant-section">

                <!-- Nombre y foto -->
                <div class="d-flex align-items-center mb-3">

                    <img src="${escaparHTML(foto)}"
                         alt="Foto de ${escaparHTML(participante.nombre)}"
                         class="rounded-circle profile-img me-3">

                    <h3 class="participant-name mb-0">
                        ${escaparHTML(participante.nombre)}
                    </h3>

                </div>

                <!-- Bosses -->
                <div class="participant-stat mb-3">
                    <span class="fw-bold">
                        🏅 Bosses:
                    </span>

                    <span class="bosses-number">
                        ${participante.bosses ?? 0} / 38
                    </span>
                </div>

                <!-- Equipo Pokémon -->
                <div class="pokemon-grid">
                    ${generarPokemon(participante.pokemon || [])}
                </div>

            </div>

        </div>
    `;
}


// =========================================
// GENERAR CUADRÍCULA DE POKÉMON
// =========================================

function generarPokemon(pokemon) {

    let html = "";

    // Ordenar por posición en el equipo
    const pokemonOrdenados = [...pokemon].sort(
        (a, b) => a.posicion - b.posicion
    );

    for (let i = 1; i <= 6; i++) {

        const pokemonActual = pokemonOrdenados.find(
            p => p.posicion === i
        );

        if (pokemonActual) {

            const numero = Number(pokemonActual.especie_id);

            const esValido = numero >= 1 && numero <= 1025;

            const imagen = esValido
                ? `https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/${String(numero).padStart(3, "0")}.png`
                : "assets/desconocido.png";

            const nombre = pokemonActual.mote ||
                           pokemonActual.nombre ||
                           `Pokémon ${numero}`;

            html += `
                <div class="pokemon-slot">
                    <img src="${imagen}"
                         alt="${escaparHTML(nombre)}"
                         title="${escaparHTML(nombre)}"
                         loading="lazy"
                         onerror="this.onerror=null; this.src='assets/desconocido.png';">
                </div>
            `;

        } else {

            // Hueco vacío
            html += `
                <div class="pokemon-slot empty-slot">
                    <span>?</span>
                </div>
            `;
        }
    }

    return html;
}


// =========================================
// EVITAR INSERTAR TEXTO HTML SIN ESCAPAR
// =========================================

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

cargarEquipos();
