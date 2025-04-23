class PicturePoker {
    constructor() {
        this.playerCoins = 10;
        this.currentBet = 1;
        this.defaultBet = 1;
        this.maxBet = 5;
        this.winStreak = 0;
        this.playerCards = [];
        this.luigiCards = [];
        this.selectedCards = new Set();
        this.gameState = 'initial'; // initial, dealing, discarding, revealing

        this.initializeElements();
        this.attachEventListeners();
        this.loadGame(); // Try to load saved game
        this.updateUI();
        this.backgroundMusic = document.getElementById('background-music');
        this.backgroundMusic.volume = 0.5; // Set volume to 50%
        this.musicEnabled = false;
        this.toggleMusicButton = document.getElementById('toggle-music');
        this.toggleMusicButton.addEventListener('click', () => this.toggleMusic());
        this.backgroundMusic.play().catch(error => {
            console.log('Autoplay prevented:', error);
        });
        this.howToPlayButton = document.getElementById('how-to-play');
        this.howToPlayPopup = document.getElementById('how-to-play-popup');
        this.closeHowToPlayButton = document.getElementById('close-how-to-play');
        
        this.howToPlayButton.addEventListener('click', () => this.showHowToPlay());
        this.closeHowToPlayButton.addEventListener('click', () => this.hideHowToPlay());
        this.welcomePopup = document.getElementById('welcome-popup');
        this.closeWelcomeButton = document.getElementById('close-welcome');
        
        this.closeWelcomeButton.addEventListener('click', () => this.handleWelcomeClose());
        
        // Show welcome popup on start
        this.welcomePopup.classList.add('show');
    }

    initializeElements() {
        this.playerCoinsElement = document.getElementById('player-coins');
        this.currentBetElement = document.getElementById('current-bet');
        this.winStreakElement = document.getElementById('win-streak');
        this.increaseBetButton = document.getElementById('increase-bet');
        this.dealCardsButton = document.getElementById('deal-cards');
        this.discardCardsButton = document.getElementById('discard-cards');
        this.saveGameButton = document.getElementById('save-game');
        this.deleteSaveButton = document.getElementById('delete-save');
        this.confirmationPopup = document.getElementById('confirmation-popup');
        this.confirmDeleteButton = document.getElementById('confirm-delete');
        this.cancelDeleteButton = document.getElementById('cancel-delete');
        this.messageArea = document.getElementById('message-area');
        this.playerCardsContainer = document.getElementById('player-cards');
        this.luigiCardsContainer = document.getElementById('luigi-cards');
        this.gameOverOverlay = document.getElementById('game-over');
        this.resetButton = document.getElementById('reset-game');
    }

    attachEventListeners() {
        this.increaseBetButton.addEventListener('click', () => this.increaseBet());
        this.dealCardsButton.addEventListener('click', () => this.dealCards());
        this.discardCardsButton.addEventListener('click', () => this.discardCards());
        this.saveGameButton.addEventListener('click', () => this.saveGame());
        this.deleteSaveButton.addEventListener('click', () => this.showDeleteConfirmation());
        this.confirmDeleteButton.addEventListener('click', () => this.deleteSave());
        this.cancelDeleteButton.addEventListener('click', () => this.hideDeleteConfirmation());
        this.resetButton.addEventListener('click', () => this.resetGame());
    }

    increaseBet() {
        if (this.currentBet < this.maxBet && this.currentBet < this.playerCoins) {
            this.currentBet++;
            this.updateUI();
        }
    }

    async dealCards() {
        if (this.gameState !== 'initial') return;
        
        this.gameState = 'dealing';
        this.updateUI();
        
        // Fade out existing cards if any
        const existingPlayerCards = Array.from(this.playerCardsContainer.children);
        const existingLuigiCards = Array.from(this.luigiCardsContainer.children);
        
        if (existingPlayerCards.length > 0 || existingLuigiCards.length > 0) {
            // Add fade-out animation to all existing cards
            [...existingPlayerCards, ...existingLuigiCards].forEach(card => {
                card.classList.add('fading-out');
            });
            
            // Wait for fade-out animation to complete
            await new Promise(resolve => {
                // Use the animationend event to ensure we wait for the animation to finish
                const handleAnimationEnd = () => {
                    resolve();
                };
                
                // Add event listener to the last card
                const lastCard = [...existingPlayerCards, ...existingLuigiCards].pop();
                if (lastCard) {
                    lastCard.addEventListener('animationend', handleAnimationEnd, { once: true });
                } else {
                    resolve();
                }
            });
        }
        
        // Clear the containers after fade-out
        this.playerCardsContainer.innerHTML = '';
        this.luigiCardsContainer.innerHTML = '';
        
        this.playerCards = this.generateRandomCards(5);
        this.luigiCards = this.generateRandomCards(5);
        
        await this.displayCardsWithAnimation();
        this.gameState = 'discarding';
        this.updateUI();
    }

    generateRandomCards(count) {
        return Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1);
    }

    async displayCardsWithAnimation() {
        this.playerCardsContainer.innerHTML = '';
        this.luigiCardsContainer.innerHTML = '';

        // Deal player cards with animation
        for (let i = 0; i < this.playerCards.length; i++) {
            const cardElement = this.createCard(this.playerCards[i]);
            cardElement.classList.add('sorting');
            this.playerCardsContainer.appendChild(cardElement);
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Deal Luigi's cards with animation (hidden)
        for (let i = 0; i < this.luigiCards.length; i++) {
            const cardElement = this.createCard(this.luigiCards[i], true);
            cardElement.classList.add('sorting');
            this.luigiCardsContainer.appendChild(cardElement);
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Wait for sorting animation to complete
        await new Promise(resolve => setTimeout(resolve, 500));

        // Remove sorting class after animation
        Array.from(this.luigiCardsContainer.children).forEach(card => {
            card.classList.remove('sorting');
        });
        Array.from(this.playerCardsContainer.children).forEach(card => {
            card.classList.remove('sorting');
        });

        // After animations complete, add click handlers to player cards
        Array.from(this.playerCardsContainer.children).forEach((cardElement, index) => {
            cardElement.addEventListener('click', () => this.toggleCardSelection(index));
        });
    }

    createCard(value, isHidden = false) {
        const card = document.createElement('div');
        card.className = 'card';
        if (isHidden) {
            card.classList.add('hidden');
        }
        card.dataset.value = value;
        
        // Create image element
        const img = document.createElement('img');
        img.src = this.getImageForValue(value);
        img.alt = this.getValueName(value);
        img.className = 'card-image';
        
        card.appendChild(img);
        return card;
    }

    getImageForValue(value) {
        const imageMap = {
            1: 'cloud.png',
            2: 'mushroom.png',
            3: 'flower.png',
            4: 'luigi.png',
            5: 'mario.png',
            6: 'star.png'
        };
        return imageMap[value] || '';
    }

    getValueName(value) {
        const nameMap = {
            1: 'Cloud',
            2: 'Mushroom',
            3: 'Flower',
            4: 'Luigi',
            5: 'Mario',
            6: 'Star'
        };
        return nameMap[value] || '';
    }

    toggleCardSelection(index) {
        if (this.gameState !== 'discarding') return;

        const cardElement = this.playerCardsContainer.children[index];
        if (this.selectedCards.has(index)) {
            this.selectedCards.delete(index);
            cardElement.classList.remove('selected');
        } else {
            this.selectedCards.add(index);
            cardElement.classList.add('selected');
        }
    }

    async discardCards() {
        if (this.gameState !== 'discarding') return;

        // Deduct the bet amount when discarding
        this.playerCoins -= this.currentBet;
        this.updateUI();

        // Animate discarding selected cards
        const discardPromises = Array.from(this.selectedCards).map(index => {
            const cardElement = this.playerCardsContainer.children[index];
            cardElement.classList.add('discarding');
            return new Promise(resolve => {
                cardElement.addEventListener('animationend', () => {
                    this.playerCards[index] = Math.floor(Math.random() * 6) + 1;
                    const newCard = this.createCard(this.playerCards[index]);
                    cardElement.replaceWith(newCard);
                    newCard.classList.add('replacing');
                    resolve();
                }, { once: true });
            });
        });

        await Promise.all(discardPromises);

        // Luigi's smarter discard strategy
        const counts = {};
        this.luigiCards.forEach(card => {
            counts[card] = (counts[card] || 0) + 1;
        });

        // Find cards that are part of matches (pairs, three of a kind, etc.)
        const matchingCards = new Set();
        const highCards = new Set(); // Cards worth 4 or more (Luigi and Mario)
        
        Object.entries(counts).forEach(([value, count]) => {
            const numValue = parseInt(value);
            // Keep cards that are part of matches
            if (count >= 2) {
                this.luigiCards.forEach((card, index) => {
                    if (card === numValue) {
                        matchingCards.add(index);
                    }
                });
            }
            // Keep high-value cards (4 or higher) if they're singles
            if (numValue >= 4 && count === 1) {
                this.luigiCards.forEach((card, index) => {
                    if (card === numValue) {
                        highCards.add(index);
                    }
                });
            }
        });

        // Only discard cards that aren't part of matches or high-value singles
        const luigiDiscardIndices = [];
        for (let i = 0; i < this.luigiCards.length; i++) {
            if (!matchingCards.has(i) && !highCards.has(i)) {
                luigiDiscardIndices.push(i);
            }
        }

        // Determine how many cards to discard based on current hand strength
        let discardCount;
        const currentHand = this.evaluateHand(this.luigiCards);
        
        if (currentHand.score >= 4) { // If he has three of a kind or better
            discardCount = Math.floor(Math.random() * 2); // 0-1 cards
        } else if (currentHand.score >= 2) { // If he has a pair
            discardCount = Math.min(Math.floor(Math.random() * 3), luigiDiscardIndices.length); // 0-2 cards
        } else { // If he has nothing
            discardCount = Math.min(2 + Math.floor(Math.random() * 2), luigiDiscardIndices.length); // 2-3 cards
        }

        // Randomly choose cards to discard from the available indices
        const selectedDiscards = new Set();
        while (selectedDiscards.size < discardCount && luigiDiscardIndices.length > 0) {
            const randomIndex = Math.floor(Math.random() * luigiDiscardIndices.length);
            selectedDiscards.add(luigiDiscardIndices[randomIndex]);
            luigiDiscardIndices.splice(randomIndex, 1);
        }

        // Animate Luigi's discards
        const luigiDiscardPromises = Array.from(selectedDiscards).map(index => {
            const cardElement = this.luigiCardsContainer.children[index];
            cardElement.classList.add('discarding');
            return new Promise(resolve => {
                cardElement.addEventListener('animationend', () => {
                    this.luigiCards[index] = Math.floor(Math.random() * 6) + 1;
                    const newCard = this.createCard(this.luigiCards[index], true); // Keep new cards hidden
                    cardElement.replaceWith(newCard);
                    newCard.classList.add('replacing');
                    resolve();
                }, { once: true });
            });
        });

        await Promise.all(luigiDiscardPromises);

        // Set game state to revealing and update UI
        this.gameState = 'revealing';
        this.updateUI();

        // Wait a short moment before revealing
        await new Promise(resolve => setTimeout(resolve, 500));

        // Reveal the winner
        await this.revealWinner();
    }

    async revealWinner() {
        // Sort both players' cards by value (highest to lowest)
        this.playerCards.sort((a, b) => b - a);
        this.luigiCards.sort((a, b) => b - a);

        // Clear both card containers
        this.luigiCardsContainer.innerHTML = '';
        this.playerCardsContainer.innerHTML = '';

        // Show both players' cards with simultaneous animation
        for (let i = 0; i < 5; i++) {
            // Create Luigi's card (now visible)
            const luigiCardElement = this.createCard(this.luigiCards[i]);
            luigiCardElement.classList.add('sorting');
            this.luigiCardsContainer.appendChild(luigiCardElement);

            // Create player's card
            const playerCardElement = this.createCard(this.playerCards[i]);
            playerCardElement.classList.add('sorting');
            this.playerCardsContainer.appendChild(playerCardElement);

            // Wait before showing next pair of cards
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Wait for sorting animation to complete
        await new Promise(resolve => setTimeout(resolve, 500));

        // Remove sorting class after animation
        Array.from(this.luigiCardsContainer.children).forEach(card => {
            card.classList.remove('sorting');
        });
        Array.from(this.playerCardsContainer.children).forEach(card => {
            card.classList.remove('sorting');
        });

        const playerHand = this.evaluateHand(this.playerCards);
        const luigiHand = this.evaluateHand(this.luigiCards);

        // Find the winning cards based on the hand type
        const highlightWinningCards = (cards, handType) => {
            const counts = {};
            cards.forEach(card => {
                counts[card] = (counts[card] || 0) + 1;
            });

            let cardsToHighlight = [];
            if (handType === 'Five of a Kind') {
                cardsToHighlight = cards;
            } else if (handType === 'Four of a Kind') {
                const value = Object.entries(counts).find(([_, count]) => count === 4)[0];
                cardsToHighlight = cards.filter(card => card === parseInt(value));
            } else if (handType === 'Full House') {
                const threeValue = Object.entries(counts).find(([_, count]) => count === 3)[0];
                const twoValue = Object.entries(counts).find(([_, count]) => count === 2)[0];
                cardsToHighlight = cards.filter(card => card === parseInt(threeValue) || card === parseInt(twoValue));
            } else if (handType === 'Three of a Kind') {
                const value = Object.entries(counts).find(([_, count]) => count === 3)[0];
                cardsToHighlight = cards.filter(card => card === parseInt(value));
            } else if (handType === 'Two Pairs') {
                const pairs = Object.entries(counts).filter(([_, count]) => count === 2);
                pairs.forEach(([value]) => {
                    cardsToHighlight = cardsToHighlight.concat(cards.filter(card => card === parseInt(value)));
                });
            } else if (handType === 'Two of a Kind') {
                const value = Object.entries(counts).find(([_, count]) => count === 2)[0];
                cardsToHighlight = cards.filter(card => card === parseInt(value));
            } else {
                // For High Card, highlight the highest card
                cardsToHighlight = [Math.max(...cards)];
            }

            return cardsToHighlight;
        };

        // Highlight the winning cards for both players
        const playerWinningCards = highlightWinningCards(this.playerCards, playerHand.type);
        const luigiWinningCards = highlightWinningCards(this.luigiCards, luigiHand.type);

        // Apply highlighting to the cards
        Array.from(this.playerCardsContainer.children).forEach((card, index) => {
            if (playerWinningCards.includes(this.playerCards[index])) {
                card.classList.add('selected');
            }
        });

        Array.from(this.luigiCardsContainer.children).forEach((card, index) => {
            if (luigiWinningCards.includes(this.luigiCards[index])) {
                card.classList.add('selected');
            }
        });

        let message = '';
        let didWin = false;
        if (playerHand.score > luigiHand.score) {
            const multiplier = this.getMultiplier(playerHand.type);
            const winnings = this.currentBet * multiplier;
            this.playerCoins += winnings;
            message = `You won! ${playerHand.type} (x${multiplier}) - You won ${winnings} coins!`;
            didWin = true;
        } else if (playerHand.score < luigiHand.score) {
            message = `Luigi won with ${luigiHand.type}! You lost ${this.currentBet} coins.`;
            didWin = false;
        } else {
            // Only compare highest cards if the hands are exactly the same type
            if (playerHand.type === luigiHand.type) {
                const playerMax = Math.max(...this.playerCards);
                const luigiMax = Math.max(...this.luigiCards);
                if (playerMax > luigiMax) {
                    const multiplier = this.getMultiplier(playerHand.type);
                    const winnings = this.currentBet * multiplier;
                    this.playerCoins += winnings;
                    message = `You won the tie! ${playerHand.type} (x${multiplier}) - You won ${winnings} coins!`;
                    didWin = true;
                } else {
                    this.playerCoins -= this.currentBet;
                    message = `Luigi won the tie! You lost ${this.currentBet} coins.`;
                    didWin = false;
                }
            } else {
                // If hands are different but have same score, it's a true tie
                message = `It's a tie! No coins won or lost.`;
                didWin = false;
            }
        }

        // Update win streak
        this.updateWinStreak(didWin);

        this.messageArea.textContent = message;
        
        if (this.playerCoins <= 0) {
            await this.gameOver();
        } else {
            this.gameState = 'initial';
            this.currentBet = this.defaultBet;
            this.selectedCards.clear();
            this.updateUI();
        }
    }

    async gameOver() {
        // Make only player cards fall with random directions
        const playerCards = Array.from(this.playerCardsContainer.children);
        const fallDirections = ['left', 'right', 'center'];
        
        // Remove any existing animation classes first
        playerCards.forEach(card => {
            card.classList.remove('falling-left', 'falling-right', 'falling-center');
        });

        // Force a reflow to ensure the animation restarts
        void playerCards[0].offsetWidth;
        
        // Add the falling animation classes
        playerCards.forEach(card => {
            const randomDirection = fallDirections[Math.floor(Math.random() * fallDirections.length)];
            card.classList.add(`falling-${randomDirection}`);
        });

        // Wait for cards to fall
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Show game over overlay
        this.gameOverOverlay.classList.add('show');
    }

    resetGame() {
        this.playerCoins = 10;
        this.currentBet = this.defaultBet;
        this.winStreak = 0;
        this.playerCards = [];
        this.luigiCards = [];
        this.selectedCards.clear();
        this.gameState = 'initial';
        
        // Clear saved game
        localStorage.removeItem('luigiPokerSave');
        
        // Hide game over overlay
        this.gameOverOverlay.classList.remove('show');
        
        // Clear the board
        this.playerCardsContainer.innerHTML = '';
        this.luigiCardsContainer.innerHTML = '';
        this.messageArea.textContent = '';
        
        if (this.musicEnabled) {
            this.backgroundMusic.currentTime = 0;
            this.backgroundMusic.play().catch(error => {
                console.log('Error playing music:', error);
            });
        }
        
        this.updateUI();
    }

    evaluateHand(cards) {
        const counts = {};
        cards.forEach(card => {
            counts[card] = (counts[card] || 0) + 1;
        });

        const values = Object.values(counts).sort((a, b) => b - a);
        
        if (values[0] === 5) return { type: 'Five of a Kind', score: 7 };
        if (values[0] === 4) return { type: 'Four of a Kind', score: 6 };
        if (values[0] === 3 && values[1] === 2) return { type: 'Full House', score: 5 };
        if (values[0] === 3) return { type: 'Three of a Kind', score: 4 };
        if (values[0] === 2 && values[1] === 2) return { type: 'Two Pairs', score: 3 };
        if (values[0] === 2) return { type: 'Two of a Kind', score: 2 };
        return { type: 'High Card', score: 1 };
    }

    getMultiplier(handType) {
        const multipliers = {
            'High Card': 1,
            'Two of a Kind': 2,
            'Two Pairs': 3,
            'Three of a Kind': 4,
            'Full House': 6,
            'Four of a Kind': 8,
            'Five of a Kind': 16
        };
        return multipliers[handType] || 1;
    }

    updateWinStreak(didWin) {
        // Store the old win streak for comparison
        const oldWinStreak = this.winStreak;
        
        // Update the win streak
        if (didWin) {
            this.winStreak++;
        } else {
            this.winStreak = Math.max(0, this.winStreak - 1);
        }
        this.winStreakElement.textContent = this.winStreak;

        // Calculate the multiples of 5
        const oldMultiple = Math.floor(oldWinStreak / 5);
        const newMultiple = Math.floor(this.winStreak / 5);

        // If we've reached a new multiple of 5
        if (newMultiple > oldMultiple) {
            this.defaultBet++;
            this.maxBet = this.defaultBet >= 5 ? 100 : 5;
            this.currentBet = this.defaultBet; // Set current bet to new default
        } 
        // If we've fallen below a multiple of 5
        else if (newMultiple < oldMultiple) {
            this.defaultBet = Math.max(1, this.defaultBet - 1);
            this.maxBet = this.defaultBet >= 5 ? 100 : 5;
            this.currentBet = this.defaultBet; // Set current bet to new default
        }

        // Update the UI to reflect any changes
        this.updateUI();
    }

    updateUI() {
        this.playerCoinsElement.textContent = this.playerCoins;
        this.currentBetElement.textContent = this.currentBet;
        this.winStreakElement.textContent = this.winStreak;

        this.increaseBetButton.disabled = this.gameState !== 'discarding' || this.currentBet >= this.maxBet || this.currentBet >= this.playerCoins;
        this.dealCardsButton.disabled = this.gameState !== 'initial';
        this.discardCardsButton.disabled = this.gameState !== 'discarding';
        this.saveGameButton.disabled = this.gameState !== 'initial';
    }

    saveGame() {
        const gameState = {
            playerCoins: this.playerCoins,
            currentBet: this.currentBet,
            defaultBet: this.defaultBet,
            maxBet: this.maxBet,
            winStreak: this.winStreak,
            playerCards: this.playerCards,
            luigiCards: this.luigiCards,
            gameState: this.gameState
        };
        localStorage.setItem('luigiPokerSave', JSON.stringify(gameState));
        this.messageArea.textContent = 'Game saved!';
        setTimeout(() => {
            if (this.gameState === 'initial') {
                this.messageArea.textContent = '';
            }
        }, 2000);
    }

    showDeleteConfirmation() {
        this.confirmationPopup.classList.add('show');
    }

    hideDeleteConfirmation() {
        this.confirmationPopup.classList.remove('show');
    }

    deleteSave() {
        localStorage.removeItem('luigiPokerSave');
        this.hideDeleteConfirmation();
        this.messageArea.textContent = 'Save deleted!';
        setTimeout(() => {
            this.messageArea.textContent = '';
        }, 2000);
        location.reload(); // Reload the page after deleting save
    }

    loadGame() {
        const savedGame = localStorage.getItem('luigiPokerSave');
        if (savedGame) {
            try {
                this.saveData = JSON.parse(savedGame);
                this.playerCoins = this.saveData.playerCoins;
                this.currentBet = this.saveData.currentBet;
                this.defaultBet = this.saveData.defaultBet;
                this.maxBet = this.saveData.maxBet;
                this.winStreak = this.saveData.winStreak;
                this.playerCards = this.saveData.playerCards;
                this.luigiCards = this.saveData.luigiCards;
                this.gameState = this.saveData.gameState;

                // If there are cards, display them (with Luigi's cards visible)
                if (this.playerCards.length > 0) {
                    this.displaySavedCards();
                }
            } catch (e) {
                console.error('Error loading saved game:', e);
                localStorage.removeItem('luigiPokerSave');
                this.saveData = null;
            }
        } else {
            this.saveData = null;
        }
    }

    displaySavedCards() {
        this.playerCardsContainer.innerHTML = '';
        this.luigiCardsContainer.innerHTML = '';

        // Show player's cards
        for (let i = 0; i < this.playerCards.length; i++) {
            const cardElement = this.createCard(this.playerCards[i]);
            this.playerCardsContainer.appendChild(cardElement);
        }

        // Show Luigi's cards (visible in saved game)
        for (let i = 0; i < this.luigiCards.length; i++) {
            const cardElement = this.createCard(this.luigiCards[i]);
            this.luigiCardsContainer.appendChild(cardElement);
        }

        // Add click handlers to player cards if in discarding state
        if (this.gameState === 'discarding') {
            Array.from(this.playerCardsContainer.children).forEach((cardElement, index) => {
                cardElement.addEventListener('click', () => this.toggleCardSelection(index));
            });
        }
    }

    toggleMusic() {
        if (!this.musicEnabled) {
            this.backgroundMusic.play().then(() => {
                this.musicEnabled = true;
                this.toggleMusicButton.textContent = 'Disable Music';
            }).catch(error => {
                console.log('Error playing music:', error);
            });
        } else {
            this.backgroundMusic.pause();
            this.musicEnabled = false;
            this.toggleMusicButton.textContent = 'Enable Music';
        }
    }

    showHowToPlay() {
        this.howToPlayPopup.classList.add('show');
    }

    hideHowToPlay() {
        this.howToPlayPopup.classList.remove('show');
    }

    handleWelcomeClose() {
        this.welcomePopup.classList.remove('show');
        // Start music after welcome is closed
        this.backgroundMusic.play().then(() => {
            this.musicEnabled = true;
            this.toggleMusicButton.textContent = 'Disable Music';
        }).catch(error => {
            console.log('Error playing music:', error);
        });
        
        // Show how to play if no save exists
        if (!this.saveData) {
            this.showHowToPlay();
        }
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    new PicturePoker();
}); 