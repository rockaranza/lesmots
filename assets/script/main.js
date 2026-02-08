/**
 * Les Mots - Aplicación principal
 * Coordina todos los componentes de la aplicación
 */
class LesMotsApp {
    constructor() {
        this.dataManager = new DataManager();
        this.wordleGame = null;
        this.instructionsModal = null;
        this.currentState = 'game';
    }

    /**
     * Inicializa la aplicación
     */
    async initialize() {
        try {
            this.setupComponents();
            this.startGame();
        } catch (error) {
            console.error('Error inicializando aplicación:', error);
            this.showError('Error al inicializar la aplicación');
        }
    }

    /**
     * Configura todos los componentes
     */
    setupComponents() {
        // Configurar juego de Wordle
        this.wordleGame = new WordleGame('app-container', this.dataManager);

        // Configurar modal de instrucciones
        this.instructionsModal = new InstructionsModal();
    }

    /**
     * Inicia el juego directamente
     */
    async startGame() {
        try {
            this.currentState = 'game';
            await this.wordleGame.initialize();
        } catch (error) {
            console.error('Error iniciando juego:', error);
            this.showError('Error al iniciar el juego');
        }
    }


    /**
     * Muestra mensaje de error
     */
    showError(message) {
        const container = document.getElementById('app-container');
        container.innerHTML = `
            <div class="error-state">
                <div class="error-icon">⚠️</div>
                <h2>Error</h2>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="location.reload()">Reintentar</button>
            </div>
        `;
    }
}

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', async function() {
    const app = new LesMotsApp();
    await app.initialize();
});
