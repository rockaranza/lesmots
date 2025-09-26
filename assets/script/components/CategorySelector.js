/**
 * CategorySelector - Componente para selección de categorías
 * Responsabilidad: Mostrar y manejar la selección de categorías de vocabulario
 */
class CategorySelector {
    constructor(containerId, dataManager) {
        this.container = document.getElementById(containerId);
        this.dataManager = dataManager;
        this.onCategorySelect = null;
    }

    /**
     * Renderiza el selector de categorías
     */
    render() {
        if (!this.container) {
            console.error('Container no encontrado para CategorySelector');
            return;
        }

        const categories = this.dataManager.getAvailableCategories();
        
        this.container.innerHTML = `
            <div class="category-selector">
                <h2 class="category-title">Choisissez une catégorie</h2>
                <p class="category-subtitle">Sélectionnez une catégorie pour commencer à apprendre</p>
                <div class="categories-grid">
                    ${categories.map(category => this.createCategoryCard(category)).join('')}
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    /**
     * Crea una tarjeta de categoría
     * @param {Object} category - Información de la categoría
     * @returns {string} HTML de la tarjeta
     */
    createCategoryCard(category) {
        return `
            <div class="category-card" data-category-id="${category.id}">
                <div class="category-icon">${category.icon}</div>
                <h3 class="category-name">${category.name}</h3>
                <button class="category-button" data-category-id="${category.id}">
                    Commencer
                </button>
            </div>
        `;
    }

    /**
     * Adjunta los event listeners
     */
    attachEventListeners() {
        const buttons = this.container.querySelectorAll('.category-button');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const categoryId = e.target.getAttribute('data-category-id');
                this.selectCategory(categoryId);
            });
        });
    }

    /**
     * Maneja la selección de una categoría
     * @param {string} categoryId - ID de la categoría seleccionada
     */
    async selectCategory(categoryId) {
        try {
            // Mostrar loading
            this.showLoading();
            
            // Cargar la categoría
            await this.dataManager.loadCategory(categoryId);
            
            // Notificar al callback
            if (this.onCategorySelect) {
                this.onCategorySelect(categoryId);
            }
        } catch (error) {
            console.error('Error seleccionando categoría:', error);
            this.showError('Error al cargar la categoría');
        }
    }

    /**
     * Muestra estado de carga
     */
    showLoading() {
        this.container.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>Chargement de la catégorie...</p>
            </div>
        `;
    }

    /**
     * Muestra mensaje de error
     * @param {string} message - Mensaje de error
     */
    showError(message) {
        this.container.innerHTML = `
            <div class="error-state">
                <div class="error-icon">⚠️</div>
                <p>${message}</p>
                <button class="retry-button" onclick="location.reload()">Réessayer</button>
            </div>
        `;
    }

    /**
     * Establece el callback para cuando se selecciona una categoría
     * @param {Function} callback - Función callback
     */
    setOnCategorySelect(callback) {
        this.onCategorySelect = callback;
    }
}

// Exportar para uso en módulos
window.CategorySelector = CategorySelector;
