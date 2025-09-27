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
                    <div class="instructions-header">
                        <h2>¿Cómo jugar Les Mots?</h2>
                        <button class="instructions-close" id="instructions-close">×</button>
                    </div>
                    
                    <div class="instructions-body">
                        <h3>Instrucciones</h3>
                        <ul>
                            <li>🎯 Adivina la palabra en francés</li>
                            <li>⌨️ Escribe con tu teclado para completar todas las letras</li>
                            <li>5️⃣ Tienes 5 intentos</li>
                            <li>💡 Puedes pedir pistas que te ayudarán</li>
                        </ul>

                        <h3>Sistema de colores</h3>
                        <p><span class="color-demo green">A</span> <strong>Verde:</strong> La letra está en la posición correcta</p>
                        <p><span class="color-demo yellow">B</span> <strong>Amarillo:</strong> La letra está en la palabra pero en una posición diferente</p>
                        <p><span class="color-demo gray">C</span> <strong>Gris:</strong> La letra no está en la palabra</p>
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
