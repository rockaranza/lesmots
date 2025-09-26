/**
 * VocabularyStudy - Componente para estudio de vocabulario
 * Responsabilidad: Mostrar palabras para estudio antes del juego
 */
class VocabularyStudy {
    constructor(containerId, dataManager) {
        this.container = document.getElementById(containerId);
        this.dataManager = dataManager;
        this.currentWordIndex = 0;
        this.words = [];
        this.onStudyComplete = null;
    }

    /**
     * Inicializa el estudio con las palabras de la categoría actual
     */
    async initialize() {
        try {
            this.words = this.dataManager.getCurrentWords();
            this.currentWordIndex = 0;
            this.render();
        } catch (error) {
            console.error('Error inicializando estudio:', error);
            this.showError('Error al cargar las palabras');
        }
    }

    /**
     * Renderiza el componente de estudio
     */
    render() {
        if (!this.container || this.words.length === 0) {
            console.error('Container no encontrado o no hay palabras');
            return;
        }

        const currentWord = this.words[this.currentWordIndex];
        const categoryInfo = this.dataManager.getCategoryInfo(this.dataManager.getCurrentCategory());
        
        this.container.innerHTML = `
            <div class="vocabulary-study">
                <div class="study-header">
                    <h2 class="study-title">Étude du vocabulaire</h2>
                    <p class="study-category">${categoryInfo.name}</p>
                    <div class="study-progress">
                        <span class="current-word">${this.currentWordIndex + 1}</span>
                        <span class="separator">/</span>
                        <span class="total-words">${this.words.length}</span>
                    </div>
                </div>

                <div class="word-card">
                    <div class="word-header">
                        <h3 class="word-french">${currentWord.palabra}</h3>
                        <span class="word-gender">(${currentWord.genero})</span>
                    </div>
                    
                    <div class="word-translations">
                        <div class="translation">
                            <span class="language">Español:</span>
                            <span class="translation-text">${currentWord.traducciones.es.traduccion}</span>
                        </div>
                        <div class="translation">
                            <span class="language">English:</span>
                            <span class="translation-text">${currentWord.traducciones.en.traduccion}</span>
                        </div>
                    </div>

                    <div class="word-hints">
                        <h4>Pistes:</h4>
                        <ul class="hints-list">
                            ${currentWord.pistas.map(pista => `
                                <li class="hint-item">${pista.fr}</li>
                            `).join('')}
                        </ul>
                    </div>
                </div>

                <div class="study-controls">
                    <button class="btn btn-secondary" id="prev-word" ${this.currentWordIndex === 0 ? 'disabled' : ''}>
                        ← Précédent
                    </button>
                    <button class="btn btn-primary" id="next-word">
                        ${this.currentWordIndex === this.words.length - 1 ? 'Commencer le jeu' : 'Suivant →'}
                    </button>
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    /**
     * Adjunta los event listeners
     */
    attachEventListeners() {
        const prevBtn = document.getElementById('prev-word');
        const nextBtn = document.getElementById('next-word');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousWord());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextWord());
        }
    }

    /**
     * Va a la palabra anterior
     */
    previousWord() {
        if (this.currentWordIndex > 0) {
            this.currentWordIndex--;
            this.render();
        }
    }

    /**
     * Va a la siguiente palabra o completa el estudio
     */
    nextWord() {
        if (this.currentWordIndex < this.words.length - 1) {
            this.currentWordIndex++;
            this.render();
        } else {
            // Estudio completado
            this.completeStudy();
        }
    }

    /**
     * Completa el estudio y notifica al callback
     */
    completeStudy() {
        if (this.onStudyComplete) {
            this.onStudyComplete();
        }
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
     * Establece el callback para cuando se completa el estudio
     * @param {Function} callback - Función callback
     */
    setOnStudyComplete(callback) {
        this.onStudyComplete = callback;
    }
}

// Exportar para uso en módulos
window.VocabularyStudy = VocabularyStudy;
