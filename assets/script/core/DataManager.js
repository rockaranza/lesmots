/**
 * DataManager - Manejo centralizado de datos JSON
 * Responsabilidad: Cargar y gestionar datos de vocabulario
 */
class DataManager {
    constructor() {
        this.categories = new Map();
        this.currentCategory = null;
        this.currentWords = [];
        this.availableCategories = [
            { id: 'journal', name: 'La ville', icon: '🏙️', file: 'journal.json' },
            { id: 'fleur', name: 'La nature', icon: '🌺', file: 'fleur.json' },
            { id: 'maison', name: 'La maison', icon: '🏠', file: 'maison.json' }
        ];
    }

    /**
     * Carga una categoría específica desde el archivo JSON
     * @param {string} categoryId - ID de la categoría
     * @returns {Promise<Object>} Datos de la categoría
     */
    async loadCategory(categoryId) {
        try {
            const categoryInfo = this.availableCategories.find(cat => cat.id === categoryId);
            if (!categoryInfo) {
                throw new Error(`Categoría ${categoryId} no encontrada`);
            }

            const response = await fetch(`assets/db/${categoryInfo.file}`);
            if (!response.ok) {
                throw new Error(`Error al cargar ${categoryInfo.file}`);
            }

            const data = await response.json();
            this.categories.set(categoryId, data);
            this.currentCategory = categoryId;
            this.currentWords = [data]; // Por ahora cada archivo tiene una palabra
            
            return data;
        } catch (error) {
            console.error('Error cargando categoría:', error);
            throw error;
        }
    }

    /**
     * Carga una categoría aleatoria
     * @returns {Promise<Object>} Datos de la categoría aleatoria
     */
    async loadRandomCategory() {
        try {
            const randomIndex = Math.floor(Math.random() * this.availableCategories.length);
            const randomCategory = this.availableCategories[randomIndex];
            return await this.loadCategory(randomCategory.id);
        } catch (error) {
            console.error('Error cargando categoría aleatoria:', error);
            throw error;
        }
    }

    /**
     * Obtiene todas las categorías disponibles
     * @returns {Array} Lista de categorías
     */
    getAvailableCategories() {
        return this.availableCategories;
    }

    /**
     * Obtiene las palabras de la categoría actual
     * @returns {Array} Palabras de la categoría actual
     */
    getCurrentWords() {
        return this.currentWords;
    }

    /**
     * Obtiene una palabra aleatoria de la categoría actual
     * @returns {Object} Palabra aleatoria
     */
    getRandomWord() {
        if (this.currentWords.length === 0) {
            throw new Error('No hay palabras disponibles');
        }
        
        const randomIndex = Math.floor(Math.random() * this.currentWords.length);
        return this.currentWords[randomIndex];
    }

    /**
     * Obtiene la categoría actual
     * @returns {string|null} ID de la categoría actual
     */
    getCurrentCategory() {
        return this.currentCategory;
    }

    /**
     * Obtiene información de una categoría específica
     * @param {string} categoryId - ID de la categoría
     * @returns {Object|null} Información de la categoría
     */
    getCategoryInfo(categoryId) {
        return this.availableCategories.find(cat => cat.id === categoryId) || null;
    }
}

// Exportar para uso en módulos
window.DataManager = DataManager;
