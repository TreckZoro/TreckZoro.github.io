/*!
* Start Bootstrap - Bare v5.0.9 (https://startbootstrap.com/template/bare)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-bare/blob/master/LICENSE)
*/
// This file is intentionally blank
// Use this file to add JavaScript to your project


const contenedor = document.getElementById("participantes");

async function cargarParticipantes() {

    const respuesta = await fetch("https://web-usun-shibuya.onrender.com/api/participants");

    const participantes = await respuesta.json();

    participantes.forEach((participante) => {

        contenedor.innerHTML += `
            <div class="col-12 col-md-6 col-lg-4 mb-4">
                <div class="card participant-card shadow">

                    <div class="card-body">

                        <div class="d-flex align-items-center mb-3">
                            <img src="${participante.foto}" 
                                 alt="Foto de ${participante.nombre}"
                                 class="rounded-circle profile-img me-3">

                            <h2 class="card-title mb-0">
                                ${participante.nombre}
                            </h2>
                        </div>

                        <div class="d-flex align-items-center mb-2">
                            <span class="fw-bold stat-label">🏅 Bosses:</span>
                            <span class="bosses-number">
                                ${participante.bosses} / 38
                            </span>
                        </div>

                        <div class="d-flex align-items-center mb-2">
                            <span class="fw-bold stat-label">☠️ Muertes:</span>
                            <span class="death-number">
                                ${participante.muertes}
                            </span>
                        </div>

                        <div class="d-flex align-items-center mb-2">
                            <span class="fw-bold stat-label">📍 Isla:</span>
                            <span class="text-muted bold">
                                ${participante.isla}
                            </span>
                        </div>

                        <div class="row g-2">
                            ${generarPokemon(participante.pokemon)}
                        </div>

                    </div>
                </div>
            </div>
        `;
    });
}

cargarParticipantes();


function generarPokemon(pokemon) {
    let html = "";

    pokemon.forEach((numero) => {
        const esValido = numero >= 1 && numero < 1026;

        const imagen = esValido
            ? `https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/${String(numero).padStart(3, "0")}.png`
            : "assets/desconocido.png";

        const alt = esValido
            ? `Pokémon ${numero}`
            : "Pokémon desconocido";

        html += `
            <div class="col-4">
                <div class="pokemon-slot">
                    <img src="${imagen}" alt="${alt}">
                </div>
            </div>
        `;
    });

    return html;
}
