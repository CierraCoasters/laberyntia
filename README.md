# Laberyntia

El videojuego de Terra Mítica.

## Acerca del juego

"Laberyntia" es un videojuego producido por el parque temático de Benidorm, Terra Mítica, a principios de los años 2000, en sus primeros años de apertura.

Inspirado por la atracción del parque "El Laberinto del Minotauro", en este videojuego tendrás que reunir los 5 trozos del medallón de Terra Mítica y dar de comer a tu Ave Fénix para poder enfrentarte al Minotauro.

Aunque el juego es muy antiguo (lo que se nota en sus gráficos y jugabilidad, así como en el mapa del parque que incluye), es una parte muy interesante y desconocida de la historia de Terra Mítica que hoy, como el Ave Fénix, resurge de sus cenizas para que lo puedas volver a jugar.

Puedes abrir el juego accediendo a https://cierracoasters.github.io/laberyntia/

## Acerca de este port

El juego original consistía en un ejecutable de Flash Player modificado y varios archivos de Flash. Gracias a [Ruffle](https://ruffle.rs/), podemos recuperar los archivos Flash y hacerlos funcionar en la web (HTML5).\
El problema es que el código del ejecutable de Flash Player modificado (probablemente C++) no es fácil de recuperar, y es el que controla el juego, por lo que todo ha tenido que ser reimplementado en JavaScript.\
También ha sido necesario modificar algunos de los archivos Flash con [JPEXS Free Flash Decompiler](https://github.com/jindrapetrik/jpexs-decompiler) para poder controlarlos correctamente desde este código JavaScript.

Esto ha permitido cambios y correcciones, pero implica que el juego puede no funcionar completamente igual que lo hacía.\
Algunos fallos conocidos en esta versión son:
- Falta la función de zoom del tablero de juego.
- Faltan algunas de las preguntas tipo trivial originales del juego. No se pueden extraer fácilmente del juego original.
- La música de fondo (midi) puede no detenerse siempre que debe, lo cual puede llevarla a solaparse con otras pistas de música de fondo.

Todos estos fallos están en proceso de corrección, hasta donde sea posible, pero si encuentras más, no dudes en decírnoslo.

No obstante, esto también permite añadir al juego preguntas nuevas, creadas por nosotros y más ajustadas a Terra Mítica, su historia y su estado actual que las preguntas originales. Siendo algo que claramente difiere del juego original, es opcional y se puede activar en el panel de "Notas sobre el port" antes de empezar a jugar.

## Licencias del juego

[Ver en el archivo correspondiente](LICENSE.md)

## Créditos
- Créditos del port: CierraCoasters (@cierracoasters [[YT]](https://www.youtube.com/@cierracoasters) [[IG]](https://www.instagram.com/cierracoasters)): David (programación) y Álvaro (difusión y pruebas).\
  Código específico del port licenciado con [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.es). Contáctanos si necesitas otra licencia.
- Créditos del juego original: Ver dentro del propio juego. (Muchas gracias a los creadores originales.) Publicado en [Internet Archive por crarchive](https://archive.org/details/laberyntia).
- Bibliotecas de código abierto incluidas: [Ruffle](https://www.ruffle.rs) ([licencia MIT](https://github.com/ruffle-rs/ruffle/blob/master/LICENSE.md)) y [WebAudioFont](https://surikov.github.io/webaudiofont/) ([licencia GNU GPL 3](https://github.com/ruffle-rs/ruffle/blob/master/LICENSE.md)).