const dice = document.getElementById("dice");
const rollButton = document.getElementById("rollButton");
const diceResult = document.getElementById("diceResult");

let rolling = false;

let currentX = 0;
let currentY = 0;
let currentZ = 0;


// Orientación de cada cara
const faceRotations = {
    1: { x: 0,   y: 0 },
    2: { x: 0,   y: -90 },
    3: { x: 0,   y: 180 },
    4: { x: 0,   y: 90 },
    5: { x: 90,  y: 0 },
    6: { x: -90, y: 0 }
};


rollButton.addEventListener("click", function () {

    if (rolling) return;

    rolling = true;
    rollButton.disabled = true;

    // --------------------------------
    // 1. Elegimos el resultado
    // --------------------------------

    const result = Math.floor(Math.random() * 6) + 1;

    console.log("Resultado elegido:", result);


    // --------------------------------
    // 2. Orientación que debe tener
    // --------------------------------

    const target = faceRotations[result];


    // --------------------------------
    // 3. Normalizamos la rotación actual
    // --------------------------------

    const currentXNormalized =
        ((currentX % 360) + 360) % 360;

    const currentYNormalized =
        ((currentY % 360) + 360) % 360;


    // --------------------------------
    // 4. Calculamos cuánto tenemos que girar
    // --------------------------------

    let rotationX =
        target.x - currentXNormalized;

    let rotationY =
        target.y - currentYNormalized;


    // Nos aseguramos de que siempre sea positivo
    rotationX =
        ((rotationX % 360) + 360) % 360;

    rotationY =
        ((rotationY % 360) + 360) % 360;


    // --------------------------------
    // 5. Añadimos vueltas completas
    // --------------------------------

    const extraX = 2 + Math.floor(Math.random() * 3);
    const extraY = 2 + Math.floor(Math.random() * 3);
    const extraZ = 2 + Math.floor(Math.random() * 3);


    currentX += extraX * 360 + rotationX;
    currentY += extraY * 360 + rotationY;
    currentZ += extraZ * 360;


    // --------------------------------
    // 6. Aplicamos la animación
    // --------------------------------

    dice.style.transform =
        `rotateX(${currentX}deg)
         rotateY(${currentY}deg)
         rotateZ(${currentZ}deg)`;


    // --------------------------------
    // 7. Mostramos el resultado
    // --------------------------------

    setTimeout(function () {

        diceResult.innerHTML =
            `🎉 ¡En el siguiente tramo tienes <strong>${result}</strong> capturas extra!`;

        rolling = false;
        rollButton.disabled = false;

    }, 2500);

});