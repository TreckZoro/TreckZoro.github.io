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


//Informacion general
app.get("/api/teams", async (req, res) => {

    const { data, error } = await supabase
        .from("equipos_locke")
        .select(`
            id,
            nombre,
            vidas,
            participantes (
                id,
                nombre,
                foto,
                bosses,
                pokemon!pokemon_participante_id_fkey (
                    especie_id,
                    mote,
                    posicion,
                    estado,
                    ubicacion,
                    pokemon_especies (
                        nombre_es,
                        nombre_en
                    )
                )
            )
        `)
        .eq("participantes.pokemon.estado", "Vivo")
        .eq("participantes.pokemon.ubicacion", "Equipo")
        .order("id", { ascending: true });

    if (error) {
        console.error(error);
        return res.status(500).json({
            error: "Error obteniendo equipos"
        });
    }

    const teams = data.map(team => ({
        id: team.id,
        nombre: team.nombre,
        vidas: team.vidas,

        participantes: (team.participantes ?? []).map(participant => ({
            id: participant.id,
            nombre: participant.nombre,
            foto: participant.foto,
            bosses: participant.bosses,

            pokemon: (participant.pokemon ?? []).map(pokemon => ({
                especie_id: pokemon.especie_id,
                nombre: pokemon.pokemon_especies?.nombre_es ?? null,
                mote: pokemon.mote,
                posicion: pokemon.posicion
            }))
        }))
    }));

    res.json(teams);
});



app.get("/api/teams/:nombre", async (req, res) => {
    const { nombre } = req.params;

    const { data, error } = await supabase
        .from("equipos_locke")
        .select(`
            id,
            nombre,
            vidas,
            participantes (
                id,
                nombre,
                foto,
                bosses,
                pokemon!pokemon_participante_id_fkey (
                    especie_id,
                    mote,
                    posicion,
                    estado,
                    ubicacion,
                    pokemon_especies (
                        nombre_es,
                        nombre_en
                    )
                )
            )
        `)
        .eq("nombre", nombre)
        .eq("participantes.pokemon.estado", "Vivo")
        .eq("participantes.pokemon.ubicacion", "Equipo");

    if (error) {
        console.error(error);
        return res.status(500).json({
            error: "Error obteniendo equipos"
        });
    }

    const teams = data.map(team => ({
        id: team.id,
        nombre: team.nombre,
        vidas: team.vidas,

        participantes: (team.participantes ?? []).map(participant => ({
            id: participant.id,
            nombre: participant.nombre,
            foto: participant.foto,
            bosses: participant.bosses,

            pokemon: (participant.pokemon ?? []).map(pokemon => ({
                especie_id: pokemon.especie_id,
                nombre: pokemon.pokemon_especies?.nombre_es ?? null,
                mote: pokemon.mote,
                posicion: pokemon.posicion
            }))
        }))
    }));

    res.json(teams);
});


app.get("/api/participants/:discord_id", async (req, res) => {

    const { id } = req.params;

    const { data, error } = await supabase
        .from("participantes")
        .select(`
            id,
            discord_id,
            nombre,
            foto,
            equipo_locke_id,
            bosses,
            pokemon!pokemon_participante_id_fkey (
                id,
                especie_id,
                mote,
                estado,
                ubicacion,
                posicion,
                lugar_obtencion,
                metodo_obtencion,
                pokemon_especies (
                    nombre_es,
                    nombre_en
                )
            )
        `)
        .eq("discord_id", id)
        .single();

    if (error) {
        console.error(error);
        return res.status(404).json({
            error: "Participante no encontrado"
        });
    }

    const participant = {
        id: data.id,
        discord_id: data.discord_id,
        nombre: data.nombre,
        foto: data.foto,
        equipo_locke_id: data.equipo_locke_id,
        bosses: data.bosses,

        pokemon: (data.pokemon ?? []).map(pokemon => ({
            id: pokemon.id,
            especie_id: pokemon.especie_id,
            nombre: pokemon.pokemon_especies?.nombre_es ?? null,
            mote: pokemon.mote,
            estado: pokemon.estado,
            ubicacion: pokemon.ubicacion,
            posicion: pokemon.posicion,
            lugar_obtencion: pokemon.lugar_obtencion,
            metodo_obtencion: pokemon.metodo_obtencion
        }))
    };

    res.json(participant);
});


/* app.get("/api/pokemon", async (req, res) => {

    const { data, error } = await supabase
        .from("pokemon")
        .select(`
            id,
            especie_id,
            mote,
            estado,
            ubicacion,
            posicion,
            lugar_obtencion,
            metodo_obtencion,

            pokemon_especies (
                nombre_es,
                nombre_en
            ),

            participantes!pokemon_participante_id_fkey (
                id,
                nombre,
                foto
            ),

            participante_original:participantes!pokemon_participante_original_id_fkey (
                id,
                nombre
            )
        `)
        .order("id", { ascending: true });

    if (error) {
        console.error(error);
        return res.status(500).json({
            error: "Error obteniendo Pokémon"
        });
    }

    const pokemon = data.map(p => ({
        id: p.id,
        especie_id: p.especie_id,
        nombre: p.pokemon_especies?.nombre_es ?? null,
        mote: p.mote,
        estado: p.estado,
        ubicacion: p.ubicacion,
        posicion: p.posicion,

        participante: p.participantes,
        participante_original: p.participante_original
    }));

    res.json(pokemon);
}); */

app.get("/api/pokemon", async (req, res) => {

    // =========================================
    // 1. OBTENER Y VALIDAR PARÁMETROS
    // =========================================

    const page = Number.parseInt(req.query.page, 10) || 1;
    const limit = Number.parseInt(req.query.limit, 10) || 20;

    const participante = req.query.participante;
    const estado = req.query.estado;
    const ubicacion = req.query.ubicacion;

    if (page < 1 || limit < 1 || limit > 100) {
        return res.status(400).json({
            error: "Parámetros de paginación no válidos"
        });
    }

    if (
        participante !== undefined &&
        (!/^\d+$/.test(participante) || Number(participante) <= 0)
    ) {
        return res.status(400).json({
            error: "ID de participante no válido"
        });
    }

    if (estado && !["Vivo", "Muerto"].includes(estado)) {
        return res.status(400).json({
            error: "Estado no válido"
        });
    }

    if (ubicacion && !["Equipo", "Caja"].includes(ubicacion)) {
        return res.status(400).json({
            error: "Ubicación no válida"
        });
    }

    // Calcular rango de paginación
    const from = (page - 1) * limit;
    const to = from + limit - 1;


    // =========================================
    // 2. CONSTRUIR CONSULTA
    // =========================================

    let query = supabase
        .from("pokemon")
        .select(`
            id,
            especie_id,
            mote,
            estado,
            ubicacion,
            posicion,
            lugar_obtencion,
            metodo_obtencion,

            pokemon_especies (
                nombre_es,
                nombre_en
            ),

            participantes!pokemon_participante_id_fkey (
                id,
                nombre,
                foto
            ),

            participante_original:participantes!pokemon_participante_original_id_fkey (
                id,
                nombre
            )
        `, {
            count: "exact"
        })
        .order("id", { ascending: true })
        .range(from, to);


    // =========================================
    // 3. APLICAR FILTROS
    // =========================================

    if (participante) {
        query = query.eq("participante_id", Number(participante));
    }

    if (estado) {
        query = query.eq("estado", estado);
    }

    if (ubicacion) {
        query = query.eq("ubicacion", ubicacion);
    }


    // =========================================
    // 4. EJECUTAR CONSULTA
    // =========================================

    const { data, error, count } = await query;

    if (error) {
        console.error(error);
        return res.status(500).json({
            error: "Error obteniendo Pokémon"
        });
    }


    // =========================================
    // 5. TRANSFORMAR RESULTADOS
    // =========================================

    const pokemon = data.map(p => ({
        id: p.id,
        especie_id: p.especie_id,

        nombre: p.pokemon_especies?.nombre_es ?? null,
        nombre_en: p.pokemon_especies?.nombre_en ?? null,

        mote: p.mote,
        estado: p.estado,
        ubicacion: p.ubicacion,
        posicion: p.posicion,

        lugar_obtencion: p.lugar_obtencion,
        metodo_obtencion: p.metodo_obtencion,

        participante: p.participantes,
        participante_original: p.participante_original
    }));


    // =========================================
    // 6. RESPUESTA
    // =========================================

    res.json({
        pokemon,

        paginacion: {
            pagina_actual: page,
            resultados_por_pagina: limit,
            total_resultados: count,
            total_paginas: Math.ceil(count / limit)
        }
    });

});

app.get("/api/pokemon/filters", async (req, res) => {

    const { data, error } = await supabase
        .from("participantes")
        .select("id, nombre")
        .order("nombre", { ascending: true });

    if (error) {
        console.error(error);
        return res.status(500).json({
            error: "Error obteniendo participantes"
        });
    }

    res.json(data);

});

app.get("/api/participants/:discord_id/pokemon/opciones", async (req, res) => {

    const { discord_id } = req.params;
    const { ubicacion } = req.query;

    // 1. Validar ubicación
    if (!["Equipo", "Caja"].includes(ubicacion)) {
        return res.status(400).json({
            error: "Ubicación no válida"
        });
    }

    // 2. Buscar participante
    const { data: participant, error: participantError } = await supabase
        .from("participantes")
        .select("id")
        .eq("discord_id", discord_id)
        .maybeSingle();

    if (participantError) {
        console.error("Error buscando participante:", participantError);

        return res.status(500).json({
            error: "Error buscando al participante"
        });
    }

    if (!participant) {
        return res.status(404).json({
            error: "Participante no encontrado"
        });
    }

    // 3. Obtener Pokémon disponibles en esa ubicación
    const { data: pokemonData, error: pokemonError } = await supabase
        .from("pokemon")
        .select(`
            id,
            especie_id,
            mote,
            posicion,
            lugar_obtencion
        `)
        .eq("participante_id", participant.id)
        .eq("estado", "Vivo")
        .eq("ubicacion", ubicacion)
        .order("id", { ascending: true })
        .limit(2000);

    if (pokemonError) {
        console.error("Error obteniendo Pokémon:", pokemonError);

        return res.status(500).json({
            error: "Error obteniendo Pokémon"
        });
    }

    // 4. Devolver Pokémon disponibles
    return res.json({
        pokemon: pokemonData
    });
});


/// ===================================
//              POST
//=====================================
app.post("/api/participants/:discord_id/boss", async (req, res) => {

    const { discord_id } = req.params;

    // 1. Buscar participante
    const { data: participant, error: participantError } = await supabase
        .from("participantes")
        .select("id, bosses")
        .eq("discord_id", discord_id)
        .single();

    if (participantError || !participant) {
        return res.status(404).json({
            error: "Participante no encontrado"
        });
    }

    // 2. Incrementar contador
    const { data, error } = await supabase
        .from("participantes")
        .update({
            bosses: participant.bosses + 1
        })
        .eq("id", participant.id)
        .select("bosses")
        .single();

    if (error) {
        console.error(error);
        return res.status(500).json({
            error: "Error actualizando contador de bosses"
        });
    }

    res.json({
        message: "Boss registrado correctamente",
        bosses: data.bosses
    });

});



app.post("/api/participants/:discord_id/death/:slot", async (req, res) => {

    const { discord_id, slot } = req.params;
    const posicion = Number(slot);

    if (!Number.isInteger(posicion) || posicion < 1 || posicion > 6) {
        return res.status(400).json({
            error: "Posición Pokémon no válida"
        });
    }

    // 1. Buscar participante
    const { data: participant, error: participantError } = await supabase
        .from("participantes")
        .select("id, equipo_locke_id")
        .eq("discord_id", discord_id)
        .single();

    if (participantError || !participant) {
        return res.status(404).json({
            error: "Participante no encontrado"
        });
    }

    // 2. Buscar Pokémon en esa posición
    const { data: pokemon, error: pokemonError } = await supabase
        .from("pokemon")
        .select("id, estado, mote")
        .eq("participante_id", participant.id)
        .eq("posicion", posicion)
        .single();

    if (pokemonError || !pokemon) {
        return res.status(404).json({
            error: "No hay ningún Pokémon en esa posición"
        });
    }

    if (pokemon.estado === "Muerto") {
        return res.status(400).json({
            error: "Este Pokémon ya está muerto"
        });
    }

    // 3. Marcar Pokémon como muerto y enviarlo a Caja
    const { error: deathError } = await supabase
        .from("pokemon")
        .update({
            estado: "Muerto",
            ubicacion: "Caja",
            posicion: null
        })
        .eq("id", pokemon.id);

    if (deathError) {
        console.error(deathError);
        return res.status(500).json({
            error: "Error registrando la muerte del Pokémon"
        });
    }

    // 4. Restar una vida al equipo
    const { data: team, error: teamError } = await supabase
        .from("equipos_locke")
        .select("vidas")
        .eq("id", participant.equipo_locke_id)
        .single();

    if (teamError || !team) {
        console.error(teamError);
        return res.status(500).json({
            error: "Error obteniendo el equipo"
        });
    }

    const { error: updateTeamError } = await supabase
        .from("equipos_locke")
        .update({
            vidas: team.vidas - 1
        })
        .eq("id", participant.equipo_locke_id);

    if (updateTeamError) {
        console.error(updateTeamError);
        return res.status(500).json({
            error: "Pokémon marcado como muerto, pero no se pudo descontar la vida"
        });
    }

    res.json({
        message: "Pokémon muerto correctamente",
        pokemon: pokemon.mote,
        posicion: posicion,
        vidas_restantes: team.vidas - 1
    });

});


app.post("/api/participants/:discord_id/pokemon", async (req, res) => {

    const { discord_id } = req.params;

    const {
        especie_id,
        mote = null,
        lugar_obtencion,
        metodo_obtencion
    } = req.body ?? {};

    // 1. Validar datos recibidos
    const especieId = Number(especie_id);

    if (!Number.isInteger(especieId) || especieId <= 0) {
        return res.status(400).json({
            error: "Especie Pokémon no válida"
        });
    }

    if (!lugar_obtencion || !metodo_obtencion) {
        return res.status(400).json({
            error: "Falta el lugar o método de obtención"
        });
    }

    // 2. Buscar participante
    const { data: participant, error: participantError } = await supabase
        .from("participantes")
        .select("id")
        .eq("discord_id", discord_id)
        .single();

    if (participantError || !participant) {
        return res.status(404).json({
            error: "Participante no encontrado"
        });
    }

    // 3. Obtener posiciones ocupadas del equipo
    const { data: teamPokemon, error: pokemonError } = await supabase
        .from("pokemon")
        .select("posicion")
        .eq("participante_id", participant.id)
        .eq("estado", "Vivo")
        .eq("ubicacion", "Equipo");

    if (pokemonError) {
        console.error(pokemonError);
        return res.status(500).json({
            error: "Error obteniendo Pokémon del participante"
        });
    }

    // 4. Buscar primer hueco disponible (1-6)
    const occupiedSlots = new Set(
        teamPokemon.map(pokemon => pokemon.posicion)
    );

    let posicion = null;

    for (let i = 1; i <= 6; i++) {
        if (!occupiedSlots.has(i)) {
            posicion = i;
            break;
        }
    }

    // 5. Determinar ubicación
    const ubicacion = posicion !== null ? "Equipo" : "Caja";

    // 6. Insertar Pokémon
    const { data: newPokemon, error: insertError } = await supabase
        .from("pokemon")
        .insert({
            especie_id: especieId,
            participante_id: participant.id,
            participante_original_id: participant.id,
            mote: mote,
            estado: "Vivo",
            ubicacion: ubicacion,
            posicion: posicion,
            lugar_obtencion: lugar_obtencion,
            metodo_obtencion: metodo_obtencion
        })
        .select()
        .single();

    if (insertError) {
        console.error(insertError);
        return res.status(500).json({
            error: "Error registrando el Pokémon"
        });
    }

    // 7. Respuesta
    res.status(201).json({
        message: "Pokémon registrado correctamente",
        pokemon: newPokemon,
        ubicacion: ubicacion,
        posicion: posicion
    });

});



app.post("/api/participants/:discord_id/pokemon/swap", async (req, res) => {
    const { discord_id } = req.params;
    const { pokemon_equipo_id, pokemon_pc_id } = req.body ?? {};

    const equipoId = Number(pokemon_equipo_id);
    const pcId = Number(pokemon_pc_id);

    // Validar IDs
    if (
        !Number.isInteger(equipoId) || equipoId <= 0 ||
        !Number.isInteger(pcId) || pcId <= 0 ||
        equipoId === pcId
    ) {
        return res.status(400).json({
            error: "Los IDs de los Pokémon no son válidos"
        });
    }

    // Buscar participante
    const { data: participant, error: participantError } = await supabase
        .from("participantes")
        .select("id")
        .eq("discord_id", discord_id)
        .maybeSingle();

    if (participantError) {
        console.error(participantError);
        return res.status(500).json({
            error: "Error buscando al participante"
        });
    }

    if (!participant) {
        return res.status(404).json({
            error: "Participante no encontrado"
        });
    }

    // Ejecutar intercambio mediante RPC
    const { data, error } = await supabase.rpc("swap_pokemon", {
        p_participante_id: participant.id,
        p_pokemon_equipo_id: equipoId,
        p_pokemon_pc_id: pcId
    });

    if (error) {
        console.error(error);

        return res.status(error.code === "P0001" ? 400 : 500).json({
            error: error.message || "Error realizando el intercambio"
        });
    }

    res.json(data);
});

//TODO: Probar
app.post("/api/participants/:discord_id/pokemon/:pokemon_id/to-box", async (req, res) => {
    const { discord_id, pokemon_id } = req.params;

    // Validar ID del Pokémon
    const pokemonId = Number(pokemon_id);

    if (!Number.isInteger(pokemonId) || pokemonId <= 0) {
        return res.status(400).json({
            error: "ID de Pokémon no válido"
        });
    }

    // Buscar participante
    const { data: participant, error: participantError } = await supabase
        .from("participantes")
        .select("id")
        .eq("discord_id", discord_id)
        .maybeSingle();

    if (participantError || !participant) {
        return res.status(404).json({
            error: "Participante no encontrado"
        });
    }

    // Comprobar que el Pokémon pertenece actualmente al participante
    const { data: pokemon, error: pokemonError } = await supabase
        .from("pokemon")
        .select("id, mote, posicion, estado, ubicación")
        .eq("id", pokemonId)
        .eq("participante_id", participant.id)
        .maybeSingle();

    if (pokemonError) {
        console.error(pokemonError);
        return res.status(500).json({
            error: "Error buscando el Pokémon"
        });
    }

    if (!pokemon) {
        return res.status(404).json({
            error: "Pokémon no encontrado para este participante"
        });
    }

    if (pokemon.estado !== "Vivo") {
        return res.status(400).json({
            error: "No se puede mover un Pokémon que no está vivo"
        });
    }

    if (pokemon.ubicación !== "Equipo") {
        return res.status(400).json({
            error: "El Pokémon ya está en la Caja"
        });
    }

    // Mover a la Caja y liberar su posición
    const { data: updatedPokemon, error: updateError } = await supabase
        .from("pokemon")
        .update({
            ubicación: "Caja",
            posicion: null
        })
        .eq("id", pokemonId)
        .eq("participante_id", participant.id)
        .select()
        .single();

    if (updateError) {
        console.error(updateError);
        return res.status(500).json({
            error: "Error enviando el Pokémon a la Caja"
        });
    }

    res.json({
        message: "Pokémon enviado a la Caja correctamente",
        pokemon: updatedPokemon
    });
});

app.post("/api/participants/:discord_id/pokemon/:pokemon_id/to-team", async (req, res) => {
    const { discord_id, pokemon_id } = req.params;

    // Validar ID del Pokémon
    const pokemonId = Number(pokemon_id);

    if (!Number.isInteger(pokemonId) || pokemonId <= 0) {
        return res.status(400).json({
            error: "ID de Pokémon no válido"
        });
    }

    // Buscar participante
    const { data: participant, error: participantError } = await supabase
        .from("participantes")
        .select("id")
        .eq("discord_id", discord_id)
        .maybeSingle();

    if (participantError || !participant) {
        return res.status(404).json({
            error: "Participante no encontrado"
        });
    }

    // Comprobar que el Pokémon pertenece actualmente al participante
    const { data: pokemon, error: pokemonError } = await supabase
        .from("pokemon")
        .select("id, mote, estado, ubicación")
        .eq("id", pokemonId)
        .eq("participante_id", participant.id)
        .maybeSingle();

    if (pokemonError) {
        console.error(pokemonError);
        return res.status(500).json({
            error: "Error buscando el Pokémon"
        });
    }

    if (!pokemon) {
        return res.status(404).json({
            error: "Pokémon no encontrado para este participante"
        });
    }

    if (pokemon.estado !== "Vivo") {
        return res.status(400).json({
            error: "No se puede mover un Pokémon que no está vivo"
        });
    }

    if (pokemon.ubicación !== "Caja") {
        return res.status(400).json({
            error: "El Pokémon ya está en el Equipo"
        });
    }

    // Obtener posiciones ocupadas del equipo
    const { data: teamPokemon, error: teamError } = await supabase
        .from("pokemon")
        .select("posicion")
        .eq("participante_id", participant.id)
        .eq("estado", "Vivo")
        .eq("ubicación", "Equipo");

    if (teamError) {
        console.error(teamError);
        return res.status(500).json({
            error: "Error consultando el equipo"
        });
    }

    // Encontrar primera posición libre
    const occupiedSlots = new Set(
        teamPokemon.map(p => p.posicion)
    );

    let posicion = null;

    for (let i = 1; i <= 6; i++) {
        if (!occupiedSlots.has(i)) {
            posicion = i;
            break;
        }
    }

    // Equipo completo
    if (posicion === null) {
        return res.status(400).json({
            error: "El equipo está completo. Envía primero un Pokémon a la Caja."
        });
    }

    // Mover Pokémon al equipo
    const { data: updatedPokemon, error: updateError } = await supabase
        .from("pokemon")
        .update({
            ubicación: "Equipo",
            posicion: posicion
        })
        .eq("id", pokemonId)
        .eq("participante_id", participant.id)
        .select()
        .single();

    if (updateError) {
        console.error(updateError);
        return res.status(500).json({
            error: "Error incorporando el Pokémon al equipo"
        });
    }

    res.json({
        message: "Pokémon incorporado al equipo correctamente",
        pokemon: updatedPokemon,
        posicion: posicion
    });
});

// ========================================
// Iniciar servidor
// ========================================

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
