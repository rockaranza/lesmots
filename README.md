# Les Mots

App para aprender vocabulario francés jugando al Wordle: eliges la dificultad, usas pistas y adivinas la palabra en francés.

## Datos y contingencia

La app obtiene los datos de las palabras principalmente desde una base de datos (actualmente Supabase).
Además, existen archivos JSON locales en `assets/db` que actúan como **plan de contingencia**: si hay un fallo en la conexión a la base de datos, la app utiliza estos archivos para seguir funcionando de forma degradada (sin depender del servidor).

## Modo pruebas ("super dios")

Para probar casos especiales (palabras con guiones, espacios, apóstrofos, etc.) sin tener que esperar a que salgan aleatoriamente, puedes usar un parámetro de URL:

- **Parámetro**: `dev_word`
- **Uso**: añade `?dev_word=palabra%20de%20prueba` a la URL.

Ejemplos:

- `...?dev_word=grand-mère`
- `...?dev_word=pomme%20de%20terre`

Cuando `dev_word` está presente:

- El juego no usa la base de datos ni los JSON, sino una palabra de **modo prueba** construida a partir del texto del parámetro.
- La longitud que cuenta para el tablero se calcula solo con las letras (ignorando espacios, guiones, etc.), como en el juego normal.

Este modo está pensado únicamente para **pruebas y depuración** de casos especiales; no debería usarse como flujo normal de usuarios.
