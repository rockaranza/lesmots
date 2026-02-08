/**
 * DataManager - Manejo centralizado de datos (Supabase + respaldo JSON)
 * Responsabilidad: Cargar y gestionar datos de vocabulario
 * Origen: intenta Supabase primero; si falla, usa los JSON locales.
 */
class DataManager {
    constructor() {
        this.wordsList = [];
        this.currentWord = null;
        this.isLoaded = false;
        this.recentWords = [];
        this.maxRecentWords = 3;
        /** @type {boolean} true si la lista actual viene de Supabase */
        this.usingSupabase = false;
        /** @type {import('@supabase/supabase-js').SupabaseClient|null} */
        this.supabase = null;
        this._initSupabase();
    }

    _initSupabase() {
        const config = window.LES_MOTS_CONFIG || {};
        const { url, anonKey } = config.supabase || {};
        if (url && anonKey && typeof window.supabase !== 'undefined' && window.supabase.createClient) {
            try {
                const { createClient } = window.supabase;
                this.supabase = createClient(url, anonKey);
            } catch (e) {
                console.warn('Les Mots: no se pudo crear el cliente Supabase', e);
            }
        }
    }

    /**
     * Convierte una fila de Supabase al formato de palabra que usa la app
     * @param {Object} row
     * @returns {Object}
     */
    _rowToWordData(row) {
        return {
            categoria: row.categoria || { fr: row.categoria_nombre, es: '', en: '' },
            palabra: row.palabra,
            longitud: row.longitud,
            genero: row.genero || 'masculin',
            traducciones: row.traducciones || {},
            pistas: row.pistas || [],
        };
    }

    /**
     * Carga la lista de palabras (Supabase o JSON de respaldo)
     * @returns {Promise<void>}
     */
    async loadWordsList() {
        if (this.supabase) {
            try {
                const { data, error } = await this.supabase
                    .from('words')
                    .select('id, filename, categoria_nombre');
                if (!error && data && data.length > 0) {
                    this.wordsList = data.map((row) => ({
                        id: row.id,
                        filename: row.filename,
                        categoria: row.categoria_nombre,
                    }));
                    this.usingSupabase = true;
                    this.isLoaded = true;
                    return;
                }
            } catch (e) {
                console.warn('Les Mots: fallo al cargar lista desde Supabase, usando JSON', e);
            }
        }

        try {
            const response = await fetch('assets/db/words.json');
            if (!response.ok) throw new Error('Error al cargar la lista de palabras');
            const data = await response.json();
            this.wordsList = data.words || [];
            this.usingSupabase = false;
            this.isLoaded = true;
        } catch (error) {
            console.error('Error cargando lista de palabras:', error);
            throw error;
        }
    }

    /**
     * Carga una palabra aleatoria (desde Supabase o desde JSON)
     * @returns {Promise<Object>} Datos de la palabra
     */
    async loadRandomWord() {
        try {
            if (!this.isLoaded) await this.loadWordsList();
            if (this.wordsList.length === 0) throw new Error('No hay palabras disponibles');

            const availableWords = this.wordsList.filter(
                (word) => !this.recentWords.includes(word.id)
            );
            const wordsToChooseFrom =
                availableWords.length > 0 ? availableWords : this.wordsList;
            const randomIndex = Math.floor(Math.random() * wordsToChooseFrom.length);
            const selected = wordsToChooseFrom[randomIndex];

            if (this.usingSupabase && this.supabase) {
                try {
                    const { data: row, error } = await this.supabase
                        .from('words')
                        .select('*')
                        .eq('id', selected.id)
                        .single();
                    if (!error && row) {
                        this.currentWord = this._rowToWordData(row);
                        this.addToRecentWords(selected.id);
                        return this.currentWord;
                    }
                } catch (e) {
                    console.warn('Les Mots: fallo al cargar palabra desde Supabase, usando JSON', e);
                }
            }

            const response = await fetch(`assets/db/${selected.filename}`);
            if (!response.ok) throw new Error(`Error al cargar ${selected.filename}`);
            const wordData = await response.json();
            this.currentWord = wordData;
            this.addToRecentWords(selected.id);
            return wordData;
        } catch (error) {
            console.error('Error cargando palabra aleatoria:', error);
            throw error;
        }
    }

    getCurrentWord() {
        return this.currentWord;
    }

    getWordsList() {
        return this.wordsList;
    }

    isWordsLoaded() {
        return this.isLoaded;
    }

    addToRecentWords(wordId) {
        this.recentWords = this.recentWords.filter((id) => id !== wordId);
        this.recentWords.unshift(wordId);
        if (this.recentWords.length > this.maxRecentWords) {
            this.recentWords = this.recentWords.slice(0, this.maxRecentWords);
        }
    }

    getRecentWords() {
        return [...this.recentWords];
    }

    clearRecentWords() {
        this.recentWords = [];
    }
}

window.DataManager = DataManager;
