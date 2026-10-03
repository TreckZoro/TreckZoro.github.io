const horarioBody = document.getElementById("horarioBody");

const BACKEND_URL = "https://web-usun-shibuya.onrender.com";


// Horarios posibles
const HORAS = [
    "12:00",
    "14:00",
    "16:00",
    "18:00",
    "20:00",
    "22:00"
];


// Días de la fase final
const FECHA_INICIO = "2026-10-03";
const FECHA_FIN = "2026-10-14";


async function cargarHorario() {

    try {

        const respuesta = await fetch(
            `${BACKEND_URL}/api/reservas`
        );

        if (!respuesta.ok) {
            throw new Error("Error obteniendo las reservas");
        }

        const reservas = await respuesta.json();

        generarTabla(reservas);

    } catch (error) {

        console.error(error);

        horarioBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-danger">
                    ❌ No se ha podido cargar el horario.
                </td>
            </tr>
        `;
    }
}


function generarTabla(reservas) {

    horarioBody.innerHTML = "";

    const reservasPorFecha = {};

    // Organizamos las reservas por fecha y hora
    reservas.forEach(reserva => {

        if (!reservasPorFecha[reserva.fecha]) {
            reservasPorFecha[reserva.fecha] = {};
        }

        reservasPorFecha[reserva.fecha][
            normalizarHora(reserva.hora)
        ] = reserva;
    });


    // Generamos todos los días
    const fechaActual = new Date(`${FECHA_INICIO}T00:00:00`);
    const fechaFinal = new Date(`${FECHA_FIN}T00:00:00`);


    while (fechaActual <= fechaFinal) {

        const fecha = obtenerFechaISO(fechaActual);

        const fila = document.createElement("tr");


        // Columna de fecha
        const columnaFecha = document.createElement("th");

        columnaFecha.scope = "row";
        columnaFecha.innerHTML = `
            ${formatearFecha(fecha)}
        `;

        fila.appendChild(columnaFecha);


        // Columnas de horas
        HORAS.forEach(hora => {

            const columna = document.createElement("td");

            const reserva =
                reservasPorFecha[fecha]?.[hora];


            // Si no existe ese horario ese día
            if (!reserva) {

                columna.innerHTML = `
                    <span class="text-muted">
                        —
                    </span>
                `;

            }

            // Si existe y está libre
            else if (!reserva.discord_id) {

                columna.innerHTML = `
                    <span class="badge bg-success">
                        Libre
                    </span>
                `;

            }

            // Si está reservado
            else {

                columna.innerHTML = `
                    <span class="badge bg-primary">
                        ${reserva.nombre ?? "Reservado"}
                    </span>
                `;

            }


            fila.appendChild(columna);

        });


        horarioBody.appendChild(fila);


        // Siguiente día
        fechaActual.setDate(
            fechaActual.getDate() + 1
        );
    }
}


function normalizarHora(hora) {

    return hora.substring(0, 5);

}


function obtenerFechaISO(fecha) {

    const año = fecha.getFullYear();

    const mes = String(
        fecha.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        fecha.getDate()
    ).padStart(2, "0");

    return `${año}-${mes}-${dia}`;
}


function formatearFecha(fecha) {

    const date = new Date(`${fecha}T00:00:00`);

    return date.toLocaleDateString(
        "es-ES",
        {
            weekday: "short",
            day: "2-digit",
            month: "2-digit"
        }
    );
}


cargarHorario();