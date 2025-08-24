class SpotlightWordGame {
            constructor() {
                this.words = {
                    animals: ['ELEPHANT', 'GIRAFFE', 'DOLPHIN', 'PENGUIN', 'BUTTERFLY', 'KANGAROO', 'RHINOCEROS', 'FLAMINGO'],
                    fruits: ['PINEAPPLE', 'STRAWBERRY', 'WATERMELON', 'BLUEBERRY', 'RASPBERRY', 'KIWI', 'MANGO', 'PAPAYA'],
                    countries: ['AUSTRALIA', 'BRAZIL', 'CANADA', 'DENMARK', 'EGYPT', 'FRANCE', 'GERMANY', 'INDIA'],
                    movies: ['TITANIC', 'AVATAR', 'INCEPTION', 'GLADIATOR', 'INTERSTELLAR', 'MATRIX', 'FROZEN', 'SHREK'],
                    sports: ['BASKETBALL', 'FOOTBALL', 'TENNIS', 'SWIMMING', 'VOLLEYBALL', 'BASEBALL', 'HOCKEY', 'CRICKET']
                };
                
                this.currentWord = '';
                this.currentCategory = '';
                this.revealedLetters = new Set();
                this.score = 0;
                this.round = 1;
                this.lives = 3;
                this.hints = 3;
                this.gameOver = false;
                
                this.initializeGame();
                this.setupEventListeners();
            }

            initializeGame() {
                this.selectRandomWord();
                this.updateDisplay();
                this.updateGameInfo();
                this.showMessage('Guess the word! Use the spotlight to help you.', 'info');
            }

            selectRandomWord() {
                const categories = Object.keys(this.words);
                this.currentCategory = categories[Math.floor(Math.random() * categories.length)];
                const categoryWords = this.words[this.currentCategory];
                this.currentWord = categoryWords[Math.floor(Math.random() * categoryWords.length)];
                this.revealedLetters.clear();
                
                // Reveal first letter as a hint
                this.revealedLetters.add(0);
                
                document.getElementById('category').textContent = this.currentCategory.charAt(0).toUpperCase() + this.currentCategory.slice(1);
            }

            updateDisplay() {
                const wordDisplay = document.getElementById('wordDisplay');
                wordDisplay.innerHTML = '';
                
                for (let i = 0; i < this.currentWord.length; i++) {
                    const letter = document.createElement('span');
                    letter.className = 'letter';
                    
                    if (this.revealedLetters.has(i)) {
                        letter.textContent = this.currentWord[i];
                        letter.classList.add('revealed');
                    } else {
                        letter.textContent = '?';
                        letter.classList.add('hidden');
                        letter.setAttribute('data-letter', this.currentWord[i]); // Store actual letter in data attribute
                    }
                    
                    wordDisplay.appendChild(letter);
                }
            }

            updateGameInfo() {
                document.getElementById('score').textContent = this.score;
                document.getElementById('round').textContent = this.round;
                document.getElementById('lives').textContent = '❤️'.repeat(this.lives);
                document.getElementById('hints').textContent = '💡'.repeat(this.hints);
            }

            setupEventListeners() {
                const guessInput = document.getElementById('guessInput');
                const guessBtn = document.getElementById('guessBtn');
                const hintBtn = document.getElementById('hintBtn');
                const newGameBtn = document.getElementById('newGameBtn');
                const spotlightArea = document.getElementById('spotlightArea');

                guessBtn.addEventListener('click', () => this.makeGuess());
                guessInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.makeGuess();
                });
                
                hintBtn.addEventListener('click', () => this.revealRandomLetter());
                newGameBtn.addEventListener('click', () => this.startNewGame());

                // Spotlight movement on hover
                spotlightArea.addEventListener('mousemove', (e) => {
                    const spotlight = document.getElementById('spotlight');
                    const rect = spotlightArea.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    spotlight.style.left = x - 75 + 'px';
                    spotlight.style.top = y - 75 + 'px';
                    spotlight.classList.remove('moving');
                });

                spotlightArea.addEventListener('mouseleave', () => {
                    const spotlight = document.getElementById('spotlight');
                    spotlight.classList.add('moving');
                });
            }

            makeGuess() {
                if (this.gameOver) return;
                
                const guessInput = document.getElementById('guessInput');
                const guess = guessInput.value.toUpperCase().trim();
                
                if (!guess) {
                    this.showMessage('Please enter a guess!', 'error');
                    return;
                }

                guessInput.value = '';

                if (guess === this.currentWord) {
                    this.correctGuess();
                } else {
                    this.incorrectGuess();
                }
            }

            correctGuess() {
                const points = Math.max(100 - (this.revealedLetters.size * 10), 10);
                this.score += points;
                this.round++;
                
                // Reveal all letters with animation
                for (let i = 0; i < this.currentWord.length; i++) {
                    this.revealedLetters.add(i);
                }
                this.updateDisplay();
                
                this.showMessage(`🎉 Correct! +${points} points`, 'success');
                
                setTimeout(() => {
                    if (this.round <= 10) {
                        this.selectRandomWord();
                        this.updateDisplay();
                        this.updateGameInfo();
                        this.showMessage('Next round! Guess the new word.', 'info');
                    } else {
                        this.showMessage(`🏆 Game Complete! Final Score: ${this.score}`, 'success');
                        this.gameOver = true;
                    }
                }, 2000);
            }

            incorrectGuess() {
                this.lives--;
                this.updateGameInfo();
                
                if (this.lives <= 0) {
                    this.showMessage(`💀 Game Over! The word was: ${this.currentWord}`, 'error');
                    this.gameOver = true;
                } else {
                    this.showMessage(`❌ Wrong! ${this.lives} lives remaining`, 'error');
                }
            }

            revealRandomLetter() {
                if (this.gameOver) return;
                
                if (this.hints <= 0) {
                    this.showMessage('❌ No hints remaining!', 'error');
                    return;
                }
                
                const hiddenIndices = [];
                for (let i = 0; i < this.currentWord.length; i++) {
                    if (!this.revealedLetters.has(i)) {
                        hiddenIndices.push(i);
                    }
                }
                
                if (hiddenIndices.length > 0) {
                    const randomIndex = hiddenIndices[Math.floor(Math.random() * hiddenIndices.length)];
                    this.revealedLetters.add(randomIndex);
                    this.hints--;
                    this.updateDisplay();
                    this.updateGameInfo();
                    this.showMessage(`💡 Letter revealed! ${this.hints} hints remaining`, 'info');
                } else {
                    this.showMessage('All letters are already revealed!', 'info');
                }
            }

            showMessage(text, type) {
                const messageEl = document.getElementById('message');
                messageEl.textContent = text;
                messageEl.className = `message ${type}`;
            }

            startNewGame() {
                this.score = 0;
                this.round = 1;
                this.lives = 3;
                this.hints = 3;
                this.gameOver = false;
                this.selectRandomWord();
                this.updateDisplay();
                this.updateGameInfo();
                this.showMessage('New game started! Good luck!', 'info');
                document.getElementById('guessInput').focus();
            }
        }

        // Start the game when the page loads
        window.addEventListener('load', () => {
            new SpotlightWordGame();
        });