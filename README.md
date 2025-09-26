# Les Mots - Aprende Francés con Wordle

Una aplicación web moderna para aprender vocabulario francés de forma divertida a través de un juego de Wordle interactivo.

## 🎯 Características

### Fase de Aprendizaje
- **Selección de Categorías**: El usuario elige qué categoría de vocabulario quiere practicar
- **Estudio de Palabras**: Presentación interactiva de palabras con:
  - Palabra en francés y su género
  - Traducciones en español e inglés
  - Pistas contextuales
  - Navegación entre palabras

### Fase de Desafío
- **Juego de Wordle**: Implementación completa del juego Wordle con palabras francesas
- **Mecánicas de Pistas**: Sistema de pistas que revela información adicional
- **Teclado Virtual**: Interfaz táctil optimizada para dispositivos móviles
- **Estados Visuales**: Colores distintivos para letras correctas, presentes y ausentes

### Características Técnicas
- **Arquitectura Modular**: Código organizado en componentes reutilizables
- **Responsive Design**: Optimizado para desktop, tablet y móvil
- **SEO Optimizado**: Meta tags y estructura semántica para mejor posicionamiento
- **Accesibilidad**: Cumple estándares de accesibilidad web
- **Performance**: Carga rápida y experiencia fluida

## 🏗️ Arquitectura

### Estructura de Archivos
```
Les Mots/
├── index.html                 # Página principal
├── assets/
│   ├── script/
│   │   ├── core/
│   │   │   └── DataManager.js     # Gestión de datos JSON
│   │   ├── components/
│   │   │   ├── CategorySelector.js    # Selector de categorías
│   │   │   ├── VocabularyStudy.js     # Fase de estudio
│   │   │   └── WordleGame.js          # Juego de Wordle
│   │   └── main.js               # Aplicación principal
│   ├── styles/
│   │   ├── reset.css           # Reset de estilos
│   │   └── styles.css          # Estilos principales
│   ├── db/                     # Base de datos JSON
│   │   ├── journal.json        # Categoría: La ville
│   │   ├── fleur.json          # Categoría: La nature
│   │   └── maison.json         # Categoría: La maison
│   └── img/                    # Imágenes y recursos
```

### Componentes Principales

#### DataManager
- Carga y gestiona datos de archivos JSON
- Manejo de categorías y palabras
- Selección aleatoria de palabras

#### CategorySelector
- Interfaz para selección de categorías
- Tarjetas visuales con iconos
- Estados de carga y error

#### VocabularyStudy
- Presentación de palabras para estudio
- Navegación entre palabras
- Información completa de cada palabra

#### WordleGame
- Implementación del juego de Wordle
- Sistema de pistas con penalización
- Teclado virtual y físico
- Estados de victoria/derrota

## 🎮 Cómo Jugar

1. **Selecciona una Categoría**: Elige entre las categorías disponibles (La ville, La nature, La maison)
2. **Estudia el Vocabulario**: Revisa las palabras, traducciones y pistas
3. **Juega Wordle**: Adivina la palabra francesa en 6 intentos
4. **Usa Pistas**: Si necesitas ayuda, usa las pistas (cada una cuesta un intento)
5. **Continúa Aprendiendo**: Juega otra vez o cambia de categoría

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica y accesible
- **CSS3**: Diseño moderno con variables CSS y Grid/Flexbox
- **JavaScript ES6+**: Código modular con clases y async/await
- **JSON**: Base de datos ligera para vocabulario
- **Responsive Design**: Mobile-first approach

## 🚀 Instalación y Uso

1. Clona o descarga el proyecto
2. Abre `index.html` en un navegador web moderno
3. ¡Comienza a aprender francés!

### Requisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexión a internet (para cargar archivos JSON)

## 📱 Compatibilidad

- **Desktop**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Mobile**: iOS Safari 13+, Chrome Mobile 80+
- **Tablet**: iPadOS 13+, Android Chrome 80+

## 🎨 Personalización

### Añadir Nuevas Categorías
1. Crea un nuevo archivo JSON en `assets/db/`
2. Sigue la estructura de los archivos existentes
3. Añade la categoría en `DataManager.js`

### Modificar Estilos
- Variables CSS en `:root` para colores y espaciado
- Componentes específicos en `styles.css`
- Reset personalizable en `reset.css`

## 📊 Estructura de Datos JSON

```json
{
  "categoria": {
    "fr": "La ville",
    "es": "La ciudad", 
    "en": "The city"
  },
  "palabra": "JOURNAL",
  "longitud": 7,
  "genero": "masculin",
  "traducciones": {
    "es": { "traduccion": "periódico" },
    "en": { "traduccion": "newspaper" }
  },
  "pistas": [
    {
      "fr": "C'est une publication qui donne les nouvelles du jour.",
      "es": "Es una publicación que da las noticias del día.",
      "en": "It's a publication that gives the day's news."
    }
  ]
}
```

## 🔧 Desarrollo

### Estándares de Código
- **Modularidad**: Cada componente tiene una responsabilidad específica
- **Documentación**: Código comentado y documentado
- **SEO**: Meta tags optimizados y estructura semántica
- **Accesibilidad**: Cumple WCAG 2.1 AA
- **Performance**: Carga optimizada y experiencia fluida

### Próximas Mejoras
- [ ] Sistema de puntuación
- [ ] Estadísticas de progreso
- [ ] Más categorías de vocabulario
- [ ] Modo multijugador
- [ ] Aplicación móvil nativa

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👥 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

---

**Les Mots** - Aprende francés de forma divertida 🎓🇫🇷
