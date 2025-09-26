/**
 * Modal de instrucciones para Les Mots
 * Maneja la visualización y interacción del modal de instrucciones
 */
class InstructionsModal {
    constructor() {
        this.modal = null;
        this.isOpen = false;
        this.init();
    }

    /**
     * Inicializa el modal de instrucciones
     */
    init() {
        this.createModal();
        this.attachEventListeners();
    }

    /**
     * Crea el HTML del modal de instrucciones
     */
    createModal() {
        const modalHTML = `
            <div id="instructions-modal" class="instructions-modal">
                <div class="instructions-modal-content">
                    <button class="instructions-close" id="instructions-close">&times;</button>
                    
                    <div class="instructions-header">
                        <h2 class="instructions-title">¿Cómo jugar Les Mots?</h2>
                    </div>
                    
                    <div class="instructions-body">
                        <div class="instructions-section">
                            <h3>Instrucciones</h3>
                            <ul class="instructions-list">
                                <li>Adivina la palabra en francés</li>
                                <li>Escribe con tu teclado para completar todas las letras</li>
                                <li>Tienes 5 intentos</li>
                                <li>Puedes pedir pistas que te ayudarán</li>
                            </ul>
                        </div>

                        <div class="instructions-section">
                            <h3>Sistema de colores</h3>
                            <div class="instructions-example">
                                <h4>Verde 🟩</h4>
                                <p>La letra está en la posición correcta</p>
                                
                                <h4>Amarillo 🟨</h4>
                                <p>La letra está en la palabra pero en una posición diferente</p>
                                
                                <h4>Gris ⬜</h4>
                                <p>La letra no está en la palabra</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Agregar el modal al body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('instructions-modal');
    }

    /**
     * Adjunta los event listeners
     */
    attachEventListeners() {
        const closeBtn = document.getElementById('instructions-close');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // Cerrar al hacer clic fuera del modal
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.close();
                }
            });
        }

        // Cerrar con la tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    /**
     * Abre el modal
     */
    open() {
        if (this.modal) {
            this.modal.classList.add('show');
            this.isOpen = true;
            document.body.style.overflow = 'hidden'; // Prevenir scroll del body
        }
    }

    /**
     * Cierra el modal
     */
    close() {
        if (this.modal) {
            this.modal.classList.remove('show');
            this.isOpen = false;
            document.body.style.overflow = ''; // Restaurar scroll del body
        }
    }

    /**
     * Limpia el modal del DOM
     */
    cleanup() {
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
    }
}

// Exportar la clase para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InstructionsModal;
}
