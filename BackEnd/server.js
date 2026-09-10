const express = require("express");
const cors = require("cors");
const supabase = require("./supabase");

const app = express();
const PORT = process.env.PORT || 3005;

// Permite recibir JSON en req.body
app.use(cors());
app.use(express.json());


// ========================================
// GET /api/participants
// Obtener todos los Participantes
// ========================================

app.get("/", (req, res) => {
    res.send("¡ESTE ES MI BACKEND!");
});

app.get("/api/participants", async (req, res) => {
    //console.log("GET /api/participants recibido");

    const { data, error } = await supabase
        .from("participants")
        .select("*")
        .order("id", { ascending: true });;

    if (error) {
        console.error(error);
        return res.status(500).json({
            error: "Error obteniendo participantes"
        });
    }

    /* res.json(data); */

    const participants = data.map(participant => {
        const pokemon = [
            participant.pokemon_1,
            participant.pokemon_2,
            participant.pokemon_3,
            participant.pokemon_4,
            participant.pokemon_5,
            participant.pokemon_6
        ];

        const {
            pokemon_1,
            pokemon_2,
            pokemon_3,
            pokemon_4,
            pokemon_5,
            pokemon_6,
            ...rest
        } = participant;

        return {
            ...rest,
            pokemon
        };
    });

    res.json(participants);

});

// ========================================
// GET 
// ========================================

app.get("/api/participants/:discord_id", async (req, res) => {

    const discord_id = String(req.params.discord_id);

    const { data, error } = await supabase
        .from("participants")
        .select("*")
        .eq("discord_id", discord_id)
        .single();

    if (error) {
        console.error(error);

        return res.status(500).json({
            error: "Error obteniendo participante"
        });
    }

    if (!data) {
        return res.status(404).json({
            error: "Participante no encontrado"
        });
    }

    const participante = data;
    const resultado = {
        id: participante.id,
        discord_id: participante.discord_id,
        nombre: participante.nombre,
        bosses: participante.bosses,
        muertes: participante.muertes,
        isla: participante.isla,
        foto: participante.foto,
        pokemon: [
            participante.pokemon_1,
            participante.pokemon_2,
            participante.pokemon_3,
            participante.pokemon_4,
            participante.pokemon_5,
            participante.pokemon_6
        ]
    };

    res.json(resultado);
});

// ========================================
// POST 
// ========================================

app.post("/api/participants/:discord_id/death/:slot", async (req, res) => {

    const discord_id = String(req.params.discord_id);
    const slot = Number(req.params.slot);

    // Comprobar slot
    if (slot < 1 || slot > 6) {
        return res.status(400).json({
            error: "Slot inválido"
        });
    }

    // Buscar participante
    const { data: participante, error: errorBusqueda } = await supabase
        .from("participants")
        .select("*")
        .eq("discord_id", discord_id)
        .maybeSingle();

    if (errorBusqueda) {
        console.error(errorBusqueda);
        return res.status(500).json({
            error: "Error obteniendo participante"
        });
    }

    if (!participante) {
        return res.status(404).json({
            error: "Usuario no encontrado"
        });
    }

    // Columna del Pokémon que ha muerto
    const columnaPokemon = `pokemon_${slot}`;

    // Poner el Pokémon a NULL
    const updatePokemon = {};
    updatePokemon[columnaPokemon] = null;

    const { error: errorPokemon } = await supabase
        .from("participants")
        .update(updatePokemon)
        .eq("discord_id", discord_id);

    if (errorPokemon) {
        console.error(errorPokemon);
        return res.status(500).json({
            error: "Error actualizando Pokémon"
        });
    }

    // Incrementar muertes
    const nuevasMuertes = participante.muertes + 1;

    const { data, error: errorMuertes } = await supabase
        .from("participants")
        .update({
            muertes: nuevasMuertes
        })
        .eq("discord_id", discord_id)
        .select()
        .single();

    if (errorMuertes) {
        console.error(errorMuertes);
        return res.status(500).json({
            error: "Error actualizando muertes"
        });
    }

    res.json(data);
});

// ========================================
// PUT 
// ========================================

app.put("/api/participants/:discord_id/boss", async (req, res) => {

    const discord_id = String(req.params.discord_id);

     // Buscar participante
    const { data: participante, error: errorBusqueda } = await supabase
        .from("participants")
        .select("*")
        .eq("discord_id", discord_id)
        .maybeSingle();

    if (errorBusqueda) {
        console.error(errorBusqueda);
        return res.status(500).json({
            error: "Error obteniendo participante"
        });
    }

    if (!participante) {
        return res.status(404).json({
            error: "Usuario no encontrado"
        });
    }

     // Incrementar muertes
    const bossesCounter = participante.bosses + 1;

    const { data, error: errorBosses } = await supabase
        .from("participants")
        .update({
            bosses: bossesCounter
        })
        .eq("discord_id", discord_id)
        .select()
        .single();

    if (errorBosses) {
        console.error(errorBosses);
        return res.status(500).json({
            error: "Error actualizando bosses"
        });
    }

    res.json(data);

});


app.put("/api/participants/:discord_id/pokemon/:slot", async (req, res) => {

    const discord_id = String(req.params.discord_id);
    const slot = Number(req.params.slot);
    const nuevoPokemon = Number(req.body.pokemon);

    // Comprobar slot
    if (slot < 1 || slot > 6) {
        return res.status(400).json({
            error: "Slot inválido"
        });
    }

    // Comprobar Pokémon
    if (!Number.isInteger(nuevoPokemon) || nuevoPokemon < 1) {
        return res.status(400).json({
            error: "Debes proporcionar un número de Pokédex válido"
        });
    }

    // Columna que queremos modificar
    const columnaPokemon = `pokemon_${slot}`;

    const update = {};
    update[columnaPokemon] = nuevoPokemon;

    // Actualizar en Supabase
    const { data, error } = await supabase
        .from("participants")
        .update(update)
        .eq("discord_id", discord_id)
        .select()
        .maybeSingle();

    if (error) {
        console.error(error);
        return res.status(500).json({
            error: "Error actualizando Pokémon"
        });
    }

    if (!data) {
        return res.status(404).json({
            error: "Participante no encontrado"
        });
    }

    res.json(data);
});



// =====================
// PATCH
// =====================

app.patch("/api/participants/:discord_id/island", async (req, res) => {

    const discord_id = String(req.params.discord_id);
    const isla = String(req.body.isla);

    

    // Actualizar en Supabase
    const { data, error } = await supabase
        .from("participants")
        .update({
            isla: isla
        })
        .eq("discord_id", discord_id)
        .select()
        .maybeSingle();

    if (error) {
        console.error(error);
        return res.status(500).json({
            error: "Error actualizando Isla"
        });
    }

    if (!data) {
        return res.status(404).json({
            error: "Participante no encontrado"
        });
    }

    res.json(data);
});


// ========================================
// Iniciar servidor
// ========================================

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
