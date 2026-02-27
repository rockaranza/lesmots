# Les Mots

App para aprender vocabulario francés jugando al Wordle: eliges la dificultad, usas pistas y adivinas la palabra en francés.

## Datos y contingencia

La app obtiene los datos de las palabras principalmente desde una base de datos (actualmente Supabase).
Además, existen archivos JSON locales en `assets/db` que actúan como **plan de contingencia**: si hay un fallo en la conexión a la base de datos, la app utiliza estos archivos para seguir funcionando de forma degradada (sin depender del servidor).
