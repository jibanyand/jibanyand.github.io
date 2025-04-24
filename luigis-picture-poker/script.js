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

        // Settings menu elements
        this.settingsButton = document.getElementById('settings');
        this.settingsPopup = document.getElementById('settings-popup');
        this.closeSettingsButton = document.getElementById('close-settings');
        
        this.settingsButton.addEventListener('click', () => this.showSettings());
        this.closeSettingsButton.addEventListener('click', () => this.hideSettings());
        
        // Show welcome popup on start
        this.welcomePopup.classList.add('show');

        // Game modifiers
        this.showLuigiHand = false;
        this.hardMode = false;
        this.callWario = false;

        // Initialize game modifiers from localStorage
        this.initializeGameModifiers();
        this.attachGameModifiers();

        // Update music based on initial state
        this.updateMusic();
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

        // If Call Wario is enabled, automatically play the hand
        if (this.callWario) {
            // Wait a short moment before auto-playing
            await new Promise(resolve => setTimeout(resolve, 1000));
            await this.autoPlayHand();
        }
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

        // Deal Luigi's cards with animation (hidden or visible based on setting)
        for (let i = 0; i < this.luigiCards.length; i++) {
            const cardElement = this.createCard(this.luigiCards[i], !this.showLuigiHand);
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
        if (this.gameState !== 'discarding' || this.callWario) return;

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

        // Immediately change game state and disable the button to prevent multiple clicks
        this.gameState = 'animating';
        this.updateUI();

        // Update the bet deduction from here since we'll handle it in revealWinner
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

        // Luigi's enhanced discard strategy
        const counts = {};
        this.luigiCards.forEach(card => {
            counts[card] = (counts[card] || 0) + 1;
        });

        // Calculate hand strength and potential
        const currentHand = this.evaluateHand(this.luigiCards);
        const cardValues = Object.keys(counts).map(Number).sort((a, b) => b - a);
        const highCards = cardValues.filter(value => value >= 4);
        const pairs = Object.entries(counts).filter(([_, count]) => count === 2);
        const threeOfAKind = Object.entries(counts).find(([_, count]) => count === 3);
        const fourOfAKind = Object.entries(counts).find(([_, count]) => count === 4);

        // Initialize selectedDiscards
        let selectedDiscards = new Set();

        // Strategy based on current hand strength
        if (currentHand.score >= 6) { // Four of a Kind or better
            // Keep everything if we have four of a kind or better
            selectedDiscards = new Set();
        } else if (currentHand.score === 5) { // Full House
            // Keep the full house, but consider upgrading if we have high cards
            const [threeValue, twoValue] = Object.entries(counts)
                .sort((a, b) => b[1] - a[1])
                .map(([value]) => parseInt(value));
            
            // If we have a high card that could make a better hand, consider discarding the pair
            if (highCards.length > 0 && highCards[0] > twoValue) {
                    this.luigiCards.forEach((card, index) => {
                    if (card === twoValue) {
                        selectedDiscards.add(index);
                        }
                    });
                }
        } else if (currentHand.score === 4) { // Three of a Kind
            // Keep the three of a kind, consider discarding others for better potential
            const threeValue = parseInt(threeOfAKind[0]);
            const otherCards = this.luigiCards.filter(card => card !== threeValue);
            
            // If we have high cards that could make a full house, keep them
            const highOtherCards = otherCards.filter(card => card >= 4);
            if (highOtherCards.length > 0) {
                // Keep the highest card that could make a full house
                const highestCard = Math.max(...highOtherCards);
                this.luigiCards.forEach((card, index) => {
                    if (card !== threeValue && card !== highestCard) {
                        selectedDiscards.add(index);
                    }
                });
            } else {
                // Discard the lowest cards
                const lowestCard = Math.min(...otherCards);
                this.luigiCards.forEach((card, index) => {
                    if (card === lowestCard) {
                        selectedDiscards.add(index);
                    }
                });
            }
        } else if (currentHand.score === 3) { // Two Pairs
            // Keep the higher pair, consider discarding the lower pair if we have high cards
            const pairs = Object.entries(counts)
                .filter(([_, count]) => count === 2)
                .map(([value]) => parseInt(value))
                .sort((a, b) => b - a);
            
            if (highCards.length > 0 && highCards[0] > pairs[1]) {
                // Discard the lower pair if we have a high card that could make a better hand
                this.luigiCards.forEach((card, index) => {
                    if (card === pairs[1]) {
                        selectedDiscards.add(index);
                    }
                });
            }
        } else if (currentHand.score === 2) { // One Pair
            // Keep the pair and highest remaining card
            const pairValue = parseInt(Object.entries(counts).find(([_, count]) => count === 2)[0]);
            const otherCards = this.luigiCards.filter(card => card !== pairValue);
            const highestOtherCard = Math.max(...otherCards);
            
            this.luigiCards.forEach((card, index) => {
                if (card !== pairValue && card !== highestOtherCard) {
                    selectedDiscards.add(index);
                }
            });
        } else { // High Card or Nothing
            // Keep the highest cards, discard the rest
            const sortedCards = [...this.luigiCards].sort((a, b) => b - a);
            const keepCount = Math.min(2, sortedCards.length); // Keep top 2 cards
            
            this.luigiCards.forEach((card, index) => {
                if (!sortedCards.slice(0, keepCount).includes(card)) {
                    selectedDiscards.add(index);
                }
            });
        }

        // Limit the number of cards to discard based on hand strength
        const maxDiscards = Math.min(3, selectedDiscards.size);
        if (selectedDiscards.size > maxDiscards) {
            // Convert to array, sort by card value (lowest first), and keep only maxDiscards
            const discardArray = Array.from(selectedDiscards)
                .sort((a, b) => this.luigiCards[a] - this.luigiCards[b])
                .slice(0, maxDiscards);
            selectedDiscards = new Set(discardArray);
        }

        // Animate Luigi's discards
        const luigiDiscardPromises = Array.from(selectedDiscards).map(index => {
            const cardElement = this.luigiCardsContainer.children[index];
            cardElement.classList.add('discarding');
            return new Promise(resolve => {
                cardElement.addEventListener('animationend', () => {
                    this.luigiCards[index] = Math.floor(Math.random() * 6) + 1;
                    const newCard = this.createCard(this.luigiCards[index], !this.showLuigiHand);
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
            // Create Luigi's card (always visible during reveal)
            const luigiCardElement = this.createCard(this.luigiCards[i], false);
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
        if (!this.callWario) {
        if (playerHand.score > luigiHand.score) {
            const multiplier = this.getMultiplier(playerHand.type);
            const winnings = this.currentBet * multiplier;
            this.playerCoins += winnings;
            message = `You won! ${playerHand.type} (x${multiplier}) - You won ${winnings} coins!`;
            didWin = true;
        } else if (playerHand.score < luigiHand.score) {
            this.playerCoins -= this.currentBet;
            message = `Luigi won with ${luigiHand.type}! You lost ${this.currentBet} coins.`;
            didWin = false;
        } else {
            // Only compare highest cards if the hands are exactly the same type
            if (playerHand.type === luigiHand.type) {
                    if (playerHand.type === 'Full House') {
                        // For Full House, first compare the three of a kind value
                        const playerCounts = {};
                        const luigiCounts = {};
                        this.playerCards.forEach(card => playerCounts[card] = (playerCounts[card] || 0) + 1);
                        this.luigiCards.forEach(card => luigiCounts[card] = (luigiCounts[card] || 0) + 1);
                        
                        const playerThreeValue = parseInt(Object.entries(playerCounts).find(([_, count]) => count === 3)[0]);
                        const luigiThreeValue = parseInt(Object.entries(luigiCounts).find(([_, count]) => count === 3)[0]);
                        
                        if (playerThreeValue > luigiThreeValue) {
                            const multiplier = this.getMultiplier(playerHand.type);
                            const winnings = this.currentBet * multiplier;
                            this.playerCoins += winnings;
                            message = `You won the tie! ${playerHand.type} (x${multiplier}) - You won ${winnings} coins!`;
                            didWin = true;
                        } else if (playerThreeValue < luigiThreeValue) {
                            this.playerCoins -= this.currentBet;
                            message = `Luigi won the tie! You lost ${this.currentBet} coins.`;
                            didWin = false;
                        } else {
                            // If three of a kind values are equal, compare the pair values
                            const playerTwoValue = parseInt(Object.entries(playerCounts).find(([_, count]) => count === 2)[0]);
                            const luigiTwoValue = parseInt(Object.entries(luigiCounts).find(([_, count]) => count === 2)[0]);
                            
                            if (playerTwoValue > luigiTwoValue) {
                                const multiplier = this.getMultiplier(playerHand.type);
                                const winnings = this.currentBet * multiplier;
                                this.playerCoins += winnings;
                                message = `You won the tie! ${playerHand.type} (x${multiplier}) - You won ${winnings} coins!`;
                                didWin = true;
                            } else if (playerTwoValue < luigiTwoValue) {
                                this.playerCoins -= this.currentBet;
                                message = `Luigi won the tie! You lost ${this.currentBet} coins.`;
                                didWin = false;
                            } else {
                                // True tie - same three of a kind and pair values
                                message = `It's a tie! You get your bet back.`;
                                didWin = false;
                            }
                        }
                    } else {
                // First compare the highest value in highlighted cards
                const playerHighlightedMax = Math.max(...playerWinningCards);
                const luigiHighlightedMax = Math.max(...luigiWinningCards);
                
                if (playerHighlightedMax > luigiHighlightedMax) {
                    const multiplier = this.getMultiplier(playerHand.type);
                    const winnings = this.currentBet * multiplier;
                    this.playerCoins += winnings;
                    message = `You won the tie! ${playerHand.type} (x${multiplier}) - You won ${winnings} coins!`;
                    didWin = true;
                } else if (playerHighlightedMax < luigiHighlightedMax) {
                    // Only deduct the bet amount here if the player loses the tie
                    this.playerCoins -= this.currentBet;
                    message = `Luigi won the tie! You lost ${this.currentBet} coins.`;
                    didWin = false;
                } else {
                    // If highlighted cards are equal, compare unhighlighted cards
                    const playerUnhighlighted = this.playerCards.filter(card => !playerWinningCards.includes(card));
                    const luigiUnhighlighted = this.luigiCards.filter(card => !luigiWinningCards.includes(card));
                    
                    const playerUnhighlightedMax = Math.max(...playerUnhighlighted);
                    const luigiUnhighlightedMax = Math.max(...luigiUnhighlighted);
                    
                    if (playerUnhighlightedMax > luigiUnhighlightedMax) {
                        const multiplier = this.getMultiplier(playerHand.type);
                        const winnings = this.currentBet * multiplier;
                        this.playerCoins += winnings;
                        message = `You won the tie! ${playerHand.type} (x${multiplier}) - You won ${winnings} coins!`;
                        didWin = true;
                    } else if (playerUnhighlightedMax < luigiUnhighlightedMax) {
                        // Only deduct the bet amount here if the player loses the tie
                        this.playerCoins -= this.currentBet;
                        message = `Luigi won the tie! You lost ${this.currentBet} coins.`;
                        didWin = false;
                    } else {
                        // True tie - same hand type and same card values
                        message = `It's a tie! You get your bet back.`;
                        didWin = false;
                            }
                    }
                }
            } else {
                // If hands are different but have same score, compare the actual card values
                // Sort both hands in descending order for comparison
                const sortedPlayerCards = [...this.playerCards].sort((a, b) => b - a);
                const sortedLuigiCards = [...this.luigiCards].sort((a, b) => b - a);
                
                // Compare each card in order
                    let tieResolved = false;
                for (let i = 0; i < 5; i++) {
                    if (sortedPlayerCards[i] > sortedLuigiCards[i]) {
                        const multiplier = this.getMultiplier(playerHand.type);
                        const winnings = this.currentBet * multiplier;
                        this.playerCoins += winnings;
                        message = `You won! ${playerHand.type} (x${multiplier}) - You won ${winnings} coins!`;
                        didWin = true;
                            tieResolved = true;
                        break;
                    } else if (sortedPlayerCards[i] < sortedLuigiCards[i]) {
                        this.playerCoins -= this.currentBet;
                        message = `Luigi won with ${luigiHand.type}! You lost ${this.currentBet} coins.`;
                        didWin = false;
                            tieResolved = true;
                        break;
                    }
                }
                
                    // If we get here and tieResolved is false, it means all cards are equal
                    if (!tieResolved) {
                    message = `It's a tie! You get your bet back.`;
                    didWin = false;
                }
            }
        }

        // Update win streak
        this.updateWinStreak(didWin);
        } else {
            // In Call Wario mode, just show the result without affecting coins or win streak
            if (playerHand.score > luigiHand.score) {
                message = `Wario won! ${playerHand.type}`;
            } else if (playerHand.score < luigiHand.score) {
                message = `Luigi won with ${luigiHand.type}!`;
            } else {
                message = `It's a tie!`;
            }
        }

        this.messageArea.textContent = message;
        
        if (this.playerCoins <= 0) {
            await this.gameOver();
        } else {
            this.gameState = 'initial';
            this.currentBet = this.defaultBet;
            this.selectedCards.clear();
            this.updateUI();

            // If Call Wario is enabled, automatically deal the next hand
            if (this.callWario) {
                // Wait a short moment before dealing the next hand
                await new Promise(resolve => setTimeout(resolve, 2000));
                await this.dealCards();
            }
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

        // Disable betting and discarding in Wario mode
        const isWarioMode = this.callWario && this.gameState === 'discarding';
        this.increaseBetButton.disabled = isWarioMode || this.gameState !== 'discarding' || this.currentBet >= this.maxBet || this.currentBet >= this.playerCoins;
        this.dealCardsButton.disabled = this.gameState !== 'initial';
        this.discardCardsButton.disabled = isWarioMode || this.gameState !== 'discarding' || this.gameState === 'animating';
        this.saveGameButton.disabled = this.gameState !== 'initial';

        // Update game modifier toggle states
        const showLuigiHandToggle = document.getElementById('show-luigi-hand');
        const hardModeToggle = document.getElementById('hard-mode');
        const callWarioToggle = document.getElementById('call-wario');
        
        if (showLuigiHandToggle) showLuigiHandToggle.disabled = this.gameState !== 'initial';
        if (hardModeToggle) hardModeToggle.disabled = this.gameState !== 'initial';
        if (callWarioToggle) callWarioToggle.disabled = this.gameState !== 'initial';

        // Update UI for Wario mode
        const playerCardsTitle = document.querySelector('.player-cards h2');
        if (playerCardsTitle) {
            playerCardsTitle.textContent = this.callWario ? "Wario's Cards" : "Your Cards";
        }

        // Update How to Play text based on Wario mode
        this.updateHowToPlayText();

        // Add or remove Wario mode class based on the actual state
        document.body.classList.toggle('wario-mode', this.callWario);
    }

    updateHowToPlayText() {
        const howToPlayTitle = document.querySelector('.how-to-play-popup h2');
        const howToPlayInstructions = document.querySelector('.how-to-play-popup .instructions');
        const howToPlayButton = document.querySelector('#close-how-to-play');

        if (this.callWario) {
            // Wario's version
            if (howToPlayTitle) howToPlayTitle.textContent = "WARIO'S ULTIMATE POKER GUIDE";
            if (howToPlayButton) howToPlayButton.textContent = "WARIO TIME!";
            if (howToPlayInstructions) {
                howToPlayInstructions.innerHTML = `
                    <p>1. START WITH 10 COINS, CHUMP CHANGE FOR A GENIUS LIKE ME!</p>
                    <p>2. CLICK "DEAL CARDS", WAH!!</p>
                    <p>3. SELECT CARDS TO DISCARD, WAH-HA! GET RID OF THE JUNK!</p>
                    <p>4. CLICK "DISCARD SELECTED", NEW CARDS, NEW CHANCES!</p>
                    <p>5. CLICK "CONTINUE" TO SEE WHO WINS! HINT: IT'S GONNA BE ME!</p>
                    <p>6. WIN COINS BY BEATING LUIGI, WAH-HA-HA! HIS TEARS TASTE LIKE GARLIC!</p>
                    <br>
                    <p><strong>HAND RANKINGS (FROM BEST TO WORST):</strong></p>
                    <p>• FIVE OF A KIND (x16) - WAH-HA-HA! I'M THE BEST!</p>
                    <p>• FOUR OF A KIND (x8) - NICE, VERY NICE!</p>
                    <p>• FULL HOUSE (x6) - NOT BAD, LUIGI'S GONNA LOSE!</p>
                    <p>• THREE OF A KIND (x4) - WAH-HA! ENOUGH TO MAKE LUIGI CRY!</p>
                    <p>• TWO PAIRS (x3) - BETTER THAN LUIGI CAN DO!</p>
                    <p>• ONE PAIR (x2) - EVEN WALUIGI COULD BEAT LUIGI WITH THIS!</p>
                    <p>• JUNK (x1) - NOT NICE!</p>
                `;
            }
        } else {
            // Normal version
            if (howToPlayTitle) howToPlayTitle.textContent = "How to Play Luigi's Picture Poker";
            if (howToPlayButton) howToPlayButton.textContent = "Got it!";
            if (howToPlayInstructions) {
                howToPlayInstructions.innerHTML = `
                    <p>1. Start with 10 coins</p>
                    <p>2. Click "Deal Cards" to begin a round</p>
                    <p>3. Select cards you want to discard by clicking them</p>
                    <p>4. Click "Discard Selected" to replace your chosen cards</p>
                    <p>5. Click "Continue" to reveal the winner</p>
                    <p>6. Win coins by getting better hands than Luigi!</p>
                    <br>
                    <p><strong>Hand Rankings (from highest to lowest):</strong></p>
                    <p>• Five of a Kind (x16)</p>
                    <p>• Four of a Kind (x8)</p>
                    <p>• Full House (x6)</p>
                    <p>• Three of a Kind (x4)</p>
                    <p>• Two Pairs (x3)</p>
                    <p>• One Pair (x2)</p>
                    <p>• Junk (x1)</p>
                `;
            }
        }
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
        // Also remove the game modifier settings
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

        // Update music based on Wario mode
        this.updateMusic();
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

    showSettings() {
        this.settingsPopup.classList.add('show');
    }

    hideSettings() {
        this.settingsPopup.classList.remove('show');
    }

    // Game modifiers
    initializeGameModifiers() {
        // Check if there's a saved game
        const hasSavedGame = localStorage.getItem('luigiPokerSave') !== null;
        
        if (hasSavedGame) {
            // Only load saved settings if there's a saved game
            this.showLuigiHand = localStorage.getItem('showLuigiHand') === 'true';
            this.hardMode = localStorage.getItem('hardMode') === 'true';
            // Always start with Wario mode off
            this.callWario = false;
        } else {
            // Force default settings for new game
            this.showLuigiHand = false;
            this.hardMode = false;
            this.callWario = false;
            // Clear any existing settings
            localStorage.removeItem('showLuigiHand');
            localStorage.removeItem('hardMode');
            localStorage.removeItem('callWario');
        }
        
        // Update the UI to reflect the actual state
        const showLuigiHandToggle = document.getElementById('show-luigi-hand');
        const hardModeToggle = document.getElementById('hard-mode');
        const callWarioToggle = document.getElementById('call-wario');
        
        if (showLuigiHandToggle) showLuigiHandToggle.checked = this.showLuigiHand;
        if (hardModeToggle) hardModeToggle.checked = this.hardMode;
        if (callWarioToggle) callWarioToggle.checked = this.callWario;

        // Ensure the bet display is updated according to the current state
        this.updateBetDisplay();

        // Ensure Wario mode class is removed from body
        document.body.classList.remove('wario-mode');
    }

    // Add event listeners for game modifiers
    attachGameModifiers() {
        const showLuigiHandToggle = document.getElementById('show-luigi-hand');
        const hardModeToggle = document.getElementById('hard-mode');
        const callWarioToggle = document.getElementById('call-wario');

        if (showLuigiHandToggle) {
            showLuigiHandToggle.addEventListener('change', function(e) {
                if (this.gameState === 'initial') {
                    this.showLuigiHand = e.target.checked;
                    localStorage.setItem('showLuigiHand', this.showLuigiHand);
                }
            }.bind(this));
        }

        if (hardModeToggle) {
            hardModeToggle.addEventListener('change', function(e) {
                if (this.gameState === 'initial') {
                    this.hardMode = e.target.checked;
                    localStorage.setItem('hardMode', this.hardMode);
                    this.updateBetDisplay();
                    this.updateUI();
                }
            }.bind(this));
        }

        if (callWarioToggle) {
            callWarioToggle.addEventListener('change', function(e) {
                if (this.gameState === 'initial') {
                    this.callWario = e.target.checked;
                    localStorage.setItem('callWario', this.callWario);
                    this.updateUI();
                    this.updateMusic();
                }
            }.bind(this));
        }
    }

    updateMusic() {
        if (this.musicEnabled) {
            this.backgroundMusic.pause();
            this.backgroundMusic.src = this.callWario ? 'wario.mp3' : 'casino.mp3';
            this.backgroundMusic.volume = this.callWario ? 0.4 : 0.5;
            this.backgroundMusic.play().catch(error => {
                console.log('Error playing music:', error);
            });
        }
    }

    // Modify updateLuigiHandDisplay to respect the showLuigiHand setting
    updateLuigiHandDisplay() {
        const luigiCards = document.querySelectorAll('#luigi-cards .card');
        luigiCards.forEach(card => {
            if (this.showLuigiHand) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    }

    // Modify updateBetDisplay to respect the hardMode setting
    updateBetDisplay() {
        const currentBetElement = document.getElementById('current-bet');
        if (this.hardMode) {
            currentBetElement.textContent = '5';
            this.currentBet = 5;
            this.defaultBet = 5;
            this.maxBet = 5;
        } else {
            this.defaultBet = 1;
            currentBetElement.textContent = this.defaultBet.toString();
            this.currentBet = this.defaultBet;
            this.maxBet = this.defaultBet >= 5 ? 100 : 5;
        }
    }

    async autoPlayHand() {
        if (!this.callWario) return;

        // Use the enhanced discard strategy for the player's hand
        const counts = {};
        this.playerCards.forEach(card => {
            counts[card] = (counts[card] || 0) + 1;
        });

        // Calculate hand strength and potential
        const currentHand = this.evaluateHand(this.playerCards);
        const cardValues = Object.keys(counts).map(Number).sort((a, b) => b - a);
        const highCards = cardValues.filter(value => value >= 4);
        const pairs = Object.entries(counts).filter(([_, count]) => count === 2);
        const threeOfAKind = Object.entries(counts).find(([_, count]) => count === 3);
        const fourOfAKind = Object.entries(counts).find(([_, count]) => count === 4);

        // Initialize selectedDiscards
        let selectedDiscards = new Set();

        // Strategy based on current hand strength
        if (currentHand.score >= 6) { // Four of a Kind or better
            // Keep everything if we have four of a kind or better
            selectedDiscards = new Set();
        } else if (currentHand.score === 5) { // Full House
            // Keep the full house, but consider upgrading if we have high cards
            const [threeValue, twoValue] = Object.entries(counts)
                .sort((a, b) => b[1] - a[1])
                .map(([value]) => parseInt(value));
            
            // If we have a high card that could make a better hand, consider discarding the pair
            if (highCards.length > 0 && highCards[0] > twoValue) {
                this.playerCards.forEach((card, index) => {
                    if (card === twoValue) {
                        selectedDiscards.add(index);
                    }
                });
            }
        } else if (currentHand.score === 4) { // Three of a Kind
            // Keep the three of a kind, consider discarding others for better potential
            const threeValue = parseInt(threeOfAKind[0]);
            const otherCards = this.playerCards.filter(card => card !== threeValue);
            
            // If we have high cards that could make a full house, keep them
            const highOtherCards = otherCards.filter(card => card >= 4);
            if (highOtherCards.length > 0) {
                // Keep the highest card that could make a full house
                const highestCard = Math.max(...highOtherCards);
                this.playerCards.forEach((card, index) => {
                    if (card !== threeValue && card !== highestCard) {
                        selectedDiscards.add(index);
                    }
                });
            } else {
                // Discard the lowest cards
                const lowestCard = Math.min(...otherCards);
                this.playerCards.forEach((card, index) => {
                    if (card === lowestCard) {
                        selectedDiscards.add(index);
                    }
                });
            }
        } else if (currentHand.score === 3) { // Two Pairs
            // Keep the higher pair, consider discarding the lower pair if we have high cards
            const pairs = Object.entries(counts)
                .filter(([_, count]) => count === 2)
                .map(([value]) => parseInt(value))
                .sort((a, b) => b - a);
            
            if (highCards.length > 0 && highCards[0] > pairs[1]) {
                // Discard the lower pair if we have a high card that could make a better hand
                this.playerCards.forEach((card, index) => {
                    if (card === pairs[1]) {
                        selectedDiscards.add(index);
                    }
                });
            }
        } else if (currentHand.score === 2) { // One Pair
            // Keep the pair and highest remaining card
            const pairValue = parseInt(Object.entries(counts).find(([_, count]) => count === 2)[0]);
            const otherCards = this.playerCards.filter(card => card !== pairValue);
            const highestOtherCard = Math.max(...otherCards);
            
            this.playerCards.forEach((card, index) => {
                if (card !== pairValue && card !== highestOtherCard) {
                    selectedDiscards.add(index);
                }
            });
        } else { // High Card or Nothing
            // Keep the highest cards, discard the rest
            const sortedCards = [...this.playerCards].sort((a, b) => b - a);
            const keepCount = Math.min(2, sortedCards.length); // Keep top 2 cards
            
            this.playerCards.forEach((card, index) => {
                if (!sortedCards.slice(0, keepCount).includes(card)) {
                    selectedDiscards.add(index);
                }
            });
        }

        // Limit the number of cards to discard based on hand strength
        const maxDiscards = Math.min(3, selectedDiscards.size);
        if (selectedDiscards.size > maxDiscards) {
            // Convert to array, sort by card value (lowest first), and keep only maxDiscards
            const discardArray = Array.from(selectedDiscards)
                .sort((a, b) => this.playerCards[a] - this.playerCards[b])
                .slice(0, maxDiscards);
            selectedDiscards = new Set(discardArray);
        }

        // Set the selected cards
        this.selectedCards = selectedDiscards;

        // Highlight the selected cards
        Array.from(this.playerCardsContainer.children).forEach((card, index) => {
            if (this.selectedCards.has(index)) {
                card.classList.add('selected');
            }
        });

        // Wait a short moment before discarding
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Discard the selected cards
        await this.discardCards();
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    new PicturePoker();
}); 