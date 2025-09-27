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
        
        // Sistema de rachas
        this.currentStreak = 0;
        this.bestStreak = 0;
        this.loadStreaks();
        
        // Detectar si es dispositivo móvil
        this.isMobileDevice = this.detectMobileDevice();
    }

    /**
     * Detecta si el usuario está en un dispositivo móvil o tablet
     */
    detectMobileDevice() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        
        // Detectar dispositivos móviles y tablets
        const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
        const tabletRegex = /ipad|android(?!.*mobile)|tablet/i;
        
        // Detectar por tamaño de pantalla (opcional)
        const isSmallScreen = window.innerWidth <= 768;
        
        return mobileRegex.test(userAgent) || tabletRegex.test(userAgent) || isSmallScreen;
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
            
            // Dar la primera pista automáticamente después de un breve delay
            setTimeout(() => {
                this.giveFirstHint();
            }, 500);
            
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
        this.usedHints = [];
        this.hints = [...this.targetWord.pistas]; // Restaurar todas las pistas
        this.gameState = 'playing';
        
        console.log('Juego reiniciado - pistas restauradas:', this.hints.length);
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
                <!-- Título del juego -->
                <header class="game-title">
                            <h1>Les Mots</h1>
                        <div class="game-stats">
                        <div class="stat">
                                <span class="stat-label">Categoría</span>
                            <span class="stat-value">${this.targetWord ? this.targetWord.categoria.fr : 'Cargando...'}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Racha</span>
                            <span class="stat-value streak-value">${this.currentStreak}</span>
                        </div>
                    </div>
                </header>

                <!-- Contenedor principal del juego -->
                <div class="game-main-container">
                    <!-- Columna izquierda: Tablero -->
                    <div class="game-board-section">
                            <div class="game-board">
                                ${this.renderGameBoard()}
                        </div>

                        <!-- Teclado virtual solo en móviles -->
                        ${this.isMobileDevice ? `
                            <div class="keyboard">
                                ${this.renderKeyboard()}
                        </div>
                        ` : ''}
                    </div>

                    <!-- Columna derecha: Pistas -->
                        <div class="hints-section">
                        <div class="hints-header">
                            <h3>Pistas</h3>
                            <button class="hint-btn" id="use-hint">
                                Revelar Pista
                            </button>
                        </div>
                        <div class="hints-container" id="hints-container">
                            ${this.renderHints()}
                        </div>
                    </div>
                </div>

                <!-- Botones de control -->
                <div class="game-controls">
                    <button class="control-btn secondary" id="instructions-btn">
                        ¿Cómo jugar?
                    </button>
                </div>
            </div>
        `;

        this.attachEventListeners();
        
        // Actualizar las pistas después de renderizar
        this.updateHints();
        this.updateHintButton();
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
        const instructionsBtn = this.container.querySelector('#instructions-btn');

        if (hintBtn) {
            hintBtn.addEventListener('click', () => this.useHint());
        }

        if (instructionsBtn) {
            instructionsBtn.addEventListener('click', () => this.openInstructions());
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
        const currentAttemptIndex = this.currentAttempt; // Guardar el índice actual
        this.currentAttempt++;
        this.currentGuess = '';
        
        // Actualizar el tablero completo para mostrar los colores
        this.updateGameBoard();
        this.updateGameInfo();
        
        // Agregar animación escalonada a las letras de la fila completada
        this.addStaggeredLetterAnimation();
        
        // Si la palabra es correcta, mostrar confetti y cambiar estado
        if (isCorrect) {
            console.log('¡Palabra correcta!', this.guesses[currentAttemptIndex]);
            this.gameState = 'won';
            this.incrementStreak(); // Incrementar racha al ganar
            // Mostrar mensaje de victoria después de un breve delay
            setTimeout(() => {
                console.log('Mostrando modal de victoria');
            this.showWinMessage();
            }, 1000);
        } else if (this.currentAttempt >= this.maxGuesses) {
            // Si se agotaron los intentos, mostrar mensaje de derrota
            console.log('Se agotaron los intentos');
            this.gameState = 'lost';
            this.resetStreak(); // Reiniciar racha al perder
            setTimeout(() => {
                console.log('Mostrando modal de derrota');
            this.showLoseMessage();
            }, 1000);
        } else {
            // Si la palabra es incorrecta pero aún hay intentos, agregar temblor
            console.log('Palabra incorrecta, intento', this.currentAttempt, 'de', this.maxGuesses);
            this.addShakeAnimation();
        }
    }

    /**
     * Verifica el estado del juego (método de respaldo)
     */
    checkGameState() {
        // Este método ya no se usa directamente, la lógica está en submitGuess()
        // Se mantiene por compatibilidad
        console.log('checkGameState called - current state:', this.gameState);
    }


    /**
     * Da la primera pista automáticamente al comenzar
     */
    giveFirstHint() {
        console.log('giveFirstHint llamado - hints disponibles:', this.hints.length, 'usadas:', this.usedHints.length, 'gameState:', this.gameState);
        
        // Verificar si ya se alcanzó el límite de 3 pistas
        if (this.usedHints.length >= 3 || this.hints.length === 0 || this.gameState !== 'playing') {
            console.log('No se puede dar primera pista - usadas:', this.usedHints.length, 'disponibles:', this.hints.length, 'gameState:', this.gameState);
            return;
        }

        // Tomar la primera pista disponible
        const firstHint = this.hints[0];
        console.log('Primera pista seleccionada:', firstHint);
        
        // Mover la pista de disponibles a usadas
        this.hints.splice(0, 1);
        this.usedHints.push(firstHint);
        
        console.log('Pistas después de mover:', 'disponibles:', this.hints.length, 'usadas:', this.usedHints.length);
        
        // Actualizar solo las pistas
        this.updateHints();
        this.updateHintButton();
        
        console.log('Primera pista dada automáticamente:', firstHint.fr);
    }

    /**
     * Usa una pista
     */
    useHint() {
        // Verificar si ya se alcanzó el límite de 3 pistas
        if (this.usedHints.length >= 3 || this.hints.length === 0 || this.gameState !== 'playing') {
            console.log('No se puede usar más pistas - usadas:', this.usedHints.length, 'disponibles:', this.hints.length);
            return;
        }

        // Tomar una pista aleatoria de las disponibles
        const randomIndex = Math.floor(Math.random() * this.hints.length);
        const selectedHint = this.hints[randomIndex];
        
        // Mover la pista de disponibles a usadas
        this.hints.splice(randomIndex, 1);
        this.usedHints.push(selectedHint);
        
        console.log('Pista usada:', selectedHint.fr, 'Total usadas:', this.usedHints.length);
        
        // Actualizar solo las pistas
        this.updateHints();
        this.updateHintButton();
    }

    /**
     * Abre el modal de instrucciones
     */
    openInstructions() {
        // Buscar el modal de instrucciones en el DOM
        const instructionsModal = document.getElementById('instructions-modal');
        if (instructionsModal) {
            instructionsModal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Carga las rachas (solo para la sesión actual)
     */
    loadStreaks() {
        // Las rachas se resetean cada vez que se recarga la página
        this.currentStreak = 0;
        this.bestStreak = 0;
    }

    /**
     * Guarda las rachas (solo para la sesión actual)
     */
    saveStreaks() {
        // No se guarda en localStorage, solo se mantiene durante la sesión
        // Las rachas se resetean al recargar la página
    }

    /**
     * Incrementa la racha actual
     */
    incrementStreak() {
        this.currentStreak++;
        const isNewRecord = this.currentStreak > this.bestStreak;
        if (isNewRecord) {
            this.bestStreak = this.currentStreak;
        }
        this.saveStreaks();
        
        // Aplicar efectos visuales
        this.addStreakEffects(isNewRecord);
    }

    /**
     * Aplica efectos visuales a las rachas
     */
    addStreakEffects(isNewRecord) {
        // Buscar el elemento de racha actual (ahora es el 2do elemento)
        const streakItem = this.container.querySelector('.stat-item:nth-child(2)');
        if (!streakItem) return;

        // Efecto de temblor en el número
        streakItem.classList.add('streak-shake');
        setTimeout(() => {
            streakItem.classList.remove('streak-shake');
        }, 500);

        // Si es nuevo récord, agregar efectos especiales
        if (isNewRecord) {
            // Efecto de crecimiento en el número
            streakItem.classList.add('streak-grow');
            
            // Efecto de fuego alrededor del contenedor
            streakItem.classList.add('streak-fire');
            
            // Efecto de récord permanente en el número
            streakItem.classList.add('streak-record');
            
            // Mantener el efecto de crecimiento temporal
            setTimeout(() => {
                streakItem.classList.remove('streak-grow');
            }, 800);
        }
    }

    /**
     * Reinicia la racha actual
     */
    resetStreak() {
        this.currentStreak = 0;
        this.saveStreaks();
        
        // Remover efectos especiales si existen
        const streakItem = this.container.querySelector('.stat-item:nth-child(2)');
        if (streakItem) {
            streakItem.classList.remove('streak-fire', 'streak-record');
        }
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
        
        // Actualizar solo la racha actual (segundo elemento)
        if (statValues.length >= 2) {
            statValues[1].textContent = this.currentStreak; // Racha actual
        }
    }

    /**
     * Actualiza las pistas usadas
     */
    updateHints() {
        console.log('updateHints llamado - usedHints:', this.usedHints.length);
        const hintsList = this.container.querySelector('#hints-container');
        console.log('Elemento hints-container encontrado:', hintsList);
        
        if (hintsList) {
            const hintsHTML = this.renderHints();
            console.log('HTML de pistas generado:', hintsHTML);
            hintsList.innerHTML = hintsHTML;
        } else {
            console.error('No se encontró el elemento #hints-container');
        }
    }

    /**
     * Actualiza el botón de pistas
     */
    updateHintButton() {
        const hintBtn = this.container.querySelector('#use-hint');
        if (hintBtn) {
            // Desactivar si ya se usaron 3 pistas o no hay pistas disponibles
            const isDisabled = this.usedHints.length >= 3 || this.hints.length === 0;
            hintBtn.disabled = isDisabled;
            
            // Actualizar el texto del botón
            let buttonText = 'Revelar Pista';
            if (this.usedHints.length >= 3) {
                buttonText = 'Límite alcanzado';
            } else if (this.hints.length === 0) {
                buttonText = 'Sin pistas';
            } else {
                buttonText = `Revelar Pista (${3 - this.usedHints.length} restantes)`;
            }
            
            hintBtn.textContent = buttonText;
            
            console.log('Botón de pistas actualizado - usadas:', this.usedHints.length, 'disponibles:', this.hints.length, 'deshabilitado:', isDisabled);
        }
    }


    /**
     * Muestra mensaje de victoria
     */
    showWinMessage() {
        console.log('showWinMessage() llamado');
        console.log('targetWord:', this.targetWord);
        
        
        // Verificar que targetWord existe
        if (!this.targetWord) {
            console.error('targetWord no está definido');
            return;
        }
        
        // Verificar que las traducciones existen (manejar ambos casos: traductions y traducciones)
        const traductions = this.targetWord.traductions || this.targetWord.traducciones;
        if (!traductions || !traductions.es) {
            console.error('Traducciones no están definidas:', this.targetWord.traductions || this.targetWord.traducciones);
            return;
        }
        
        // Crear un modal o overlay para el mensaje de victoria
        const overlay = document.createElement('div');
        overlay.className = 'game-overlay';
        overlay.innerHTML = `
            <div class="game-modal-content">
                <div class="game-modal-header">
                    <h2 class="game-modal-title win">¡Felicidades!</h2>
                </div>
                <div class="game-modal-body">
                    <div class="word-reveal">
                        <p class="reveal-label">Has adivinado la palabra:</p>
                        <div class="reveal-word">${this.targetWord.palabra}</div>
                        <p class="reveal-translation">${traductions.es.traduccion}</p>
                    </div>
                </div>
                <div class="game-modal-footer">
                    <button class="control-btn primary" id="play-again">Continuar</button>
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
        console.log('showLoseMessage() llamado');
        console.log('targetWord:', this.targetWord);
        
        // Verificar que targetWord existe
        if (!this.targetWord) {
            console.error('targetWord no está definido');
            return;
        }
        
        // Verificar que las traducciones existen (manejar ambos casos: traductions y traducciones)
        const traductions = this.targetWord.traductions || this.targetWord.traducciones;
        if (!traductions || !traductions.es) {
            console.error('Traducciones no están definidas:', this.targetWord.traductions || this.targetWord.traducciones);
            return;
        }
        
        // Crear un modal o overlay para el mensaje de derrota
        const overlay = document.createElement('div');
        overlay.className = 'game-overlay';
        overlay.innerHTML = `
            <div class="game-modal-content">
                <div class="game-modal-header">
                    <h2 class="game-modal-title lose">¡Inténtalo de nuevo!</h2>
                </div>
                <div class="game-modal-body">
                    <div class="word-reveal">
                        <p class="reveal-label">La palabra era:</p>
                        <div class="reveal-word">${this.targetWord.palabra}</div>
                        <p class="reveal-translation">${traductions.es.traduccion}</p>
                    </div>
                </div>
                <div class="game-modal-footer">
                    <button class="control-btn primary" id="play-again">Continuar</button>
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
     * Inicia un nuevo juego
     */
    newGame() {
        this.cleanup();
        this.initialize();
    }

    /**
     * Inicia un nuevo juego reiniciando la racha
     */
    newGameWithReset() {
        this.cleanup();
        this.resetStreak(); // Reiniciar racha al presionar "Nueva Palabra"
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
