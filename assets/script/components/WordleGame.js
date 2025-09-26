/**
 * WordleGame - Componente del juego de Wordle
 * Responsabilidad: Implementar la mecánica del juego de Wordle con pistas
 */
class WordleGame {
    constructor(containerId, dataManager) {
        this.container = document.getElementById(containerId);
        this.dataManager = dataManager;
        this.targetWord = null;
        this.currentGuess = '';
        this.guesses = [];
        this.maxGuesses = 5;
        this.currentAttempt = 0;
        this.hints = []; // Array de pistas disponibles
        this.usedHints = []; // Array de pistas usadas
        this.gameState = 'playing'; // 'playing', 'won', 'lost'
        this.onGameEnd = null;
        this.keydownHandler = null; // Para poder remover el listener
    }

    /**
     * Inicializa el juego con una palabra aleatoria
     */
    async initialize() {
        try {
            // Cargar palabra aleatoria
            this.targetWord = await this.dataManager.loadRandomWord();
            this.hints = [...this.targetWord.pistas]; // Copiar todas las pistas
            this.usedHints = []; // Reiniciar pistas usadas
            
            this.resetGame();
            this.render();
            
            this.updateDisplay();
        } catch (error) {
            console.error('Error inicializando juego:', error);
            this.showError('Error al cargar la palabra del juego');
        }
    }

    /**
     * Reinicia el estado del juego
     */
    resetGame() {
        this.currentGuess = '';
        this.guesses = [];
        this.currentAttempt = 0;
        this.gameState = 'playing';
    }


    /**
     * Renderiza el juego
     */
    render() {
        if (!this.container || !this.targetWord) {
            console.error('Container no encontrado o palabra objetivo no disponible');
            return;
        }

        this.container.innerHTML = `
            <div class="wordle-game">
                <div class="game-layout">
                    <aside class="game-sidebar-left">
                        <div class="app-title">
                            <h1>Les Mots</h1>
                        </div>
                        
                        <div class="game-stats">
                            <div class="stat-item">
                                <span class="stat-icon">🎯</span>
                                <span class="stat-label">Intentos</span>
                                <span class="stat-value">${this.currentAttempt}/${this.maxGuesses}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-icon">📏</span>
                                <span class="stat-label">Letras</span>
                                <span class="stat-value">${this.targetWord.longitud}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-icon">🏷️</span>
                                <span class="stat-label">Categoría</span>
                                <span class="stat-value">${this.targetWord.categoria.fr}</span>
                            </div>
                        </div>

                        <div class="game-actions">
                            <button class="btn btn-primary btn-new-game" id="new-game">
                                Nueva Palabra
                            </button>
                        </div>
                    </aside>

                    <main class="game-main">
                        <div class="game-board-container">
                            <div class="game-board">
                                ${this.renderGameBoard()}
                            </div>
                        </div>

                        <div class="game-controls">
                            <div class="keyboard">
                                ${this.renderKeyboard()}
                            </div>
                        </div>
                    </main>

                    <aside class="game-sidebar-right">
                        <div class="hints-section">
                            <h3>Pistas</h3>
                            <button class="btn btn-hint" id="use-hint">
                                <span class="hint-text">Revelar Pista</span>
                            </button>
                        </div>
                        
                        <div class="hints-list">
                            ${this.renderHints()}
                        </div>
                    </aside>
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    /**
     * Renderiza el tablero del juego
     */
    renderGameBoard() {
        let boardHTML = '';
        
        for (let i = 0; i < this.maxGuesses; i++) {
            let rowClass = 'guess-row';
            
            boardHTML += `<div class="${rowClass}">`;
            
            for (let j = 0; j < this.targetWord.longitud; j++) {
                let letter = '';
                let letterClass = '';
                
                if (this.guesses[i]) {
                    // Fila completada y validada
                    letter = this.guesses[i][j];
                    letterClass = this.getLetterClass(i, j);
                } else if (i === this.currentAttempt && j < this.currentGuess.length) {
                    // Fila actual con letras escritas
                    letter = this.currentGuess[j];
                    letterClass = 'filled';
                }
                
                boardHTML += `<div class="letter-box ${letterClass}">${letter}</div>`;
            }
            
            boardHTML += '</div>';
        }
        
        return boardHTML;
    }

    /**
     * Obtiene la clase CSS para una letra específica
     */
    getLetterClass(row, col) {
        if (row >= this.guesses.length) return '';
        
        const guess = this.guesses[row];
        const letter = guess[col];
        const targetWord = this.targetWord.palabra;
        
        // Si la letra está en la posición correcta
        if (letter === targetWord[col]) {
            return 'correct';
        }
        
        // Si la letra existe en la palabra pero no en esta posición
        if (targetWord.includes(letter)) {
            // Contar cuántas veces aparece la letra en la palabra objetivo
            const targetCount = (targetWord.match(new RegExp(letter, 'g')) || []).length;
            
            // Contar cuántas veces aparece la letra en el intento hasta esta posición
            let guessCount = 0;
            for (let i = 0; i <= col; i++) {
                if (guess[i] === letter) {
                    guessCount++;
                }
            }
            
            // Solo marcar como presente si no hemos excedido el número de ocurrencias
            if (guessCount <= targetCount) {
                return 'present';
            }
        }
        
        return 'absent';
    }

    /**
     * Renderiza el teclado virtual QWERTY
     */
    renderKeyboard() {
        const rows = [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
            ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
        ];

        return rows.map(row => `
            <div class="keyboard-row">
                ${row.map(key => `<button class="key" data-key="${key}">${key}</button>`).join('')}
            </div>
        `).join('');
    }

    /**
     * Renderiza las pistas usadas
     */
    renderHints() {
        if (this.usedHints.length === 0) {
            return '<p class="no-hints">No hay pistas reveladas aún</p>';
        }

        return this.usedHints.map((hint, index) => `
            <div class="hint-item">
                <div class="hint-number">Pista ${index + 1}</div>
                <div class="hint-text">${hint.fr}</div>
                <div class="hint-translation">${hint.es}</div>
            </div>
        `).join('');
    }

    /**
     * Adjunta los event listeners
     */
    attachEventListeners() {
        // Remover listeners existentes para evitar duplicados
        this.removeEventListeners();

        // Teclado virtual
        const keys = this.container.querySelectorAll('.key');
        keys.forEach(key => {
            key.addEventListener('click', (e) => {
                this.handleKeyPress(e.target.getAttribute('data-key'));
            });
        });

        // Teclado físico
        this.keydownHandler = (e) => {
            // Lista de teclas especiales que no deben procesarse
            const specialKeys = [
                'Shift', 'Control', 'Alt', 'Meta', 'Command', 'Option', 'ArrowUp', 'ArrowDown', 
                'ArrowLeft', 'ArrowRight', 'Tab', 'CapsLock', 'NumLock', 'ScrollLock', 
                'Pause', 'Insert', 'Home', 'PageUp', 'PageDown', 'End', 'Delete', 'F1', 'F2', 
                'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'ContextMenu',
                'AudioVolumeMute', 'AudioVolumeDown', 'AudioVolumeUp', 'MediaTrackNext',
                'MediaTrackPrevious', 'MediaStop', 'MediaPlayPause', 'LaunchMail', 'LaunchApp1',
                'LaunchApp2', 'BrowserBack', 'BrowserForward', 'BrowserRefresh', 'BrowserStop',
                'BrowserSearch', 'BrowserFavorites', 'BrowserHome', 'Escape', 'Unidentified'
            ];
            
            // Si es una tecla especial, prevenir el comportamiento por defecto pero no procesarla
            if (specialKeys.includes(e.key)) {
                e.preventDefault();
                return;
            }
            
            // Prevenir el comportamiento por defecto para las teclas que sí procesamos
            e.preventDefault();
            
            if (e.key === 'Enter') {
                this.handleKeyPress('ENTER');
            } else if (e.key === 'Backspace') {
                this.handleKeyPress('BACKSPACE');
            } else if (e.key.match(/^[A-ZÀ-ÿa-zà-ÿ]$/)) {
                // Procesar letras tanto mayúsculas como minúsculas
                this.handleKeyPress(e.key.toUpperCase());
            }
        };
        document.addEventListener('keydown', this.keydownHandler);

        // Botones de control
        const hintBtn = this.container.querySelector('#use-hint');
        const newGameBtn = this.container.querySelector('#new-game');

        if (hintBtn) {
            hintBtn.addEventListener('click', () => this.useHint());
        }

        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => this.newGame());
        }
    }

    /**
     * Remueve los event listeners
     */
    removeEventListeners() {
        if (this.keydownHandler) {
            document.removeEventListener('keydown', this.keydownHandler);
        }
    }

    /**
     * Maneja la pulsación de teclas
     */
    handleKeyPress(key) {
        if (this.gameState !== 'playing') return;

        // Solo procesar teclas válidas
        if (key === 'BACKSPACE') {
            this.removeLetter();
        } else if (key === 'ENTER') {
            // Enter no hace nada durante el juego, solo en modales
            return;
        } else if (key.match(/^[A-ZÀ-ÿ]$/) && this.currentGuess.length < this.targetWord.longitud) {
            // Solo aceptar letras individuales válidas (ya convertidas a mayúsculas)
            this.addLetter(key);
        }
    }

    /**
     * Añade una letra al intento actual
     */
    addLetter(letter) {
        if (this.currentGuess.length < this.targetWord.longitud) {
            this.currentGuess += letter;
            this.updateCurrentRow();
            
            // Si se llenó la fila, validar automáticamente
            if (this.currentGuess.length === this.targetWord.longitud) {
                // Validar automáticamente después de un breve delay
                setTimeout(() => {
                    this.submitGuess();
                }, 500);
            }
        }
    }

    /**
     * Elimina la última letra del intento actual
     */
    removeLetter() {
        if (this.currentGuess.length > 0) {
            this.currentGuess = this.currentGuess.slice(0, -1);
            this.updateCurrentRow();
            
            // Remover animación de temblor si ya no está llena y no ha sido validada
            if (this.currentGuess.length < this.targetWord.longitud && !this.guesses[this.currentAttempt]) {
                this.removeShakeAnimation();
            }
        }
    }

    /**
     * Envía el intento actual
     */
    submitGuess() {
        if (this.currentGuess.length !== this.targetWord.longitud) return;
        if (this.gameState !== 'playing') return;

        // Procesar inmediatamente sin animación de envío
        this.guesses[this.currentAttempt] = this.currentGuess;
        const isCorrect = this.currentGuess === this.targetWord.palabra;
        this.currentAttempt++;
        this.currentGuess = '';

        // Actualizar el tablero completo para mostrar los colores
        this.updateGameBoard();
        this.updateGameInfo();
        
        // Agregar animación escalonada a las letras de la fila completada
        this.addStaggeredLetterAnimation();
        
        // Verificar el estado del juego después de actualizar la UI
        this.checkGameState();
        
        // Si la palabra es incorrecta, agregar temblor
        if (!isCorrect && this.currentAttempt <= this.maxGuesses) {
            this.addShakeAnimation();
        }
        
        // Si la palabra es correcta, mostrar confetti
        if (isCorrect) {
            this.showConfetti();
        }
    }

    /**
     * Verifica el estado del juego
     */
    checkGameState() {
        const lastGuess = this.guesses[this.currentAttempt - 1];
        
        if (lastGuess === this.targetWord.palabra) {
            this.gameState = 'won';
            // Mostrar mensaje de victoria después de un breve delay para que se vean las animaciones
            setTimeout(() => {
                this.showWinMessage();
            }, 1000);
        } else if (this.currentAttempt >= this.maxGuesses) {
            this.gameState = 'lost';
            // Mostrar mensaje de derrota después de un breve delay
            setTimeout(() => {
                this.showLoseMessage();
            }, 1000);
        }
    }


    /**
     * Usa una pista
     */
    useHint() {
        if (this.hints.length === 0 || this.gameState !== 'playing') return;

        // Tomar una pista aleatoria de las disponibles
        const randomIndex = Math.floor(Math.random() * this.hints.length);
        const selectedHint = this.hints[randomIndex];
        
        // Mover la pista de disponibles a usadas
        this.hints.splice(randomIndex, 1);
        this.usedHints.push(selectedHint);
        
        // Actualizar solo las pistas
        this.updateHints();
        this.updateHintButton();
    }

    /**
     * Actualiza la visualización del juego
     */
    updateDisplay() {
        // Solo actualizar la información
        this.updateGameInfo();
    }


    /**
     * Agrega animación de temblor a la fila que acaba de ser completada
     */
    addShakeAnimation() {
        const completedRow = this.container.querySelector(`.guess-row:nth-child(${this.currentAttempt})`);
        if (completedRow) {
            completedRow.classList.add('shake');
            // Remover la animación después de que termine
            setTimeout(() => {
                completedRow.classList.remove('shake');
            }, 500);
        }
    }

    /**
     * Remueve animación de temblor de la fila actual
     */
    removeShakeAnimation() {
        const currentRow = this.container.querySelector(`.guess-row:nth-child(${this.currentAttempt + 1})`);
        if (currentRow) {
            currentRow.classList.remove('shake');
        }
    }


    /**
     * Agrega animación escalonada a las letras de la fila completada
     */
    addStaggeredLetterAnimation() {
        const completedRow = this.container.querySelector(`.guess-row:nth-child(${this.currentAttempt})`);
        if (completedRow) {
            const letters = completedRow.querySelectorAll('.letter-box');
            letters.forEach((letter, index) => {
                setTimeout(() => {
                    letter.style.animationDelay = '0s';
                    letter.classList.add('letter-flip');
                }, index * 100);
            });
        }
    }

    /**
     * Actualiza solo el tablero del juego
     */
    updateGameBoard() {
        const gameBoard = this.container.querySelector('.game-board');
        if (gameBoard) {
            gameBoard.innerHTML = this.renderGameBoard();
        }
    }

    /**
     * Actualiza solo la fila actual sin afectar las ya validadas
     */
    updateCurrentRow() {
        const currentRow = this.container.querySelector(`.guess-row:nth-child(${this.currentAttempt + 1})`);
        if (currentRow) {
            let rowClass = 'guess-row';
            
            let rowHTML = `<div class="${rowClass}">`;
            
            for (let j = 0; j < this.targetWord.longitud; j++) {
                let letter = '';
                let letterClass = '';
                
                if (this.guesses[this.currentAttempt]) {
                    // Fila completada y validada
                    letter = this.guesses[this.currentAttempt][j];
                    letterClass = this.getLetterClass(this.currentAttempt, j);
                } else if (j < this.currentGuess.length) {
                    // Fila actual con letras escritas
                    letter = this.currentGuess[j];
                    letterClass = 'filled';
                }
                
                rowHTML += `<div class="letter-box ${letterClass}">${letter}</div>`;
            }
            
            rowHTML += '</div>';
            currentRow.outerHTML = rowHTML;
        }
    }

    /**
     * Actualiza la información del juego
     */
    updateGameInfo() {
        const statValues = this.container.querySelectorAll('.stat-item .stat-value');
        
        if (statValues.length >= 1) {
            statValues[0].textContent = `${this.currentAttempt}/${this.maxGuesses}`;
        }
    }

    /**
     * Actualiza las pistas usadas
     */
    updateHints() {
        const hintsList = this.container.querySelector('.hints-list');
        if (hintsList) {
            hintsList.innerHTML = this.renderHints();
        }
    }

    /**
     * Actualiza el botón de pistas
     */
    updateHintButton() {
        const hintBtn = this.container.querySelector('#use-hint');
        if (hintBtn) {
            hintBtn.disabled = this.hints.length === 0;
            const hintText = hintBtn.querySelector('.hint-text');
            if (hintText) {
                hintText.textContent = this.hints.length === 0 ? 'Sin pistas' : 'Revelar Pista';
            }
        }
    }


    /**
     * Muestra mensaje de victoria
     */
    showWinMessage() {
        // Crear un modal o overlay para el mensaje de victoria
        const overlay = document.createElement('div');
        overlay.className = 'game-overlay';
        overlay.innerHTML = `
            <div class="game-message win">
                <h3>¡Felicidades!</h3>
                <div class="word-reveal">
                    <p class="reveal-label">Has adivinado la palabra:</p>
                    <p class="reveal-word">${this.targetWord.palabra}</p>
                    <p class="reveal-translation">${this.targetWord.traducciones.es.traduccion}</p>
                </div>
                <div class="game-end-options">
                    <button class="btn btn-primary" id="play-again">Jugar de nuevo</button>
                </div>
            </div>
        `;
        
        // Agregar estilos para el overlay
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;
        
        this.container.appendChild(overlay);
        
        // Agregar event listener para el botón de jugar de nuevo
        const playAgainBtn = overlay.querySelector('#play-again');
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => {
                this.newGame();
                overlay.remove();
            });
        }
        
        // Agregar event listener para Enter en el modal
        const handleModalKeydown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.newGame();
                overlay.remove();
                document.removeEventListener('keydown', handleModalKeydown);
            }
        };
        document.addEventListener('keydown', handleModalKeydown);
    }

    /**
     * Muestra mensaje de derrota
     */
    showLoseMessage() {
        // Crear un modal o overlay para el mensaje de derrota
        const overlay = document.createElement('div');
        overlay.className = 'game-overlay';
        overlay.innerHTML = `
            <div class="game-message lose">
                <h3>¡Inténtalo de nuevo!</h3>
                <div class="word-reveal">
                    <p class="reveal-label">La palabra era:</p>
                    <p class="reveal-word">${this.targetWord.palabra}</p>
                    <p class="reveal-translation">${this.targetWord.traducciones.es.traduccion}</p>
                </div>
                <div class="game-end-options">
                    <button class="btn btn-primary" id="play-again">Jugar de nuevo</button>
                </div>
            </div>
        `;
        
        // Agregar estilos para el overlay
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;
        
        this.container.appendChild(overlay);
        
        // Agregar event listener para el botón de jugar de nuevo
        const playAgainBtn = overlay.querySelector('#play-again');
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => {
                this.newGame();
                overlay.remove();
            });
        }
        
        // Agregar event listener para Enter en el modal
        const handleModalKeydown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.newGame();
                overlay.remove();
                document.removeEventListener('keydown', handleModalKeydown);
            }
        };
        document.addEventListener('keydown', handleModalKeydown);
    }

    /**
     * Muestra confetti cuando la palabra es correcta
     */
    showConfetti() {
        // Verificar que confetti esté disponible
        if (typeof confetti !== 'undefined') {
            // Configuración del confetti
            const count = 200;
            const defaults = {
                origin: { y: 0.7 }
            };

            function fire(particleRatio, opts) {
                confetti({
                    ...defaults,
                    ...opts,
                    particleCount: Math.floor(count * particleRatio)
                });
            }

            // Disparar confetti múltiples veces para un efecto más espectacular
            fire(0.25, {
                spread: 26,
                startVelocity: 55,
            });
            fire(0.2, {
                spread: 60,
            });
            fire(0.35, {
                spread: 100,
                decay: 0.91,
                scalar: 0.8
            });
            fire(0.1, {
                spread: 120,
                startVelocity: 25,
                decay: 0.92,
                scalar: 1.2
            });
            fire(0.1, {
                spread: 120,
                startVelocity: 45,
            });
        }
    }

    /**
     * Inicia un nuevo juego
     */
    newGame() {
        this.cleanup();
        this.initialize();
    }

    /**
     * Limpia el estado del juego
     */
    cleanup() {
        this.removeEventListeners();
        this.currentGuess = '';
        this.guesses = [];
        this.currentAttempt = 0;
        this.usedHints = [];
        this.hints = [...this.targetWord.pistas]; // Restaurar todas las pistas
        this.gameState = 'playing';
    }

    /**
     * Muestra mensaje de error
     */
    showError(message) {
        this.container.innerHTML = `
            <div class="error-state">
                <div class="error-icon">⚠️</div>
                <p>${message}</p>
            </div>
        `;
    }

    /**
     * Establece el callback para cuando termina el juego
     */
    setOnGameEnd(callback) {
        this.onGameEnd = callback;
    }
}

// Exportar para uso en módulos
window.WordleGame = WordleGame;
