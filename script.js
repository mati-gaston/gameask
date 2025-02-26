document.addEventListener("DOMContentLoaded", () => {
    let pantallaActual = document.querySelector(".activa");
    let nombreJugador = "";
    let moduloSeleccionado = "";
    let preguntas = [];
    let preguntaActual = 0;
    let puntaje = 0;
    let ranking = JSON.parse(localStorage.getItem("ranking")) || [];

    function cambiarPantalla(nuevaPantalla) {
        pantallaActual.classList.remove("activa");
        nuevaPantalla.classList.add("activa");
        pantallaActual = nuevaPantalla;
    }

    document.getElementById("btn-comenzar").addEventListener("click", () => {
        nombreJugador = document.getElementById("nombre").value.trim();
        if (nombreJugador !== "") {
            cambiarPantalla(document.getElementById("seleccion-modulo"));
        }
    });

    document.querySelectorAll(".modulo").forEach(boton => {
        boton.addEventListener("click", () => {
            moduloSeleccionado = boton.dataset.modulo;
            cargarPreguntas();
        });
    });

    function cargarPreguntas() {
        fetch("preguntas.json")
            .then(response => response.json())
            .then(data => {
                preguntas = data[moduloSeleccionado] || [];
                preguntaActual = 0;
                puntaje = 0;
                mostrarPregunta();
                cambiarPantalla(document.getElementById("juego"));
            })
            .catch(error => {
                console.error("Error al cargar preguntas:", error);
                alert("Hubo un problema al cargar las preguntas. Intenta nuevamente.");
            });
    }

    function mostrarPregunta() {
        if (preguntaActual < preguntas.length) {
            let pregunta = preguntas[preguntaActual];
            document.getElementById("pregunta").textContent = pregunta.pregunta;
            let opcionesContainer = document.getElementById("opciones");
            opcionesContainer.innerHTML = "";

            let opciones = pregunta.tipo === "VF" ? ["V", "F"] : pregunta.opciones;
            
            opciones.forEach(opcion => {
                let boton = document.createElement("button");
                boton.textContent = opcion;
                boton.classList.add("opcion");
                boton.addEventListener("click", () => verificarRespuesta(opcion, pregunta.respuesta));
                opcionesContainer.appendChild(boton);
            });

            document.getElementById("btn-siguiente").classList.add("oculto");
        } else {
            finalizarJuego();
        }
    }

    function verificarRespuesta(opcionSeleccionada, respuestaCorrecta) {
        if (opcionSeleccionada === respuestaCorrecta) {
            puntaje++;
        }
        preguntaActual++;
        mostrarPregunta();
    }

    function finalizarJuego() {
        ranking.push({ nombre: nombreJugador, puntaje });
        ranking.sort((a, b) => b.puntaje - a.puntaje);
        ranking = ranking.slice(0, 10);
        localStorage.setItem("ranking", JSON.stringify(ranking));

        let listaRanking = document.getElementById("lista-ranking");
        listaRanking.innerHTML = ranking
            .map((jugador, index) => `<li>${index + 1}. ${jugador.nombre} - ${jugador.puntaje} puntos</li>`)
            .join("");

        document.getElementById("mensaje-resultado").textContent = `${nombreJugador}, tu puntaje es: ${puntaje}`;
        cambiarPantalla(document.getElementById("resultado"));
    }

    document.getElementById("btn-reiniciar").addEventListener("click", () => cambiarPantalla(document.getElementById("pantalla-inicio")));

    document.getElementById("btn-ranking").addEventListener("click", () => {
        let listaRanking = document.getElementById("lista-ranking");
        listaRanking.innerHTML = ranking
            .map(jugador => `<li>${jugador.nombre} - ${jugador.puntaje} puntos</li>`)
            .join("");
        cambiarPantalla(document.getElementById("ranking"));
    });

    document.getElementById("btn-volver-inicio").addEventListener("click", () => cambiarPantalla(document.getElementById("pantalla-inicio")));
});
