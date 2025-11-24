const DEBUG = false;

// TODO ENH implementar zoom tablero (requiere externalinterface y actionscript) (original permite arrastrar para mover)
// TODO IMP recuperar partida (si se detecta partida a medias)
// TODO IMP las preguntas originales parecen ser temáticas por área, permitir asignar cada una a un área y dejar algunas comunes
// TODO IMP las preguntas no se deben repetir
// TODO IMP [en lento progreso] extraer lista de preguntas reales
// TODO CHK comprobar qué pasa con el nivel del jugador
// TODO OFX solucionar acumulación de eventos en elemento html. No se añaden con addEventListener y los eventos siguen siendo null, pero están ahí y bloquean el input (onkeydown)
// TODO OFX investigar por qué la página "se ahoga" - parece relacionado con cargar archivos flash, pero no parece culpa de Ruffle
// TODO OFX congelar tablero o desactivar casillas tras comando "c" (falla) y ruleta tras comando "ruleta" (se puede cambiar la selección durante la narración)
// TODO OFX los avanzar el doble son en dos tiempos (minopilla puede cortar el segundo tiempo, y permite cambiar de dirección en cruces)
// TODO OFX congelar música al perder el foco
// TODO TST mantener un ojo sobre la función de guardado y cargado de partidas

// Lo primero precargar las músicas de fondo para que estén listas cuando deben
midiLoad("sonidos/m0.MID");
midiLoad("sonidos/m1.MID");
midiLoad("sonidos/m2.MID");

let niveles = ["Principiante", "Medio", "Avanzado", "Mítico"];
game_status = {nEquipo: 2, personajes: [], jugador: 0, result: 0, ended: false, rondas: 0, sCode: "",
	// personaje: 0, // solo se utiliza en tablero, molesta en lo demás
	casillasActivadas: [],
	onTableroLoad: null,
	muted: false,
};

if (localStorage.getItem("laberyntia_codigo")) game_status.sCode = localStorage.getItem("laberyntia_codigo");

let retos = {}
retos.Roma     = {juego: "roma"    , ayuda: "iroma"    , ganar: "fb1#.webm"  , perder: "f1.webm"  };
retos.Grecia   = {juego: "grecia"  , ayuda: "igrecia"  , ganar: "fb2#.webm"  , perder: "f2.webm"  };
retos.Lasislas = {juego: "LasIslas", ayuda: "ilasislas", ganar: "fb3#.webm"  , perder: "f3#.webm" };
retos.Iberia   = {juego: "Iberia"  , ayuda: "iiberia"  , ganar: "fb4#.webm"  , perder: "f4.webm"  };
retos.Egipto   = {juego: "Egipto"  , ayuda: "iegipto"  , ganar: "fb5#.webm"  , perder: "f5.webm"  };
retos.Final    = {juego: "final"   , ayuda: "ifinal"   , ganar: "fganar.webm", perder: "fmal.webm"};

// TODO seguir extrayendo lista de preguntas reales (Egipto y Grecia tienen que estar casi completos)
let lista_preguntas = [
// SET DE TEST
	//{pregunta: "Pregunta de prueba 1", respuesta1: "Respuesta A (correcta)", respuesta2: "Respuesta B", respuesta3: "Respuesta C", correcta: 1},
	//{pregunta: "Pregunta de prueba 2", respuesta1: "Respuesta A", respuesta2: "Respuesta B (correcta)", respuesta3: "Respuesta C", correcta: 2},
	//{pregunta: "Pregunta de prueba 3", respuesta1: "Respuesta A", respuesta2: "Respuesta B", respuesta3: "Respuesta C (correcta)", correcta: 3},
// SET REAL
// Egipto
	{pregunta: "La moda de las túnicas con pliegues en Egipto...", respuesta1: "fue pasajera", respuesta2: "duró 1500 años", respuesta3: "se impuso copiada a los romanos", correcta: 1},
	{pregunta: "Las flechas de los ejércitos más antiguos de Egipto tenían las puntas de...", respuesta1: "bronce", respuesta2: "sílex", respuesta3: "madera", correcta: 2},
	{pregunta: "Al morir, los egipcios eran...", respuesta1: "quemados", respuesta2: "embalsamados", respuesta3: "arrojados al río", correcta: 2},
	{pregunta: "¿Qué importante innovación, procedente de Oriente Medio, introdujeron los egipcios en su ejército?", respuesta1: "Los elefantes", respuesta2: "Las catapultas", respuesta3: "El carro de combate", correcta: 3},
	{pregunta: "Alejandría fue fundada por...", respuesta1: "Julio César", respuesta2: "Cleopatra", respuesta3: "Alejandro Magno", correcta: 3},
	{pregunta: "¿De qué material eran las faldillas corrientes que llevaban los egipcios?", respuesta1: "Lino", respuesta2: "Algodón", respuesta3: "Papiro", correcta: 1},
	{pregunta: "Las pirámides mejor conservadas son...", respuesta1: "las más antiguas", respuesta2: "las más modernas", respuesta3: "las más pequeñas", correcta: 1},
	{pregunta: "Según el Libro de los Muertos, ¿qué parte del cuerpo pesaba el dios Annubis para saber si el difunto podía entrar en el paraíso?", respuesta1: "El corazón", respuesta2: "El cerebro", respuesta3: "Los pulmones", correcta: 1},
	{pregunta: "¿Qué insecto era venerado por los egipcios?", respuesta1: "El saltamontes", respuesta2: "La mariquita", respuesta3: "El escarabajo", correcta: 3},
	{pregunta: "¿Por qué los ladrillos cocidos, más resistentes y fáciles de decorar, escasean en el antiguo Egipto?", respuesta1: "Porque se los llevaban los saqueadores de tumbas", respuesta2: "Porque eran considerados sagrados", respuesta3: "Porque escaseaba la madera para los hornos", correcta: 3},
	{pregunta: "¿Cuál de estos edificios es el de menor altura?", respuesta1: "La estatua de la Libertad", respuesta2: "La pirámide de Keops", respuesta3: "La torre Eiffel", correcta: 1},
	{pregunta: "¿De qué animal se han encontrado más momias?", respuesta1: "Perro", respuesta2: "Cocodrilo", respuesta3: "Gato", correcta: 3},
	{pregunta: "Si caes en la casilla de El Puerto de Alejandría, ¿dónde aparecerás?", respuesta1: "En la casilla de La Furia de Tritón", respuesta2: "En la casilla de El Moll", respuesta3: "En la casilla de El Vuelo del Fénix", correcta: 2},
	{pregunta: "¿Qué dos alimentos eran básicos en la dieta de un egipcio?", respuesta1: "La patata y la cebolla", respuesta2: "La lechuga y el tomate", respuesta3: "El pan y la cerveza", correcta: 3},
	{pregunta: "¿Quiénes tienen un romántico encuentro en Egipto?", respuesta1: "Marco Antonio y Cleopatra", respuesta2: "Las arañas y las arpías", respuesta3: "Cleopatra y Ulises", correcta: 1},
	{pregunta: "¿Qué es lo que se compra para comer y no se come?", respuesta1: "La sopa", respuesta2: "La cuchara", respuesta3: "La bebida", correcta: 2}, // Posible grupo común
	{pregunta: "¿Dónde puedes ver una estatua de la Dama de Elche?", respuesta1: "En Iberia", respuesta2: "En Roma", respuesta3: "En Egipto", correcta: 1}, // Posible grupo común
	{pregunta: "¿Cuántas puntas tiene la rosa de los vientos de Terra Mítica?", respuesta1: "6", respuesta2: "8", respuesta3: "233", correcta: 2}, // Posible grupo común
	{pregunta: "Con madera de pino, de haya o de nogal construyo los muebles para tu hogar.", respuesta1: "El arquitecto", respuesta2: "El albañil", respuesta3: "El carpintero", correcta: 3}, // Posible grupo común
	//{pregunta: "", respuesta1: "", respuesta2: "", respuesta3: "", correcta: 0},
// Iberia
	{pregunta: "Raza de perro de gran tamaño, los machos pesan alrededor de 75 kg., introducida en España por los fenicios", respuesta1: "Setter irlandés", respuesta2: "Mastín español", respuesta3: "San Bernardo", correcta: 2},
	{pregunta: "¿En qué civilización se encuentra Arriarix?", respuesta1: "Grecia", respuesta2: "Iberia", respuesta3: "Roma", correcta: 1}, // Posible grupo común
	{pregunta: "Si caes en la casilla de El Moll, ¿dónde apareces?", respuesta1: "En la casilla de El Puerto de Alejandría", respuesta2: "En la casilla de La Furia de Tritón", respuesta3: "En la casilla de Akuatiti", correcta: 1},
	{pregunta: "Tierra llana y fértil generalmente regada por un río.", respuesta1: "Páramo", respuesta2: "Llaneza", respuesta3: "Vega", correcta: 3},
	{pregunta: "Las fachadas de las casas de los pueblos solían estar pintadas por fuera de blanco porque...", respuesta1: "es un color muy económico", respuesta2: "es agradable a la vista", respuesta3: "absorbe menos el calor del Sol", correcta: 3},
	{pregunta: "Las tejas de barro cocido y forma curva se conocen como...", respuesta1: "tejas francesas", respuesta2: "tejas morunas", respuesta3: "tejas inglesas", correcta: 2},
	//{pregunta: "", respuesta1: "", respuesta2: "", respuesta3: "", correcta: 0},
// Las Islas
	{pregunta: "Los cretenses pescaban el pulpo en las rocas de la costa con...", respuesta1: "arpones", respuesta2: "cañas de pescar", respuesta3: "con la mano", correcta: 1},
	{pregunta: "¿Cómo se llamaba la esposa del rey griego raptada por Paris, príncipe de Troya?", respuesta1: "Irene", respuesta2: "Sofía", respuesta3: "Helena", correcta: 3}, // También en Egipto
	{pregunta: "En la guerra de troya venció el ejército...", respuesta1: "troyano", respuesta2: "griego", respuesta3: "persa", correcta: 2},
	{pregunta: "En el siglo XIV a.C. la influencia micénica se difundió por todo el mar...", respuesta1: "Mediterráneo", respuesta2: "Egeo", respuesta3: "Jónico", correcta: 2},
	{pregunta: "El legendario rey Minos mandó construir el palacio de...", respuesta1: "Cnosos", respuesta2: "Versalles", respuesta3: "Esmirna", correcta: 1},
	{pregunta: "La cultura cretense se extendió por islas que en la actualidad pertenecen a Grecia y a...", respuesta1: "Francia", respuesta2: "Italia", respuesta3: "Turquía", correcta: 3},
	{pregunta: "¿Qué relación existe entre el nombre de Arthur Evans y Creta?", respuesta1: "Fue el arqueólogo que excavó en Cnosos", respuesta2: "Escribió una novela sobre el Minotauro", respuesta3: "Montó una secta de adoradores del toro", correcta: 1},
	{pregunta: "Si viajaras en la actualidad a las ruinas de Troya, te harías entender en...", respuesta1: "turco", respuesta2: "griego", respuesta3: "italiano", correcta: 1},
	{pregunta: "La civilización minoica se desarrolló en la isla de...", respuesta1: "Chipre", respuesta2: "Creta", respuesta3: "Malta", correcta: 2},
	{pregunta: "¿En qué se basaba la economía de Troya?", respuesta1: "Espectáculos y pasatiempos", respuesta2: "Agricultura, comercio y artesanía", respuesta3: "Minería y piratería", correcta: 2},
	{pregunta: "En la lidia, a los cuernos del toro se les denomina...", respuesta1: "cuernos", respuesta2: "cuernas", respuesta3: "pitones", correcta: 3},
	//{pregunta: "", respuesta1: "", respuesta2: "", respuesta3: "", correcta: 0},
// Roma
	{pregunta: "¿Cuál era el lugar favorito de ocio para los romanos donde, además, practicaban deportes y tomaban baños?", respuesta1: "El estadio", respuesta2: "El anfiteatro", respuesta3: "Las termas", correcta: 3},
	{pregunta: "De Roma se decía que para dormir hacía falta mucho dinero porque...", respuesta1: "el precio de las camas era muy elevado", respuesta2: "se pagaba un impuesto por esta actividad", respuesta3: "sólo una gran casa podía aislarse del ruido", correcta: 3},
	{pregunta: "Una mujer rica romana...", respuesta1: "nunca se arreglaba para salir", respuesta2: "sólo se pintaba los ojos", respuesta3: "necesitaba 3 horas y 4 esclavas para acicalarse", correcta: 3},
	{pregunta: "¿Qué método utilizaban los ricos y los gobernantes para desplazarse rápidamente entre la multitud que atiborraba las calles de Roma?", respuesta1: "Carros tirados por cuatro caballos", respuesta2: "Corrían a pie entre la multitud", respuesta3: "Literas llevadas por cuatro esclavos", correcta: 1},
	{pregunta: "¿Cómo se llamaba el hijo de Julio César y Cleopatra?", respuesta1: "Cesáreo", respuesta2: "Cesarión", respuesta3: "Cleopatro", correcta: 2},
	{pregunta: "Además de ser de familia rica, ¿qué cualidad debía tener un romano para ser admitido en el senado?", respuesta1: "La elocuencia", respuesta2: "La habilidad artística", respuesta3: "La belleza", correcta: 1},
	{pregunta: "¿Qué es el \"triclinium\"?", respuesta1: "Un arma arrojadiza", respuesta2: "Un carro de tres ruedas", respuesta3: "Un sofá para comer", correcta: 3},
	{pregunta: "¿Cuál de estas atracciones no pertenece a la civilización de Roma?", respuesta1: "Magnus Colossus", respuesta2: "El vuelo del Feníx", respuesta3: "Arietes", correcta: 3},
	{pregunta: "¿Qué son las bacanales?", respuesta1: "Periodo vacacional en la Roma antigua", respuesta2: "Tribu de mujeres de los Montes Balcanes", respuesta3: "Fiestas en honor del dios Baco", correcta: 3},
	{pregunta: "Película famosa de los años 60, donde se narran las peripecias de un gladiador:", respuesta1: "Gladiator", respuesta2: "Espartaco", respuesta3: "Viriato", correcta: 2},
	{pregunta: "¿Qué es una sibila?", respuesta1: "Una esclava", respuesta2: "Una adivina", respuesta3: "Un tipo de flauta", correcta: 2},
	{pregunta: "Con la cara muy pintada hago reír a la chiquillada", respuesta1: "El faraón", respuesta2: "El payaso", respuesta3: "Barbarroja", correcta: 2}, // Posible grupo común
	{pregunta: "Es un sabio gordinflón que si le preguntan no habla. ¿Qué es?", respuesta1: "El diccionario", respuesta2: "El oráculo", respuesta3: "El conocimiento", correcta: 1}, // Posible grupo común
	//{pregunta: "", respuesta1: "", respuesta2: "", respuesta3: "", correcta: 0},
// Grecia
	{pregunta: "En los Juegos Olímpicos al ganador se le coronaba con hojas de...", respuesta1: "laurel", respuesta2: "hinojo", respuesta3: "olivo", correcta: 3},
	{pregunta: "Durante la celebración de los Juegos, los griegos...", respuesta1: "continuaban combatiendo en sus guerras", respuesta2: "pactaban una tregua", respuesta3: "incrementaban los combates", correcta: 2},
	{pregunta: "¿De qué color son las mangas del chaleco rojo del Minotauro?", respuesta1: "Rojas", respuesta2: "No tiene mangas", respuesta3: "Gris marengo", correcta: 2},
	{pregunta: "Los púgiles griegos luchaban...", respuesta1: "con los puños desnudos", respuesta2: "atándose en la mano una tira de cuero", respuesta3: "con guantes", correcta: 2},
	{pregunta: "¿Qué pueblo, enemigo de los griegos, fue derrotado por el hijo de Filipo en el siglo IV a.C.?", respuesta1: "Los persas", respuesta2: "Los egipcios", respuesta3: "Los aztecas", correcta: 1},
	{pregunta: "Asclepio era, según la mitología griega, dios de...", respuesta1: "la guerra", respuesta2: "la medicina", respuesta3: "el mar", correcta: 2},
	{pregunta: "¿Quién reconstruyó la Acrópolis de Atenas?", respuesta1: "Agamenón", respuesta2: "Pericles", respuesta3: "Alejandro Magno", correcta: 2},
	{pregunta: "En el entrenamiento de los guerreros espartanos se incluía...", respuesta1: "el canto", respuesta2: "la danza", respuesta3: "el teatro", correcta: 2},
	{pregunta: "Los atletas griegos corrían desnudos...", respuesta1: "por el calor", respuesta2: "por no tener ropa", respuesta3: "para pesar menos", correcta: 3},
	{pregunta: "¿Qué eran las amazonas?", respuesta1: "Sacerdotisas del templo", respuesta2: "Habitantes del amazonas", respuesta3: "Mujeres guerreras", correcta: 3},
	{pregunta: "¿A quién emulas en la atracción del Laberinto del Minotauro?", respuesta1: "A Teseo", respuesta2: "A Telémaco", respuesta3: "Al minotauro", correcta: 1},
	{pregunta: "¿Qué es la aristocracia?", respuesta1: "Gobierno de los nobles", respuesta2: "Gobierno del pueblo", respuesta3: "Gobierno de los sacerdotes", correcta: 1},
	{pregunta: "¿Qué significa oligarquía?", respuesta1: "Gobierno de los aceiteros", respuesta2: "Gobierno de unos pocos", respuesta3: "Gobierno de los esclavos", correcta: 2},
	{pregunta: "El declive griego comenzó a partir de la muerte de...", respuesta1: "Pericles", respuesta2: "Alejandro Magno", respuesta3: "Agamenón", correcta: 2},
	{pregunta: "Si caes en la casilla de La Furia de Tritón, ¿dónde aparecerás?", respuesta1: "En la casilla de El Moll", respuesta2: "En la casilla de El tren Bravo", respuesta3: "En la casilla de Los Rápidos de Argos", correcta: 3},
	{pregunta: "¿Quiénes eran Esquilo, Sófocles y Eurípides?", respuesta1: "Un trío musical", respuesta2: "Gobernantes de un triunvirato", respuesta3: "Autores de tragedias griegas", correcta: 3},
	{pregunta: "Bramido a bramido, antes de las tormentas todos lo hemos oído.", respuesta1: "El relámpago", respuesta2: "El trueno", respuesta3: "El cuervo", correcta: 2}, // Posible grupo común
	{pregunta: "El que la tenga que la atienda y si no es mejor que la venda.", respuesta1: "Las sandalias", respuesta2: "La tienda", respuesta3: "La mascota", correcta: 2}, // Posible grupo común
	{pregunta: "Sin ser rica tengo cuartos y a pesar de que no como, a veces estoy llena", respuesta1: "El monedero", respuesta2: "La luna", respuesta3: "La estrella", correcta: 2}, // Posible grupo común
	{pregunta: "De día llenos de carne, de noche con la boca al aire", respuesta1: "Las lentejas", respuesta2: "El canelón", respuesta3: "Los zapatos", correcta: 3}, // Posible grupo común
	{pregunta: "Tengo agujas y no sé coser, tengo números y no sé leer. ¿Quién soy?", respuesta1: "El erizo", respuesta2: "La luna", respuesta3: "El reloj", correcta: 3}, // La 3a opción originalmente era "El reloj de arena" // Posible grupo común
	{pregunta: "Del cielo viene, a unos disgusta y a otros mantiene.", respuesta1: "Las nubes", respuesta2: "La lluvia", respuesta3: "La nieve", correcta: 2}, // Posible grupo común
	//{pregunta: "¿Dónde puedes encontrarte con el ballet Terra Mítica?", respuesta1: "En Egipto", respuesta2: "En Grecia", respuesta3: "En Roma", correcta: 0}, // No es la 3. Posiblemente la 2. Desconocida/desfasada // Posible grupo común 
	//{pregunta: "", respuesta1: "", respuesta2: "", respuesta3: "", correcta: 0},
// SET PERSONALIZADO
	//{pregunta: "¿Cuál de las siguientes atracciones desapareció antes de Terra Mítica?", respuesta1: "Los Secretos de los Dioses", respuesta2: "El Misterio de Keops", respuesta3: "El Rescate de Ulises", correcta: 1},
	//{pregunta: "¿Cómo se llamaba la actual Titánide cuando estaba en la zona de Iberia?", respuesta1: "Titánide (igual)", respuesta2: "Tizona", respuesta3: "Colada", correcta: 2},
	//{pregunta: "¿Bajo qué monumento egipcio se accede a Terra Mítica?", respuesta1: "La Pirámide de Keops", respuesta2: "El Faro de Alejandría", respuesta3: "La Puerta de Karnak", correcta: 3},
	//{pregunta: "¿En qué zona de Terra Mítica se encuentra el área de piscinas?", respuesta1: "Roma", respuesta2: "Iberia", respuesta3: "Las Islas", correcta: 2},
	//{pregunta: "¿Cómo se llama el espectáculo más longevo del parque?", respuesta1: "Barbarroja", respuesta2: "Arde Troya", respuesta3: "El Torneo", correcta: 3},
	//{pregunta: "¿En las colas de qué antigua atracción se desarrolla Arde Troya?", respuesta1: "El Rescate de Ulises", respuesta2: "Magnus Colossus", respuesta3: "Los Secretos de los Dioses", correcta: 1},
];

let start = {}
start.window = document.querySelector("#start");
start.button = start.window.querySelector("div.start_btn");
start.notesbtn = start.window.querySelector("div.notes_btn");
start.notes = {};
start.notes.window = start.window.querySelector("div.notes");
start.notes.links = start.notes.window.querySelectorAll("a");

let intro = {};
intro.window = document.querySelector("#intro");
intro.video = intro.window.querySelector("video");
intro.load = function (video_src) {
	start.window.classList.add("hidden");
	game.stop();
	intro.window.classList.remove("hidden");
	intro.video.pause();
	intro.video.currentTime = 0;
	intro.video.src = "videos/" + video_src;
	intro.video.play();
}
intro.stop = function () {
	intro.window.classList.add("hidden");
	intro.video.pause();
	intro.video.src = "";
}

let game = {};
game.window = document.querySelector("#game_window");
game.background = game.window.querySelector(".background");
game.codigo = game.window.querySelector("#codigo");
game.flash = game.window.querySelector("#flash");
game.loadScene = function (swf) {
	let bkg = "f0";
	let music = null;
	switch (swf) {
		case "MenuPrincipal":
			bkg = "f0";
			music = "m0";
			break;
		case "MenuJuego":
			bkg = "f23";
			music = "m1";
			break;
		case "_nueva":
			bkg = "f1";
			swf = null;
			music = "m2";
			break;
		case "tablero":
		case "dado":
		case "preguntas":
		case "ruleta":
			bkg = "f22";
			music = "m1";
			break;
		case "_reto":
			bkg = "f22";
			if (game_status.reto_actual) {
				swf = retos[game_status.reto_actual].juego;
			} else {
				game.loadScene("tablero");
				return;
			}
			music = null;
			break;
		case "_ayuda":
		case "_ireto":
			bkg = "f22";
			if (game_status.reto_actual) {
				swf = retos[game_status.reto_actual].ayuda;
			} else {
				game.loadScene("tablero");
				return;
			}
			music = null;
			break;
		case "Codigo":
			bkg = "f0";
			music = "m0";
			break;
		case "Recuperar":
			bkg = "f0";
			music = "m0";
		default:
			console.error("Solicitada carga de escena desconocida");
			return;
	}
	game.load(bkg,swf);
	if (music) {
		if (currentMidi() != "sonidos/" + music + ".MID") { // Si ya está la misma música, no reiniciarla
			midiLoad("sonidos/" + music + ".MID",true);
			if (game_status.muted) midiPause();
		}
	} else {
		midiStop();
	}
}
game.load = function (bkg, swf) {
	start.window.classList.add("hidden");
	intro.stop();
	game.window.classList.remove("hidden");
	game.video.stop();
	game.ui.stop();
	game.nueva.stop();
	game.codigo.classList.add("hidden");
	game.flash.classList.remove("hidden");
	if (bkg == "f0" || bkg == "f1") {
		game.flash.classList.add("big");
	} else {
		game.flash.classList.remove("big");
	}
	switch (bkg) {
		case "f21":
		case "f22":
		case "f23":
			game.ui.load(swf);
			break;
		case "f1":
			game.nueva.load();
			game.flash.classList.add("hidden");
			break;
		case "f0":
			if (game_status.sCode) {
				game.codigo.classList.remove("hidden");
				game.codigo.querySelector("#secreto").innerText = game_status.sCode;
			}
			break;
	}

	if (swf == "tablero") game_status.personaje = game_status.jugador;
	else delete game_status.personaje; // Necesario para tablero, molesta para lo demás

	if (swf == "final") game_status.vida = game_status.personajes[game_status.jugador].vida;
	else delete game_status.vida; // Necesario para reto final, puede molestar para lo demás

	game.background.src = "imagenes/" + bkg + ".bmp";
	if (swf != null) {
		if (ruffle_player != null && ruffle_player.ruffle().loadedConfig.url == "data/" + swf + ".swf" && swf == "tablero") {
			callExternalInterface("cambiarJugador",game_status.jugador);
			initTablero();
			if (typeof game_status.onTableroLoad !== 'undefined' && game_status.onTableroLoad != null) game_status.onTableroLoad();
			game_status.onTableroLoad = null;
		} else {
			load_ruffle(swf != null ? "data/" + swf + ".swf" : null, game_status);
		}
	}
}
game.stop = function () {
	midiStop();
	game.window.classList.add("hidden");
}

game.nueva = {};
game.nueva.window = game.window.querySelector(".new_game");
game.nueva.comenzar = game.nueva.window.querySelector(".comenzar");
game.nueva.back = game.nueva.window.querySelector(".back");
game.nueva.form = {};
game.nueva.form.elements = [];
let player_form_template = document.querySelector("#player_form_template");
for (let i = 0; i < 6; i++) {
	// Clone the new element and insert it into the page
	let player_form = player_form_template.content.cloneNode(true);
	player_form.querySelector("input").addEventListener("input", (e) => game.nueva.form.check());
	game.nueva.window.querySelector(".player_forms").appendChild(player_form);
	game.nueva.form.elements.push(game.nueva.window.querySelector(".player_forms .player_form:last-child"));
}
game.nueva.form.reset = function () {
	for (let i = 0; i < game.nueva.form.elements.length; i++) {
		game.nueva.form.elements[i].querySelector("input").value = "";
		game.nueva.form.elements[i].querySelector("select").value = "2";
	}
	game.nueva.comenzar.setAttribute("invalid","");
}
game.nueva.form.check = function () {
	ok = false;
	for (let i = 0; i < game.nueva.form.elements.length; i++) {
		if (game.nueva.form.elements[i].querySelector("input").value)
			ok = true;
	}
	if (ok) {
		game.nueva.comenzar.removeAttribute("invalid");
	} else {
		game.nueva.comenzar.setAttribute("invalid","");
	}
	return ok;
}
game.nueva.form.comenzar = function () {
	if (!game.nueva.form.check()) return;
	for (let i = 0; i < game.nueva.form.elements.length; i++) {
		let nombre = game.nueva.form.elements[i].querySelector("input").value;
		let nivel = game.nueva.form.elements[i].querySelector("select").value;
		if (nombre) {
			crearPersonaje(i,nombre,nivel);
		} else {
			game_status.personajes[i] = null;
		}
		crearPersonaje(6,"Minotauro",4);
	}
	game_status.jugador = -1;
	loadNextPlayer();
}
game.nueva.load = function () {
	game.nueva.window.classList.remove("hidden");
	game.nueva.form.reset();
}
game.nueva.stop = function () {
	game.nueva.window.classList.add("hidden");
}

game.ui = {};
game.ui.window = game.window.querySelector(".game_ui");
game.ui.nombre = game.ui.window.querySelector(".nombre");
game.ui.nivel = game.ui.window.querySelector(".nivel");
game.ui.lugar = game.ui.window.querySelector(".lugar");
game.ui.personaje = game.ui.window.querySelector(".personaje");
game.ui.medallon = {};
game.ui.medallon.base = game.ui.window.querySelector(".medallon");
game.ui.medallon.Roma = game.ui.medallon.base.querySelector(".roma");
game.ui.medallon.Grecia = game.ui.medallon.base.querySelector(".grecia");
game.ui.medallon.Lasislas = game.ui.medallon.base.querySelector(".islas");
game.ui.medallon.Iberia = game.ui.medallon.base.querySelector(".iberia");
game.ui.medallon.Egipto = game.ui.medallon.base.querySelector(".egipto");
game.ui.minoRnd = game.ui.window.querySelector(".minoRnd");
game.ui.minoRndTxt = game.ui.window.querySelector(".minoRndTxt");
game.ui.volumen = game.ui.window.querySelector(".volumen");
game.ui.volumen.classList.add("hidden");
game.ui.vida = game.ui.window.querySelector(".vida");
game.ui.fenix = game.ui.window.querySelector(".fenix");
game.ui.zoom = game.ui.window.querySelector(".zoom");
game.ui.back = game.ui.window.querySelector(".back");
game.ui.load = function (swf) {
	game.ui.window.classList.remove("hidden");
	game.ui.nombre.innerText = game_status.personajes[game_status.jugador].nombre;
	game.ui.nivel.innerText = niveles[game_status.personajes[game_status.jugador].nivel - 1];
	game.ui.lugar.innerText = calcularLugar(game_status.personajes[game_status.jugador].casilla);
	game.ui.personaje.classList.remove("pr0", "pr1", "pr2", "pr3", "pr4", "pr5", "pr6");
	game.ui.personaje.classList.add("pr" + game_status.jugador);
	game.ui.medallon.Roma.classList.add("hidden");
	game.ui.medallon.Grecia.classList.add("hidden");
	game.ui.medallon.Lasislas.classList.add("hidden");
	game.ui.medallon.Iberia.classList.add("hidden");
	game.ui.medallon.Egipto.classList.add("hidden");
	if (game_status.personajes[game_status.jugador].medallon.Roma) game.ui.medallon.Roma.classList.remove("hidden");
	if (game_status.personajes[game_status.jugador].medallon.Grecia) game.ui.medallon.Grecia.classList.remove("hidden");
	if (game_status.personajes[game_status.jugador].medallon.Lasislas) game.ui.medallon.Lasislas.classList.remove("hidden");
	if (game_status.personajes[game_status.jugador].medallon.Iberia) game.ui.medallon.Iberia.classList.remove("hidden");
	if (game_status.personajes[game_status.jugador].medallon.Egipto) game.ui.medallon.Egipto.classList.remove("hidden");
	game.ui.volumen.classList.remove("muted")
	if (game_status.muted) game.ui.volumen.classList.add("muted");
	let vida = game_status.personajes[game_status.jugador].vida;
	game.ui.vida.innerText = vida;
	game.ui.medallon.base.classList.remove("hidden");
	// Valores de fx extraídos del juego
	//  1 <= vida <=    6 -> fx1
	//  7 <= vida <=   12 -> fx2
	// 13 <= vida <=   18 -> fx3
	// 19 <= vida <=   24 -> fx4
	// 25 <= vida <= 1000 -> fx5
	game.ui.fenix.classList.remove("hidden", "fx1", "fx2", "fx3", "fx4", "fx5");
	let fxLevel = 1;
	if (vida >  6) fxLevel = 2;
	if (vida > 12) fxLevel = 3;
	if (vida > 18) fxLevel = 4;
	if (vida > 24) fxLevel = 5;
	game.ui.fenix.classList.add("fx" + fxLevel);
	game.ui.zoom.classList.add("hidden");
	game.ui.back.classList.add("hidden");
	game.ui.minoRnd.classList.add("hidden");
	game.ui.minoRndTxt.innerText = game_status.rondas;
	if (game_status.jugador == 6) {
		game.ui.medallon.base.classList.add("hidden");
		game.ui.fenix.classList.add("hidden");
		game.ui.minoRnd.classList.remove("hidden");
	}
	if (swf && swf == "tablero") game.ui.zoom.classList.remove("hidden");
	if (swf && swf == "tablero") game.ui.back.classList.remove("hidden");
	//if (swf && game_status.reto_actual && swf == retos[game_status.reto_actual].juego) game.ui.back.classList.remove("hidden");
}
game.ui.stop = function () {
	game.ui.window.classList.add("hidden");
}

game.video = {};
game.video.window = game.window.querySelector(".video");
game.video.player = game.video.window.querySelector("video");
game.video.load = function (video_src) {
	midiStop();
	if (DEBUG) console.log("Load game video: " + video_src);
	game.video.window.classList.remove("hidden");
	game.video.player.src = "videos/" + video_src;
	game.video.player.play();
	game.flash.classList.add("hidden");
	game.ui.load();
	if (ruffle_player != null) ruffle_player.ruffle().suspend();
}
game.video.stop = function () {
	game.video.window.classList.add("hidden");
	game.flash.classList.remove("hidden");
	game.video.player.pause();
	if (ruffle_player != null) ruffle_player.ruffle().resume();
}

game.audio = {};
game.audio.player = game.window.querySelector("audio.audio");
game.audio.load = function (audio_src) {
	if (DEBUG) console.log("Load game audio: " + audio_src);
	game.audio.player.src = "sonidos/" + audio_src;
	game.audio.player.play();
}
game.audio.stop = function () {
	game.audio.player.pause();
}

intro.window.classList.add("hidden");
game.window.classList.add("hidden");

start.button.addEventListener("click", () => {
	intro.load("intro.webm");
});
if (DEBUG) {
	start.notesbtn.innerText = "Partida predefinida";
	start.notesbtn.addEventListener("click", () => {
		debugPartidaPredefinida();
	});
} else {
	start.notesbtn.addEventListener("click", () => {
		start.notes.window.classList.remove("hidden");
	});
}
start.notes.window.classList.add("hidden");
start.notes.window.addEventListener("click", () => {
	start.notes.window.classList.add("hidden");
});
start.notes.links.forEach( (elem) => {
	elem.target = "_blank";
	elem.addEventListener("click", (e) => {
		e.stopImmediatePropagation();
		return true;
	});
});


function finIntro () {
	if (intro.video.currentTime < 1) return; // Arregla "salir.webm", que salta inmediatamente por algún motivo
	if (intro.video.src.endsWith("intro.webm")) {
		game.loadScene("MenuPrincipal");
	} else if (intro.video.src.endsWith("fganar.webm")) {
		game.loadScene("Codigo");
	} else if (intro.video.src.endsWith("salir.webm") || intro.video.src.endsWith("adeu.webm")) {
		if (history.length > 1) history.back(); else window.close();
	} else {
		console.error("Unknown video: " + intro.video.src);
	}
}
intro.window.addEventListener("click",() => {finIntro();});
intro.video.addEventListener("ended",() => {finIntro();});

game.nueva.comenzar.addEventListener("click", () => {
	game.nueva.form.comenzar();
});
game.nueva.back.addEventListener("click", () => {
	game.loadScene("MenuPrincipal");
});

game.ui.volumen.addEventListener("click", () => {
	if (game_status.muted) {
		game_status.muted = false;
		game.ui.volumen.classList.remove("muted");
		midiResume();
		game.video.player.muted = false;
		game.audio.player.muted = false;
		ruffle_player.ruffle().volume = 1.0;
	} else {
		game_status.muted = true;
		game.ui.volumen.classList.add("muted");
		midiPause();
		game.video.player.muted = true;
		game.audio.player.muted = true;
		ruffle_player.ruffle().volume = 0.0;
	}
});

game.ui.zoom.addEventListener("click", () => {
	// TODO implementar zoom de tablero
	ruffle_player.ruffle().displayMessage("Disponible en próximas actualizaciones");
});

game.ui.back.addEventListener("click", () => {
	if (game_status.loadTableroTimeout) {
		clearTimeout(game_status.loadTableroTimeout);
		game_status.loadTableroTimeout = null;
	}
	game.loadScene("MenuJuego");
});

game.video.player.addEventListener("click", () => {
	game.video.stop();
});
game.video.player.addEventListener("ended", () => {
	game.video.stop();
});

let ruffle_player = null;
function load_ruffle (url, flashvars) {
	/*if (ruffle_player != null) {
		ruffle_player.remove();
		ruffle_player = null;
		setTimeout(load_ruffle(url,flashvars),500);
		return;
	}*/

	if (url == null) {
		return;
	}

	if (ruffle_player) {
		// TODO comprobar cómo limpiar correctamente la instancia que se cierra al cargar películas nuevas
		ruffle_player.remove();
	}

	let ruffle = window.RufflePlayer.newest();
	ruffle_player = ruffle.createPlayer();
	ruffle_player.config = {
		"allowScriptAccess": true,
		"contextMenu": "off",
		"autoplay": "on",
		"preferredRenderer": "webgl",
		"unmuteOverlay": "hidden",
		"splashScreen": false,
		"playerRuntime": "flashPlayer",
		"logLevel": DEBUG ? "info" : "error",
	};
	document.getElementById("flash").innerHTML = "";
	document.getElementById("flash").appendChild(ruffle_player);
	ruffle_player.ruffle().addFSCommandHandler(fsCommand);

	ruffle_player.ruffle().load({
		url: url,
		parameters: flashvars,
	});

	ruffle_player.addEventListener('loadedmetadata', () => {
		if (game_status.muted) ruffle_player.ruffle().volume = 0.0;
		if (DEBUG) console.log("\n\n\nRUFFLE ENDED LOADING - Ready?: " + ruffle_player.ruffle().readyState + "\n\n\n");
		if (DEBUG) console.info(ruffle_player.ruffle().metadata);
	});
}

function crearPersonaje (num,nombre,nivel) {
	game_status.personajes[num] = {};
	game_status.personajes[num].id = num;
	game_status.personajes[num].nombre = nombre;
	game_status.personajes[num].nivel = nivel;
	game_status.personajes[num].medallon = {};
	game_status.personajes[num].vida = 3;
	game_status.personajes[num].casilla = 0;
	if (num == 6) game_status.personajes[num].casilla = 49; // Minotauro
	game_status.personajes[num].proxima = "";
}

function initTablero () {
	game_status.personajes.forEach( (elem) => {
		if (elem != null) {
			callExternalInterface("initPersonaje",elem.id,elem.casilla);
		}
	});
	if (game_status.casillasActivadas && game_status.casillasActivadas.length > 0) {
		for (var i = 0; i < game_status.casillasActivadas.length; i++) {
			callExternalInterface("activarCasilla",game_status.casillasActivadas[i]);
		}
	}
}

function preguntas (id_pregunta) {
	if (typeof id_pregunta === 'undefined' || id_pregunta < 0 || id_pregunta >= lista_preguntas.length) {
		id_pregunta = Math.floor(Math.random() * lista_preguntas.length);
	}
	game_status.pregunta   = lista_preguntas[id_pregunta].pregunta;
	game_status.respuesta1 = lista_preguntas[id_pregunta].respuesta1;
	game_status.respuesta2 = lista_preguntas[id_pregunta].respuesta2;
	game_status.respuesta3 = lista_preguntas[id_pregunta].respuesta3;
	game_status.correcta   = lista_preguntas[id_pregunta].correcta;
	game.loadScene("preguntas");
}

function vida (cambio,origen) {
	var loadVideo = function () {
		game_status.personajes[game_status.jugador].vida += cambio;
		if (game_status.personajes[game_status.jugador].vida < 0) game_status.personajes[game_status.jugador].vida = 0;
		videoNextPlayer("fxg" + cambio + ".webm");
	}
	audio("fxg" + cambio + (origen == "ruleta" ? "a" : "") + ".wav",loadVideo);
}

function audio (audio_src,next) {
	var onAudioFinished = function () {
		game.audio.player.removeEventListener("ended", onAudioFinished);
		next();
	}
	game.audio.player.addEventListener("ended", onAudioFinished);
	game.audio.load(audio_src);
}

function video (video_src,next) {
	var onVideoFinished = function () {
		game.video.player.removeEventListener("pause", onVideoFinished);
		game.video.player.removeEventListener("ended", onVideoFinished);
		next();
	}
	game.video.player.addEventListener("pause", onVideoFinished); // Si el vídeo se salta con click
	game.video.player.addEventListener("ended", onVideoFinished);
	game.video.load(video_src);
}

function videoNextPlayer (video_src) {
	video(video_src,loadNextPlayer);
}

const casillasColindantes = {
	// Los cruces se ordenan para dar la prioridad observada en el juego a la ruta del minotauro, el resto da igual pero en principio van en orden
	// En realidad el minotauro del juego original no sigue exacta esta ruta, pero esta está más balanceada y es más fácil de implementar
	 0: [ 7],
	 1: [50, 2],  2: [ 1, 3],  3: [ 2, 4],  4: [ 5,30, 3],  5: [ 4, 6],  6: [ 5, 7]   ,  7: [ 6, 8],  8: [ 7, 9],  9: [ 8,10], 10: [ 9,11],
	11: [10,12], 12: [11,13], 13: [12,14], 14: [13,21,15], 15: [14,16], 16: [15,17]   , 17: [16,18], 18: [17,19], 19: [18,20], 20: [19,31],
	21: [14,22], 22: [21,23], 23: [22,24], 24: [23,25]   , 25: [24,26], 26: [29,27,25], 27: [26,28], 28: [27,35], 29: [26,30], 30: [29, 4],
	31: [20,32], 32: [31,33], 33: [32,34], 34: [36,33,35], 35: [28,34], 36: [34,37]   , 37: [36,38], 38: [37,39], 39: [38,40], 40: [39,41],
	41: [40,42], 42: [41,43], 43: [42,44], 44: [43,45]   , 45: [44,46], 46: [45,47]   , 47: [46,48], 48: [47,49], 49: [48,50], 50: [49, 1],
};

function loadNextPlayer () {
	game_status.jugador++;
	while (game_status.jugador < 6 && (game_status.personajes[game_status.jugador] == null || game_status.personajes[game_status.jugador].proxima == "saltar")) {
		if (game_status.personajes[game_status.jugador] != null && game_status.personajes[game_status.jugador].proxima == "saltar") game_status.personajes[game_status.jugador].proxima = "";
		game_status.jugador++;
		if (game_status.jugador == 6) break; // Minotauro
	}
	if (game_status.jugador == 7) {
		game_status.jugador = 0;
	}
	while (game_status.jugador < 6 && (game_status.personajes[game_status.jugador] == null || game_status.personajes[game_status.jugador].proxima == "saltar")) {
		if (game_status.personajes[game_status.jugador] != null && game_status.personajes[game_status.jugador].proxima == "saltar") game_status.personajes[game_status.jugador].proxima = "";
		game_status.jugador++;
	}
	if (game_status.jugador == 0) game_status.rondas++;
	loadPlayer();
}
function loadPlayer () {
	if (game_status.jugador != 6) {
		game_status.onTableroLoad = () => {
			game_status.loadTableroTimeout = setTimeout( () => {
				game_status.loadTableroTimeout = null;
				game.loadScene("dado");
			}, 2500);
		};
	} else { // Minotauro - mover automáticamente
		game_status.onTableroLoad = () => {
			game.ui.back.classList.add("hidden");
			game_status.loadTableroTimeout = setTimeout( () => {
				game_status.loadTableroTimeout = null;
				let move = 0;
				let rnd = Math.random() * 3;
				if (rnd >= 0.0) move = 1; // prob 1/6
				if (rnd >= 0.5) move = 2; // prob 1/3
				if (rnd >= 1.5) move = 3; // prob 1/3
				if (rnd >= 2.5) move = 4; // prob 1/6
				for (let i = move; i > 0; i--) {
					let actual = game_status.personajes[6].casilla;
					let anterior = typeof game_status.personajes[6].casillaAnterior !== 'undefined' && game_status.personajes[6].casillaAnterior != null ? game_status.personajes[6].casillaAnterior : 0;
					let colindantes = casillasColindantes[actual];
					let idNueva = (colindantes.findIndex( (element) => element == anterior) + 1) % colindantes.length;
					game_status.personajes[6].casillaAnterior = actual;
					game_status.personajes[6].casilla = colindantes[idNueva];
				}
				callExternalInterface("moverACasilla",game_status.personajes[6].casilla);
				//setTimeout( () => loadNextPlayer(), 5000);
			}, 2500);
		};
	}
	game.loadScene("tablero");
}
function reanudarTurno () {
	if (game_status.reto_actual) {
		game.loadScene("_reto");
	} else if (game_status.pregunta) {
		game.loadScene("preguntas");
	} else if (game_status.result) {
		calcularCasillasActivadas();
		game.loadScene("tablero");
	} else {
		loadPlayer();
	}
}

function calcularCasillasActivadas () {
	let casillaActual = game_status.personajes[game_status.jugador].casilla;
	let tiradaActual = game_status.result;
	game_status.casillasActivadas = [];
	function calcularUnaCasilla (casillaCalculada,casillaAnterior,tiradaRestante) {
		if (tiradaRestante < 0) return;
		if (tiradaRestante == 0) {
			game_status.casillasActivadas.push(casillaCalculada);
			return;
		}
		let colindantes = casillasColindantes[casillaCalculada];
		for (let j = 0; j < colindantes.length; j++) {
			if (colindantes[j] != casillaAnterior) {
				calcularUnaCasilla(colindantes[j],casillaCalculada,tiradaRestante-1);
			}
		}
	}
	calcularUnaCasilla(casillaActual,-1,tiradaActual);
}

var calcularLugar = function (num) {
	let lugar = "";
	if (num <= 50) lugar = "Grecia";
	if (num <= 40) lugar = "Roma";
	if (num <= 30) lugar = "Las islas";
	if (num <= 20) lugar = "Iberia";
	if (num <= 10) lugar = "Egipto";
	return lugar;
}

function activarCasilla (num) {
	if (game_status.jugador == 6) { // Minotauro
		let hayMinopilla = false;
		for (let i = 0; i < 6; i++) {
			if (game_status.personajes[i] != null && game_status.personajes[i].casilla == game_status.personajes[6].casilla) {
				minopilla(i);
				hayMinopilla = true;
			}
		}
		if (!hayMinopilla) {// Si ha habido minopilla, este se encarga de pasar de jugador
			setTimeout( () => loadNextPlayer(), 5000);
		}
		return;
	}
	audio("c" + num + ".wav",() => {jugarCasilla(parseInt(num));});
}
function minopilla (jugador) {
	let medallon = game_status.personajes[jugador].medallon;
	if (medallon.Roma && medallon.Grecia && medallon.Lasislas && medallon.Iberia && medallon.Egipto) {
		// PRUEBA Final
		game_status.reto_actual = "Final";
		if (game_status.personajes[jugador].vida > 0)
			game.loadScene("_reto");
		else
			fsCommand("Fin","Perder"); // Aunque el original te deja arrancar el juego, vamos a forzar el perder directamente ya que no te va a dejar jugar
	} else {
		// minopilla
		let trozos = [];
		if (medallon.Roma    ) trozos.push("Roma");
		if (medallon.Grecia  ) trozos.push("Grecia");
		if (medallon.Lasislas) trozos.push("Lasislas");
		if (medallon.Iberia  ) trozos.push("Iberia");
		if (medallon.Egipto  ) trozos.push("Egipto");
		if (trozos.length > 0) {
			medallon[trozos[Math.floor(Math.random() * trozos.length)]] = false;
		}
		game_status.personajes[jugador].casilla = 0;
		videoNextPlayer("minopilla.webm");
	}
}
function jugarCasilla (num) {
	game_status.personajes[game_status.jugador].casilla = num;

	// comprobar minopilla (quitar trozo medallón random y saltar a siguiente jugador)
	if (game_status.personajes[6] && game_status.personajes[6].casilla != 0 &&
		game_status.personajes[game_status.jugador].casilla == game_status.personajes[6].casilla) {
		minopilla(game_status.jugador);
		return;
	}

	var action = null;
	let hasVideo = false;
	let nuevaCasilla = 0;
	switch (num) {
		case 1:
		case 2:
		case 7:
		case 10:
		case 11:
		case 18:
		case 19:
		case 20:
		case 21:
		case 22:
		case 26:
		case 28:
		case 29:
		case 33:
		case 35:
		case 36:
		case 40:
		case 42:
		case 43:
		case 45:
		case 48:
		case 50:
			// Todas RANDOM {Preguntas 20%, nada 80%} ???
			let hacerPregunta = Math.random() >= 0.80;
			if (hacerPregunta) {
				action = function () {preguntas();}
			}
			break;
		case 3:
			// VID + resto egipto 1 turno sin tirar
			hasVideo = "";
			for (let i = 0; i < game_status.personajes.length; i++) {
				if (i != game_status.jugador && game_status.personajes[i] != null && calcularLugar(game_status.personajes[i].casilla) == "Egipto") {
					game_status.personajes[i].proxima = "saltar";
				}
			}
			break;
		case 4:
		case 13:
		case 27:
		case 37:
		case 44:
			// Volver a tirar
			action = function () {game.loadScene("dado");}
			break;
		case 5:
		case 12:
		case 31:
			// RANDOM {VID + 1 turno sin tirar, VID + volver a tirar + avanzar doble}
			hasVideo = Math.random() >= 0.5 ? "a" : "b";
			if (hasVideo == "a") {
				game_status.personajes[game_status.jugador].proxima = "saltar";
			} else {
				game_status.personajes[game_status.jugador].proxima = "doble";
				action = function () {game.loadScene("dado");}
			}
			break;
		case 6:
			// VID + Viaje a c16
			hasVideo = "";
			nuevaCasilla = 16;
			break;
		case 14:
			// VID + Viaje a c32
			hasVideo = "";
			nuevaCasilla = 32;
			break;
		case 16:
			// VID + Viaje a c6
			hasVideo = "";
			nuevaCasilla = 6;
			break;
		case 23:
			// VID + Viaje a c47
			hasVideo = "";
			nuevaCasilla = 47;
			break;
		case 32:
			// VID + Viaje a c14
			hasVideo = "";
			nuevaCasilla = 14;
			break;
		case 47:
			// VID + Viaje a c23
			hasVideo = "";
			nuevaCasilla = 23;
			break;
		case 9:
		case 15:
		case 30:
		case 34:
		case 41:
			// Ruleta
			action = function () {game.loadScene("ruleta");}
			break;
		case 24:
		case 39:
			// VID + Próxima avanzar doble
			hasVideo = "";
			game_status.personajes[game_status.jugador].proxima = "doble";
			break;
		case 49:
			// VID + Bloqueado hasta sacar número impar
			hasVideo = "";
			game_status.personajes[game_status.jugador].proxima = "impar";
			break;
		case 8:
			// PRUEBA Egipto
			game_status.reto_actual = "Egipto";
			break;
		case 17:
			// PRUEBA Iberia
			game_status.reto_actual = "Iberia";
			break;
		case 25:
			// PRUEBA Las islas
			game_status.reto_actual = "Lasislas";
			break;
		case 38:
			// PRUEBA Roma
			game_status.reto_actual = "Roma";
			break;
		case 46:
			// PRUEBA Grecia
			game_status.reto_actual = "Grecia";
			break;
	}
	var doAction = function () {
		if (nuevaCasilla != 0) {
			game_status.personajes[game_status.jugador].casilla = nuevaCasilla;
			for (let i = 0; i < game_status.personajes.length; i++) {
				if (i != game_status.jugador && game_status.personajes[i] != null && game_status.personajes[i].casilla == game_status.personajes[game_status.jugador].casilla) {
					if (i == 6) {minopilla(game_status.jugador); return;}
					else game_status.personajes[i].casilla = num;
				}
			}
		}
		if (action !== null) {
			action();
		}
		if (game_status.reto_actual) {
			game.loadScene("_reto");
		}
		if (!game_status.reto_actual && action === null) {
			loadNextPlayer();
		}
	}
	var playVideo = function () {
		if (hasVideo !== false) {
			video("c" + num + (game_status.jugador < 3 ? "1" : "2") + hasVideo + ".webm",doAction);
		} else {
			doAction();
		}
	}
	playVideo();
}

function fsCommand (cmd, args) {
	if (DEBUG) console.log("fsCommand: " + cmd + ": " + args);
	switch (cmd) {
		case "Menu":
			switch (args) {
				// Menú principal
				case "Nueva":
					game.loadScene("_nueva");
					break;
				case "Cargar":
					if (localStorage.getItem("laberyntia_partida")) {
						game_status = JSON.parse(localStorage.getItem("laberyntia_partida"));
						reanudarTurno();
					} else {
						ruffle_player.ruffle().displayMessage("No hay partidas guardadas");
					}
					break;
				case "Visita":
					ruffle_player.ruffle().displayMessage("Desgraciadamente, laberyntia.com ya no existe.\nEsta página es todo lo que queda del juego.");
					break;
				case "Salir":
					intro.load("salir.webm");
					break;
				// Menú juego
				case "Volver":
					reanudarTurno();
					break;
				case "Salvar":
					localStorage.setItem("laberyntia_partida",JSON.stringify(game_status));
					break;
				case "Fin":
					game.loadScene("MenuPrincipal");
					break;
			}
			break;
		case "nEquipo":
			game_status.nEquipo = parseInt(args);
			break;
		case "c":
			if (!args) break;
			if (isNaN(parseFloat(args)) || isNaN(args - 0)) break;
			game_status.result = 0;
			activarCasilla(args);
			game_status.casillasActivadas = [];
			callExternalInterface("desactivarCasillas");
			break;
		case "intercambio":
			// Sólamente movemos al jugador con el que nos intercambiamos. El actual se mueve por enviar el comando "c"
			game_status.personajes[parseInt(args)].casilla = game_status.personajes[game_status.jugador].casilla;
			break;
		case "dado":
			game_status.result = args;
			if (game_status.personajes[game_status.jugador].proxima == "doble") {
				game_status.personajes[game_status.jugador].proxima = "";
				game_status.result = game_status.result * 2;
			}
			if (game_status.personajes[game_status.jugador].proxima == "impar") {
				if (game_status.result % 2 == 0) {
					loadNextPlayer();
					break;
				} else {
					game_status.personajes[game_status.jugador].proxima = "";
				}
			}
			calcularCasillasActivadas();
			game.loadScene("tablero");
			break;
		case "Pregunta":
			switch (args) {
				case "Ganar":
					vida(+1,cmd);
					break;
				case "Perder":
					vida(0,cmd);
					break;
			}
			game_status.pregunta = "";
			game_status.respuesta1 = "";
			game_status.respuesta2 = "";
			game_status.respuesta3 = "";
			game_status.correcta = 0;
			break;
		case "ruleta":
			switch (args) {
				case "-1":
				case -1:
					vida(-1,cmd);
					break;
				case "1":
				case 1:
					vida(1,cmd);
					break;
				case "2":
				case 2:
					vida(2,cmd);
					break;
				case "3":
				case 3:
					vida(3,cmd);
					break;
			}
			break;
		case "tablero":
			switch (args) {
				case "onLoad":
				case "onload":
					setTimeout(initTablero,100);
					if (typeof game_status.onTableroLoad !== 'undefined' && game_status.onTableroLoad != null) game_status.onTableroLoad();
					game_status.onTableroLoad = null;
					break;
				case "onZoomEnd":
				case "onzoomend":
					// TODO implementar zoom
					break;
			}
			break;
		case "Ayuda":
			if (args == "Fin") {
				game.loadScene("_reto");
			} else {
				game.loadScene("_ayuda");
			}
			break;
		case "Fin":
			switch (args) {
				case "Ganar":
					let videoG = retos[game_status.reto_actual].ganar;
					videoG = videoG.replace("#",game_status.jugador < 3 ? "1" : "2");
					if (game_status.reto_actual == "Final") {
						game_status.ended = true;
						game_status.sCode = "948708939551";
						localStorage.setItem("laberyntia_codigo",game_status.sCode);
						intro.load(videoG);
					} else {
						game_status.personajes[game_status.jugador].medallon[game_status.reto_actual] = true;
						let medallon = game_status.personajes[game_status.jugador].medallon;
						if (medallon.Roma && medallon.Grecia && medallon.Lasislas && medallon.Iberia && medallon.Egipto) {
							video(videoG,() => {videoNextPlayer("prevfinal.webm");});
						} else {
							videoNextPlayer(videoG);
						}
					}
					break;
				case "Perder":
					let videoP = retos[game_status.reto_actual].perder;
					videoP = videoP.replace("#",game_status.jugador < 3 ? "1" : "2");
					if (game_status.reto_actual == "Final") game_status.personajes[game_status.jugador].casilla = 0;
					videoNextPlayer(videoP);
					break;
			}
			game_status.reto_actual = "";
			break;
		case "Codigo":
			if (args == "Pedo") {
				game.loadScene("MenuPrincipal");
			}
			break;
		default:
			break;
	}
}

if (DEBUG) {
	//game_status.egiptoDEBUG = true;

	function debugPartidaPredefinida () {
		for (let i = 0; i < game.nueva.form.elements.length; i++) {
			//if (i % 2 == 0) {
				let nombre = "J" + (i+1);
				let nivel = 1;
				crearPersonaje(i,nombre,nivel);
			//} else {
			//	game_status.personajes[i] = null;
			//}
		}
		crearPersonaje(6,"Minotauro",4);
		game_status.jugador = -1;
		loadNextPlayer();

		//game_status.jugador = 0;
		//game.loadScene("dado");
		//game.loadScene("ruleta");
		//game_status.reto_actual = "Egipto";
		//game.loadScene("_reto");
		//preguntas(0);
	}

	function debugMinoPilla () {
		game_status.personajes[6].casilla = 49;
		fsCommand("c","49");
	}

	function debugMinoTurno () {
		game_status.jugador = 5;
		loadNextPlayer();
	}

	function debugMedallon () {
		let medallon = game_status.personajes[game_status.jugador].medallon;
				if (!medallon.Roma    ) medallon.Roma     = true;
		else if (!medallon.Grecia  ) medallon.Grecia   = true;
		else if (!medallon.Lasislas) medallon.Lasislas = true;
		else if (!medallon.Iberia  ) medallon.Iberia   = true;
		else if (!medallon.Egipto  ) medallon.Egipto   = true;
		game.ui.load();
	}

	function debugElegirCasilla () {
		for (let i = 1; i <= 50; i++) callExternalInterface("activarCasilla",i);
	}
}

// initPersonaje(num,casilla), moverACasilla(num,instant), activarCasilla(num), desactivarCasillas(), cambiarJugador(num)
function callExternalInterface (cmd, ...args) {
	if (DEBUG) console.log("ExternalInterface: " + cmd + "(" + args.join(',') + ")");
	return ruffle_player.ruffle().callExternalInterface(cmd, ...args);
}