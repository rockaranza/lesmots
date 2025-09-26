/**
 * DataManager - Manejo centralizado de datos JSON
 * Responsabilidad: Cargar y gestionar datos de vocabulario
 */
class DataManager {
    constructor() {
        this.wordsList = [];
        this.currentWord = null;
        this.isLoaded = false;
        this.recentWords = []; // Historial de palabras recientes
        this.maxRecentWords = 3; // Máximo de palabras recientes a recordar
    }

    /**
     * Carga la lista de palabras disponibles
     * @returns {Promise<void>}
     */
    async loadWordsList() {
        try {
            const response = await fetch('assets/db/words.json');
            if (!response.ok) {
                throw new Error('Error al cargar la lista de palabras');
            }

            const data = await response.json();
            this.wordsList = data.words;
            this.isLoaded = true;
        } catch (error) {
            console.error('Error cargando lista de palabras:', error);
            throw error;
        }
    }

    /**
     * Carga una palabra aleatoria
     * @returns {Promise<Object>} Datos de la palabra aleatoria
     */
    async loadRandomWord() {
        try {
            if (!this.isLoaded) {
                await this.loadWordsList();
            }

            if (this.wordsList.length === 0) {
                throw new Error('No hay palabras disponibles');
            }

            // Filtrar palabras recientes
            const availableWords = this.wordsList.filter(word => 
                !this.recentWords.includes(word.id)
            );

            // Si no hay palabras disponibles (todas son recientes), usar todas
            const wordsToChooseFrom = availableWords.length > 0 ? availableWords : this.wordsList;

            // Seleccionar una palabra aleatoria
            const randomIndex = Math.floor(Math.random() * wordsToChooseFrom.length);
            const selectedWord = wordsToChooseFrom[randomIndex];

            // Cargar los datos completos de la palabra
            const response = await fetch(`assets/db/${selectedWord.filename}`);
            if (!response.ok) {
                throw new Error(`Error al cargar ${selectedWord.filename}`);
            }

            const wordData = await response.json();
            this.currentWord = wordData;
            
            // Agregar la palabra al historial de recientes
            this.addToRecentWords(selectedWord.id);
            
            return wordData;
        } catch (error) {
            console.error('Error cargando palabra aleatoria:', error);
            throw error;
        }
    }

    /**
     * Obtiene la palabra actual
     * @returns {Object|null} Palabra actual
     */
    getCurrentWord() {
        return this.currentWord;
    }

    /**
     * Obtiene todas las palabras disponibles
     * @returns {Array} Lista de palabras
     */
    getWordsList() {
        return this.wordsList;
    }

    /**
     * Verifica si las palabras están cargadas
     * @returns {boolean} True si están cargadas
     */
    isWordsLoaded() {
        return this.isLoaded;
    }

    /**
     * Agrega una palabra al historial de recientes
     * @param {string} wordId - ID de la palabra
     */
    addToRecentWords(wordId) {
        // Remover la palabra si ya existe en el historial
        this.recentWords = this.recentWords.filter(id => id !== wordId);
        
        // Agregar la palabra al inicio del historial
        this.recentWords.unshift(wordId);
        
        // Mantener solo el número máximo de palabras recientes
        if (this.recentWords.length > this.maxRecentWords) {
            this.recentWords = this.recentWords.slice(0, this.maxRecentWords);
        }
    }

    /**
     * Obtiene el historial de palabras recientes
     * @returns {Array} Lista de IDs de palabras recientes
     */
    getRecentWords() {
        return [...this.recentWords];
    }

    /**
     * Limpia el historial de palabras recientes
     */
    clearRecentWords() {
        this.recentWords = [];
    }
}

// Exportar para uso en módulos
window.DataManager = DataManager;
