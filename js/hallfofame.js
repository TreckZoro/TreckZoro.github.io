
const contenedor = document.getElementById("participantes");

const participantes = [
    
    {
        nombre: "KakiiSevilla",
        foto: "assets/KakiPFP_2.jpg",
        muertes: 10,
        activo: true,
        pokemon: [212, 604, 169, 748, 727, 233]
    },
    {
        nombre: "TreckZoro",
        foto: "assets/TreckZoroPFP_2.jpg",
        muertes: 22,
        activo: true,
        pokemon: [421, 30,730, 609, 445, 589]
    },
    {
        nombre: "InstinKen",
        foto: "assets/InstinkenPFP.jpg",
        muertes: 33,
        activo: true,
        pokemon: [727, 384 , 593, 697,376]
    },
    {
        nombre: "Magallanes",
        foto: "assets/MagaPFP.jpg",
        muertes: 35,
        activo: true,
        pokemon: [ 467, 130, 700, 272, 445, 680 ]
    },
    {
        nombre: "Josefristro",
        foto: "assets/JosPFP.jpg",
        muertes: 49,
        activo: true,
        pokemon: [149, 177, 658, 442 , 771, 38]
    },
    {
        nombre: "Maikyy",
        foto: "assets/MaikyPFP.png",
        muertes: 72,
        activo: true,
        pokemon: [376,68,157, 186, 373, 450]
    }
];

function cargarParticipantes() {

    const participantsActivos = participantes.filter(
        participant => participant.activo
    );

    participantsActivos.forEach((participante) => {

        contenedor.innerHTML += `
            <div class="participant-row">

                <div class="participant-info">
                    <img src="${participante.foto}"
                        alt="Foto de ${participante.nombre}"
                        class="rounded-circle profile-img">

                    <div class="participant-stats">
                        <h5>${participante.nombre}</h5>



                        <div>
                            ☠️ Muertes:
                            <span class="death-number">
                                ${participante.muertes}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="pokemon-container">
                    ${generarPokemon(participante.pokemon)}
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
            <div class="pokemon-slot">
                <img src="${imagen}" alt="${alt}">
            </div>
        `;
    });

    return html;
}
