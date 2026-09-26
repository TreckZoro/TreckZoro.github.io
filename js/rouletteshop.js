
// =========================================
// PREMIOS DE LA RULETA
// =========================================

const prizes = [
    {
        name: "Obj evo",
        probability: 15
    },
    {
        name: "Capsula Habilidad",
        probability: 5
    },
    {
        name: "Refresco",
        probability: 20
    },
    {
        name: "Less Death",
        probability: 6
    },
    {
        name: "Obj competi",
        probability: 15
    },
    {
        name: "Mega Pulsera",
        probability: 2
    },
    {
        name: "25 Monedas",
        probability: 25
    },
    {
        name: "No Hit",
        probability:  2
    },
    {
        name: "Restaura todo",
        probability: 15
    },
   
];


// =========================================
// CONFIGURACIÓN
// =========================================

const canvas = document.getElementById("roulette");
const ctx = canvas.getContext("2d");

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

const radius = 210;


// =========================================
// COMPROBAR PROBABILIDADES
// =========================================

const totalProbability = prizes.reduce(
    (total, prize) => total + prize.probability,
    0
);

if (totalProbability !== 100) {
    console.warn(
        `Las probabilidades suman ${totalProbability}% en lugar de 100%.`
    );
}


// =========================================
// COLORES
// =========================================

const colors = [
    "#ff595e",
    "#ffca3a",
    "#8ac926",
    "#1982c4",
    "#6a4c93",
    "#f77f00",
    "#00b4d8",
    "#d90429",
    "#c7c429"
];


// =========================================
// DIBUJAR RULETA
// =========================================

function drawRoulette() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    let currentAngle = 0;


    for (let i = 0; i < prizes.length; i++) {

        /*
         * El tamaño de la sección depende
         * directamente de su probabilidad.
         */

        const sliceAngle =
            (prizes[i].probability / 100) *
            (2 * Math.PI);

        const startAngle = currentAngle;
        const endAngle = currentAngle + sliceAngle;


        // =====================================
        // SECCIÓN
        // =====================================

        ctx.beginPath();

        ctx.moveTo(
            centerX,
            centerY
        );

        ctx.arc(
            centerX,
            centerY,
            radius,
            startAngle,
            endAngle
        );

        ctx.closePath();

        ctx.fillStyle = colors[i];

        ctx.fill();


        // =====================================
        // LÍNEA
        // =====================================

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;

        ctx.stroke();


        // =====================================
        // TEXTO
        // =====================================

        ctx.save();

        ctx.translate(
            centerX,
            centerY
        );

        /*
         * Colocamos el texto en el centro
         * de su sección.
         */

        const textAngle =
            startAngle + sliceAngle / 2;

        ctx.rotate(textAngle);

        ctx.textAlign = "right";

        ctx.textBaseline = "middle";

        ctx.fillStyle = "#ffffff";

        ctx.font = "bold 16px Arial";

        ctx.fillText(
            prizes[i].name,
            radius - 15,
            0
        );

        ctx.restore();


        currentAngle = endAngle;
    }


    // =========================================
    // CÍRCULO CENTRAL
    // =========================================

    ctx.beginPath();

    ctx.arc(
        centerX,
        centerY,
        35,
        0,
        2 * Math.PI
    );

    ctx.fillStyle = "#212529";

    ctx.fill();


    ctx.fillStyle = "#ffffff";

    ctx.font = "bold 15px Arial";

    ctx.textAlign = "center";

    ctx.textBaseline = "middle";

    ctx.fillText(
        "GO",
        centerX,
        centerY
    );
}


drawRoulette();


// =========================================
// GIRAR
// =========================================

let currentRotation = 0;

let spinning = false;


document
    .getElementById("spinButton")
    .addEventListener("click", function () {

        if (spinning) {
            return;
        }

        spinning = true;


        // =====================================
        // ELEGIR PREMIO SEGÚN PROBABILIDAD
        // =====================================

        const random = Math.random() * 100;

        let accumulatedProbability = 0;

        let result = 0;


        for (let i = 0; i < prizes.length; i++) {

            accumulatedProbability +=
                prizes[i].probability;

            if (random < accumulatedProbability) {

                result = i;

                break;
            }
        }


        console.log(
            "Premio:",
            prizes[result].name
        );

        console.log(
            "Probabilidad:",
            prizes[result].probability + "%"
        );


        // =====================================
        // CALCULAR ÁNGULO DEL PREMIO
        // =====================================

        let prizeStartAngle = 0;

        for (let i = 0; i < result; i++) {

            prizeStartAngle +=
                (prizes[i].probability / 100) *
                360;
        }


        const prizeSize =
            (prizes[result].probability / 100) *
            360;


        /*
         * Ángulo del centro del premio.
         */

        const prizeCenterAngle =
            prizeStartAngle +
            prizeSize / 2;


        console.log(
            "Centro del premio:",
            prizeCenterAngle
        );


        // =====================================
        // POSICIÓN DE LA FLECHA
        // =====================================

        /*
         * La flecha está arriba.
         *
         * En canvas:
         * 0°   = derecha
         * 90°  = abajo
         * 180° = izquierda
         * 270° = arriba
         */

        const pointerAngle = 270;


        // =====================================
        // POSICIÓN ACTUAL DE LA RULETA
        // =====================================

        /*
        * currentRotation puede tener muchas vueltas
        * acumuladas.
        *
        * Nos quedamos solamente con la posición
        * actual dentro de una vuelta.
        */

        const currentRotationNormalized = ((currentRotation % 360) + 360) % 360;

        // =====================================
        // ROTACIÓN NECESARIA
        // =====================================

       /*  let rotationNeeded =
            pointerAngle -
            prizeCenterAngle; */

        
        let rotationNeeded =
            pointerAngle -
            prizeCenterAngle -
            currentRotationNormalized;

        /*
         * Normalizamos el ángulo
         * entre 0 y 360.
         */

        rotationNeeded =
            (rotationNeeded + 360) % 360;


        // =====================================
        // VUELTAS EXTRA
        // =====================================

        const extraSpins =
            5 + Math.floor(Math.random() * 4);


        currentRotation +=
            extraSpins * 360 +
            rotationNeeded;


        console.log(
            "Rotación final:",
            currentRotation
        );


        // =====================================
        // ANIMACIÓN
        // =====================================

        canvas.style.transform =
            `rotate(${currentRotation}deg)`;


        // =====================================
        // RESULTADO
        // =====================================

        setTimeout(function () {

            document.getElementById("result").innerHTML =
                `🎉 ¡Has conseguido: <strong>${prizes[result].name}</strong>!`;

            spinning = false;

        }, 5000);

    });

