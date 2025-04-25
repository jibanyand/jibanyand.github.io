class PicturePoker {
    static imageMap = {
        1: 'assets/cloud.png',
        2: 'assets/mushroom.png',
        3: 'assets/flower.png',
        4: 'assets/luigi.png',
        5: 'assets/mario.png',
        6: 'assets/star.png'
    };

    static nameMap = {
        1: 'Cloud',
        2: 'Mushroom',
        3: 'Flower',
        4: 'Luigi',
        5: 'Mario',
        6: 'Star'
    };

    static handTypes = {
        'Five of a Kind': { score: 7, pattern: [5] },
        'Four of a Kind': { score: 6, pattern: [4, 1] },
        'Full House': { score: 5, pattern: [3, 2] },
        'Three of a Kind': { score: 4, pattern: [3, 1, 1] },
        'Two Pairs': { score: 3, pattern: [2, 2, 1] },
        'Two of a Kind': { score: 2, pattern: [2, 1, 1, 1] },
        'High Card': { score: 1, pattern: [1, 1, 1, 1, 1] }
    };

    constructor() {
        this.playerCoins = 10;
        this.currentBet = 1;
        this.defaultBet = 1;
        this.maxBet = 5;
        this.winStreak = 0;
        this.playerCards = [];
        this.luigiCards = [];
        this.selectedCards = new Set();
        this.gameState = 'initial';
        this.hasSeenWelcome = false;
        this.showLuigiHand = false;
        this.hardMode = false;
        this.callWario = false;

        // Initialize elements first
        this.initializeElements();
        
        // Initialize achievements
        this.initializeAchievements();
        
        // Attach event listeners
        this.attachEventListeners();
        
        // Load game state
        this.loadGame();
        
        // Update UI
        this.updateUI();
        
        // Initialize audio
        this.initializeAudio();
        
        // Initialize popups
        this.initializePopups();
        
        // Initialize game modifiers
        this.initializeGameModifiers();
        this.attachGameModifiers();

        // Show welcome popup
        this.welcomePopup.classList.add('show');
    }

    generateRandomCards(count) {
        return Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1);
    }

    initializeAchievements() {
        // Initialize achievements with default values
        this.achievements = {
            'five-of-a-kind-luigi': {
                name: 'Weegee Paradox',
                description: 'Get a Five of a Kind with only Luigi cards',
                progress: '0 of 1',
                maxProgress: 1,
                image: 'assets/luigi.png',
                completed: false
            },
            'junk-win': {
                name: 'Absolute Trash',
                description: 'Beat Luigi with a junk hand',
                progress: '0 of 1',
                maxProgress: 1,
                image: 'assets/cloud.png',
                completed: false
            },
            '25-win-streak': {
                name: 'Luigi Casino Legend',
                description: 'Achieve a 25 win streak',
                progress: '0 of 25',
                maxProgress: 25,
                image: 'assets/star.png',
                completed: false
            },
            '5-win-streak': {
                name: 'Luigi Whisperer',
                description: 'Achieve a 5 win streak',
                progress: '0 of 5',
                maxProgress: 5,
                image: 'assets/luigi.png',
                completed: false
            },
            'luigi-discard-only': {
                name: 'Maltigi',
                description: 'Win by only discarding Luigi cards',
                progress: '0 of 1',
                maxProgress: 1,
                image: 'assets/luigi.png',
                completed: false
            },
            '10-consecutive-wins': {
                name: 'Youre on Fire!',
                description: 'Beat Luigi 10 times consecutively',
                progress: '0 of 10',
                maxProgress: 10,
                image: 'assets/flower.png',
                completed: false
            },
            '3-full-houses': {
                name: 'Mushroom Kingdoms Best',
                description: 'Get 3 Full Houses in a row',
                progress: '0 of 3',
                maxProgress: 3,
                image: 'assets/mushroom.png',
                completed: false
            },
            'star-mario-combo': {
                name: 'Star Power',
                description: 'Get a hand with only Stars and Marios',
                progress: '0 of 1',
                maxProgress: 1,
                image: 'assets/star.png',
                completed: false
            },
            'true-tie': {
                name: 'Like a Brother To Me',
                description: 'Get the exact same hand as Luigi',
                progress: '0 of 1',
                maxProgress: 1,
                image: 'assets/mario.png',
                completed: false
            },
            'no-discard-win': {
                name: 'Like A Toad',
                description: 'Win without discarding any cards',
                progress: '0 of 1',
                maxProgress: 1,
                image: 'assets/mushroom.png',
                completed: false
            },
            'lowest-win': {
                name: 'Worth 0 Coins',
                description: 'Win with a hand containing only Clouds and Mushrooms',
                progress: '0 of 1',
                maxProgress: 1,
                image: 'assets/cloud.png',
                completed: false
            },
            'mario-luigi-star': {
                name: 'Mario Movie Ending',
                description: 'Get a Two Pair with Mario and Luigi, plus a Star',
                progress: '0 of 1',
                maxProgress: 1,
                image: 'assets/star.png',
                completed: false
            },
            'luigi-master': {
                name: 'Luigi Master',
                description: 'Win 5 games in a row with at least 3 Luigi cards in hand',
                progress: '0 of 5',
                maxProgress: 5,
                image: 'assets/luigi.png',
                completed: false
            }
        };

        // Ensure achievements start locked
        this.updateAchievementUI();
    }

    initializeAudio() {
        this.backgroundMusic = document.getElementById('background-music');
        this.backgroundMusic.volume = 0.5;
        this.audioEnabled = false;
        this.toggleMusicButton = document.getElementById('toggle-music');
        this.toggleMusicButton.addEventListener('click', () => this.toggleAudio());
        this.toggleMusicButton.textContent = 'Enable Audio';

        this.backgroundMusic.play().catch(error => {
            console.log('Autoplay prevented:', error);
        });
    }

    initializePopups() {
        // How to Play popup
        this.howToPlayButton = document.getElementById('how-to-play');
        this.howToPlayPopup = document.getElementById('how-to-play-popup');
        this.closeHowToPlayButton = document.getElementById('close-how-to-play');
        
        this.howToPlayButton.addEventListener('click', () => this.showHowToPlay());
        this.closeHowToPlayButton.addEventListener('click', () => this.hideHowToPlay());
        
        // Welcome popup
        this.welcomePopup = document.getElementById('welcome-popup');
        this.closeWelcomeButton = document.getElementById('close-welcome');
        this.closeWelcomeButton.addEventListener('click', () => this.handleWelcomeClose());

        // Settings popup
        this.settingsButton = document.getElementById('settings');
        this.settingsPopup = document.getElementById('settings-popup');
        this.closeSettingsButton = document.getElementById('close-settings');
        
        this.settingsButton.addEventListener('click', () => this.showSettings());
        this.closeSettingsButton.addEventListener('click', () => this.hideSettings());

        // Achievements popup
        this.achievementsPopup = document.getElementById('achievements-popup');
        this.achievementsButton = document.getElementById('achievements');
        this.closeAchievementsButton = document.getElementById('close-achievements');
        this.achievementDetailsPopup = document.getElementById('achievement-details-popup');
        this.closeAchievementDetailsButton = document.getElementById('close-achievement-details');

        this.achievementsButton.addEventListener('click', () => {
            this.achievementsPopup.classList.add('show');
        });

        this.closeAchievementsButton.addEventListener('click', () => {
            this.achievementsPopup.classList.remove('show');
        });

        this.closeAchievementDetailsButton.addEventListener('click', () => {
            this.achievementDetailsPopup.classList.remove('show');
        });

        // Handle achievement item clicks
        document.querySelectorAll('.achievement-item').forEach(item => {
            item.addEventListener('click', () => {
                const achievementId = item.dataset.achievement;
                const achievement = this.achievements[achievementId];
                
                // Update details popup content
                document.getElementById('achievement-details-image').src = achievement.image;
                document.getElementById('achievement-details-image').alt = achievement.name;
                document.getElementById('achievement-details-name').textContent = achievement.name;
                document.getElementById('achievement-details-description').textContent = achievement.description;
                document.getElementById('achievement-details-progress').textContent = achievement.progress;
                
                // Show/hide unlock icon based on achievement
                const unlockIcon = document.getElementById('achievement-details-unlock-icon');
                if (achievementId === '5-win-streak' || achievementId === '25-win-streak') {
                    unlockIcon.style.display = 'block';
                } else {
                    unlockIcon.style.display = 'none';
                }
                
                // Add completion status
                const achievementDetailsText = document.querySelector('.achievement-details-text');
                const completionStatus = document.createElement('p');
                completionStatus.id = 'achievement-details-completion';
                completionStatus.textContent = achievement.completed ? 'Completed!' : 'Not Completed';
                completionStatus.className = achievement.completed ? 'completed' : 'not-completed';
                
                // Remove existing completion status if it exists
                const existingStatus = document.getElementById('achievement-details-completion');
                if (existingStatus) {
                    existingStatus.remove();
                }
                
                achievementDetailsText.appendChild(completionStatus);
                
                // Show details popup
                this.achievementDetailsPopup.classList.add('show');
            });
        });

        // Close popups when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === this.achievementsPopup) {
                this.achievementsPopup.classList.remove('show');
            }
            if (event.target === this.achievementDetailsPopup) {
                this.achievementDetailsPopup.classList.remove('show');
            }
        });

        // Initialize help buttons
        this.initializeHelpButtons();
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
        
        // Initialize achievement elements
        this.achievementsPopup = document.getElementById('achievements-popup');
        this.achievementsButton = document.getElementById('achievements');
        this.closeAchievementsButton = document.getElementById('close-achievements');
        this.achievementDetailsPopup = document.getElementById('achievement-details-popup');
        this.closeAchievementDetailsButton = document.getElementById('close-achievement-details');
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

        // Achievement event listeners
        this.achievementsButton.addEventListener('click', () => {
            console.log('Achievements button clicked');
            this.achievementsPopup.classList.add('show');
        });

        this.closeAchievementsButton.addEventListener('click', () => {
            this.achievementsPopup.classList.remove('show');
        });

        this.closeAchievementDetailsButton.addEventListener('click', () => {
            this.achievementDetailsPopup.classList.remove('show');
        });

        // Handle achievement item clicks
        document.querySelectorAll('.achievement-item').forEach(item => {
            item.addEventListener('click', () => {
                const achievementId = item.dataset.achievement;
                const achievement = this.achievements[achievementId];
                
                if (!achievement) {
                    console.error('Achievement not found:', achievementId);
                    return;
                }
                
                // Update details popup content
                const detailsImage = document.getElementById('achievement-details-image');
                const detailsName = document.getElementById('achievement-details-name');
                const detailsDescription = document.getElementById('achievement-details-description');
                const detailsProgress = document.getElementById('achievement-details-progress');
                const unlockIcon = document.getElementById('achievement-details-unlock-icon');
                
                if (detailsImage) detailsImage.src = achievement.image;
                if (detailsName) detailsName.textContent = achievement.name;
                if (detailsDescription) detailsDescription.textContent = achievement.description;
                if (detailsProgress) detailsProgress.textContent = achievement.progress;
                
                if (unlockIcon) {
                    unlockIcon.style.display = (achievementId === '5-win-streak' || achievementId === '25-win-streak') ? 'block' : 'none';
                }
                
                // Add completion status
                const achievementDetailsText = document.querySelector('.achievement-details-text');
                if (achievementDetailsText) {
                    const completionStatus = document.createElement('p');
                    completionStatus.id = 'achievement-details-completion';
                    completionStatus.textContent = achievement.completed ? 'Completed!' : 'Not Completed';
                    completionStatus.className = achievement.completed ? 'completed' : 'not-completed';
                    
                    // Remove existing completion status if it exists
                    const existingStatus = document.getElementById('achievement-details-completion');
                    if (existingStatus) {
                        existingStatus.remove();
                    }
                    
                    achievementDetailsText.appendChild(completionStatus);
                }
                
                // Show details popup
                this.achievementDetailsPopup.classList.add('show');
            });
        });

        // Close popups when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === this.achievementsPopup) {
                this.achievementsPopup.classList.remove('show');
            }
            if (event.target === this.achievementDetailsPopup) {
                this.achievementDetailsPopup.classList.remove('show');
            }
        });
    }

    increaseBet() {
        const maxPossibleBet = this.hardMode ? Math.min(5, Math.floor(this.playerCoins / 10)) : this.playerCoins;
        if (this.currentBet < this.maxBet && this.currentBet < maxPossibleBet) {
            this.currentBet++;
            this.updateUI();
        }
    }

    async dealCards() {
        if (this.gameState !== 'initial') return;
        
        this.gameState = 'dealing';
        this.updateUI();
        
        // Reset the discard tracking flag at the start of each round
        this.hasDiscardedCards = false;
        
        // Fade out existing cards if any
        const existingPlayerCards = Array.from(this.playerCardsContainer.children);
        const existingLuigiCards = Array.from(this.luigiCardsContainer.children);
        
        if (existingPlayerCards.length > 0 || existingLuigiCards.length > 0) {
            // Play discard sound once when clearing old cards
            this.playSound('cardgive2.wav');
            
            // Add fade out animation to all existing cards
            [...existingPlayerCards, ...existingLuigiCards].forEach(card => {
                card.classList.add('fading-out');
            });
            
            // wait for fade out animation
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
        
        // Generate new cards
        this.playerCards = this.generateRandomCards(5);
        this.luigiCards = this.generateRandomCards(5);
        
        await this.displayCardsWithAnimation();
        this.gameState = 'discarding';
        this.updateUI();

        // If Call Wario is enabled, automatically play the hand
        if (this.callWario) {
            // Wait before auto play
            await new Promise(resolve => setTimeout(resolve, 1000));
            await this.autoPlayHand();
        }
    }

    async displayCardsWithAnimation() {
        this.playerCardsContainer.innerHTML = '';
        this.luigiCardsContainer.innerHTML = '';

        // Deal player cards with animation
        for (let i = 0; i < this.playerCards.length; i++) {
            const cardElement = this.createCard(this.playerCards[i]);
            cardElement.classList.add('sorting');
            this.playerCardsContainer.appendChild(cardElement);
            // Play card dealing sound
            this.playSound('cardgive1.wav');
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Deal Luigi's cards with animation
        for (let i = 0; i < this.luigiCards.length; i++) {
            const cardElement = this.createCard(this.luigiCards[i], !this.showLuigiHand);
            cardElement.classList.add('sorting');
            this.luigiCardsContainer.appendChild(cardElement);
            // Play card dealing sound
            this.playSound('cardgive1.wav');
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Wait for sorting animation
        await new Promise(resolve => setTimeout(resolve, 500));

        // Remove sorting class after animation
        Array.from(this.luigiCardsContainer.children).forEach(card => {
            card.classList.remove('sorting');
        });
        Array.from(this.playerCardsContainer.children).forEach(card => {
            card.classList.remove('sorting');
        });

        // add click handlers to player cards
        Array.from(this.playerCardsContainer.children).forEach((cardElement, index) => {
            cardElement.addEventListener('click', () => this.toggleCardSelection(index));
        });
    }

    createCard(value, isHidden = false) {
        const card = document.createElement('div');
        card.className = `card${isHidden ? ' hidden' : ''}`;
        card.dataset.value = value;
        
        const img = document.createElement('img');
        img.src = PicturePoker.imageMap[value];
        img.alt = PicturePoker.nameMap[value];
        img.className = 'card-image';
        
        card.appendChild(img);
        return card;
    }

    getImageForValue(value) {
        return PicturePoker.imageMap[value] || '';
    }

    getValueName(value) {
        return PicturePoker.nameMap[value] || '';
    }

    toggleCardSelection(index) {
        if (this.gameState !== 'discarding' || this.callWario) return;

        const cardElement = this.playerCardsContainer.children[index];
        const isSelected = this.selectedCards.has(index);
        
        if (isSelected) {
            this.selectedCards.delete(index);
            cardElement.classList.remove('selected');
            // Play deselect sound
            this.playSound('deselect.wav');
        } else {
            this.selectedCards.add(index);
            cardElement.classList.add('selected');
            // Play select sound
            this.playSound('select.wav');
        }
    }

    async discardCards() {
        if (this.gameState !== 'discarding') return;

        if (!this.callWario) {
            const betAmount = this.hardMode ? this.currentBet * 10 : this.currentBet;
            if (betAmount > this.playerCoins) {
                this.messageArea.textContent = "You don't have enough coins for this bet!";
                return;
            }
            this.playerCoins -= betAmount;
            this.updateUI();
        }

        // Set the discard tracking flag if any cards were selected
        if (this.selectedCards.size > 0) {
            this.hasDiscardedCards = true;
        }

        // Check if only Luigi's cards were discarded
        this.discardedOnlyLuigiCards = this.selectedCards.size > 0 && 
            Array.from(this.selectedCards).every(index => this.playerCards[index] === 4);

        this.gameState = 'animating';
        this.updateUI();

        const fragment = document.createDocumentFragment();
        const newCards = new Map();
        
        if (this.selectedCards.size > 0) {
            this.playSound('cardgive2.wav');
        }
        
        for (const index of this.selectedCards) {
            const cardElement = this.playerCardsContainer.children[index];
            cardElement.classList.add('discarding');
            
            this.playerCards[index] = Math.floor(Math.random() * 6) + 1;
            const newCard = this.createCard(this.playerCards[index]);
            newCards.set(index, newCard);
        }

        if (this.selectedCards.size > 0) {
            await Promise.all(Array.from(this.selectedCards).map(index => 
                new Promise(resolve => {
                    const cardElement = this.playerCardsContainer.children[index];
                    cardElement.addEventListener('animationend', () => {
                        cardElement.replaceWith(newCards.get(index));
                        newCards.get(index).classList.add('replacing');
                        resolve();
                    }, { once: true });
                })
            ));
            
            this.playSound('cardgive1.wav');
        }

        const counts = new Array(7).fill(0);
        this.luigiCards.forEach(card => counts[card]++);
        
        const currentHand = this.evaluateHand(this.luigiCards);
        const cardValues = Object.entries(counts)
            .filter(([_, count]) => count > 0)
            .map(([value, count]) => ({ value: parseInt(value), count }))
            .sort((a, b) => b.value - a.value);
        
        let selectedDiscards = new Set();

        if (currentHand.score === 7) { // Five of a Kind
            selectedDiscards = new Set();
        } else if (currentHand.score === 6) { // Four of a Kind
            const fourValue = cardValues.find(({ count }) => count === 4).value;
            this.luigiCards.forEach((card, index) => {
                if (card !== fourValue) {
                    selectedDiscards.add(index);
                }
            });
        } else if (currentHand.score === 5) { // Full House
            selectedDiscards = new Set();
        } else if (currentHand.score === 4) { // Three of a Kind
            const threeValue = cardValues.find(({ count }) => count === 3).value;
            this.luigiCards.forEach((card, index) => {
                if (card !== threeValue) {
                    selectedDiscards.add(index);
                }
            });
        } else if (currentHand.score === 3) { // Two Pairs
            const pairs = cardValues.filter(({ count }) => count === 2).map(({ value }) => value);
            const outlierCard = this.luigiCards.find(card => !pairs.includes(card));
            this.luigiCards.forEach((card, index) => {
                if (card === outlierCard) {
                    selectedDiscards.add(index);
                }
            });
        } else if (currentHand.score === 2) { // One Pair
            const pairValue = cardValues.find(({ count }) => count === 2).value;
            this.luigiCards.forEach((card, index) => {
                if (card !== pairValue) {
                    selectedDiscards.add(index);
                }
            });
        } else { // High Card
            const sortedCards = [...this.luigiCards].sort((a, b) => b - a);
            const highestCard = sortedCards[0];
            this.luigiCards.forEach((card, index) => {
                if (card !== highestCard) {
                    selectedDiscards.add(index);
                }
            });
        }

        const luigiFragment = document.createDocumentFragment();
        const luigiNewCards = new Map();
        
        if (selectedDiscards.size > 0) {
            this.playSound('cardgive2.wav');
        }
        
        for (const index of selectedDiscards) {
            const cardElement = this.luigiCardsContainer.children[index];
            cardElement.classList.add('discarding');
            
            this.luigiCards[index] = Math.floor(Math.random() * 6) + 1;
            const newCard = this.createCard(this.luigiCards[index], !this.showLuigiHand);
            luigiNewCards.set(index, newCard);
        }

        if (selectedDiscards.size > 0) {
            await Promise.all(Array.from(selectedDiscards).map(index => 
                new Promise(resolve => {
                    const cardElement = this.luigiCardsContainer.children[index];
                    cardElement.addEventListener('animationend', () => {
                        cardElement.replaceWith(luigiNewCards.get(index));
                        luigiNewCards.get(index).classList.add('replacing');
                        resolve();
                    }, { once: true });
                })
            ));
            
            this.playSound('cardgive1.wav');
        }

        this.gameState = 'revealing';
        this.updateUI();

        await new Promise(resolve => setTimeout(resolve, 500));

        await this.revealWinner();
    }

    async revealWinner() {
        this.playerCards.sort((a, b) => b - a);
        this.luigiCards.sort((a, b) => b - a);

        this.luigiCardsContainer.innerHTML = '';
        this.playerCardsContainer.innerHTML = '';

        for (let i = 0; i < 5; i++) {
            const luigiCardElement = this.createCard(this.luigiCards[i], false);
            luigiCardElement.classList.add('sorting');
            this.luigiCardsContainer.appendChild(luigiCardElement);

            const playerCardElement = this.createCard(this.playerCards[i]);
            playerCardElement.classList.add('sorting');
            this.playerCardsContainer.appendChild(playerCardElement);
            this.playSound('cardgive3.wav');

            await new Promise(resolve => setTimeout(resolve, 100));
        }

        await new Promise(resolve => setTimeout(resolve, 500));

        Array.from(this.luigiCardsContainer.children).forEach(card => {
            card.classList.remove('sorting');
        });
        Array.from(this.playerCardsContainer.children).forEach(card => {
            card.classList.remove('sorting');
        });

        const playerHand = this.evaluateHand(this.playerCards);
        const luigiHand = this.evaluateHand(this.luigiCards);

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
                cardsToHighlight = [Math.max(...cards)];
            }

            return cardsToHighlight;
        };

        const playerWinningCards = highlightWinningCards(this.playerCards, playerHand.type);
        const luigiWinningCards = highlightWinningCards(this.luigiCards, luigiHand.type);

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
                const winnings = (this.hardMode ? this.currentBet * 10 : this.currentBet) * multiplier;
                this.playerCoins += winnings;
                message = `You won! ${playerHand.type} x${multiplier} - You won ${winnings} coins!`;
                didWin = true;
                this.playSound('win.wav');
                this.playSound('winjingle.wav');
            } else if (playerHand.score < luigiHand.score) {
                message = `Luigi won with ${luigiHand.type}!`;
                didWin = false;
                this.playSound('lose.wav');
                this.playSound('losejingle.wav');
            } else {
                if (playerHand.type === luigiHand.type) {
                    // Get counts for both players
                    const playerCounts = {};
                    const luigiCounts = {};
                    this.playerCards.forEach(card => playerCounts[card] = (playerCounts[card] || 0) + 1);
                    this.luigiCards.forEach(card => luigiCounts[card] = (luigiCounts[card] || 0) + 1);

                    // Get matching cards for both players sorted in descending order
                    const getMatchingCards = (counts) => {
                        return Object.entries(counts)
                            .filter(([_, count]) => count > 1)
                            .map(([value]) => parseInt(value))
                            .sort((a, b) => b - a);
                    };

                    const playerMatchingCards = getMatchingCards(playerCounts);
                    const luigiMatchingCards = getMatchingCards(luigiCounts);

                    // Compare matching cards in descending order
                    let tieResolved = false;
                    for (let i = 0; i < Math.min(playerMatchingCards.length, luigiMatchingCards.length); i++) {
                        if (playerMatchingCards[i] > luigiMatchingCards[i]) {
                            const multiplier = this.getMultiplier(playerHand.type);
                            const winnings = (this.hardMode ? this.currentBet * 10 : this.currentBet) * multiplier;
                            this.playerCoins += winnings;
                            message = `You won the tie! ${playerHand.type} x${multiplier} - You won ${winnings} coins!`;
                            didWin = true;
                            this.playSound('win.wav');
                            this.playSound('winjingle.wav');
                            tieResolved = true;
                            break;
                        } else if (playerMatchingCards[i] < luigiMatchingCards[i]) {
                            message = `Luigi won the tie!`;
                            didWin = false;
                            this.playSound('lose.wav');
                            this.playSound('losejingle.wav');
                            tieResolved = true;
                            break;
                        }
                    }

                    // If all matching cards are equal, compare remaining cards
                    if (!tieResolved) {
                        const playerUnhighlighted = this.playerCards.filter(card => !playerWinningCards.includes(card));
                        const luigiUnhighlighted = this.luigiCards.filter(card => !luigiWinningCards.includes(card));
                        
                        const sortedPlayerUnhighlighted = [...playerUnhighlighted].sort((a, b) => b - a);
                        const sortedLuigiUnhighlighted = [...luigiUnhighlighted].sort((a, b) => b - a);
                        
                        for (let i = 0; i < sortedPlayerUnhighlighted.length; i++) {
                            if (sortedPlayerUnhighlighted[i] > sortedLuigiUnhighlighted[i]) {
                                const multiplier = this.getMultiplier(playerHand.type);
                                const winnings = (this.hardMode ? this.currentBet * 10 : this.currentBet) * multiplier;
                                this.playerCoins += winnings;
                                message = `You won the tie! ${playerHand.type} x${multiplier} - You won ${winnings} coins!`;
                                didWin = true;
                                this.playSound('win.wav');
                                this.playSound('winjingle.wav');
                                tieResolved = true;
                                break;
                            } else if (sortedPlayerUnhighlighted[i] < sortedLuigiUnhighlighted[i]) {
                                message = `Luigi won the tie!`;
                                didWin = false;
                                this.playSound('lose.wav');
                                this.playSound('losejingle.wav');
                                tieResolved = true;
                                break;
                            }
                        }
                        
                        if (!tieResolved) {
                            message = `It's a tie! You get your bet back.`;
                            this.playerCoins += (this.hardMode ? this.currentBet * 10 : this.currentBet);
                            didWin = false;
                        }
                    }
                } else {
                    const sortedPlayerCards = [...this.playerCards].sort((a, b) => b - a);
                    const sortedLuigiCards = [...this.luigiCards].sort((a, b) => b - a);
                    
                    let tieResolved = false;
                    for (let i = 0; i < 5; i++) {
                        if (sortedPlayerCards[i] > sortedLuigiCards[i]) {
                            const multiplier = this.getMultiplier(playerHand.type);
                            const winnings = (this.hardMode ? this.currentBet * 10 : this.currentBet) * multiplier;
                            this.playerCoins += winnings;
                            message = `You won! ${playerHand.type} x${multiplier} - You won ${winnings} coins!`;
                            didWin = true;
                            this.playSound('win.wav');
                            this.playSound('winjingle.wav');
                            tieResolved = true;
                            break;
                        } else if (sortedPlayerCards[i] < sortedLuigiCards[i]) {
                            message = `Luigi won with ${luigiHand.type}!`;
                            didWin = false;
                            this.playSound('lose.wav');
                            this.playSound('losejingle.wav');
                            tieResolved = true;
                            break;
                        }
                    }
                    
                    if (!tieResolved) {
                        // If we get here, it means all cards are equal in value
                        if (playerHand.score > luigiHand.score) {
                            const multiplier = this.getMultiplier(playerHand.type);
                            const winnings = (this.hardMode ? this.currentBet * 10 : this.currentBet) * multiplier;
                            this.playerCoins += winnings;
                            message = `You won! ${playerHand.type} x${multiplier} - You won ${winnings} coins!`;
                            didWin = true;
                            this.playSound('win.wav');
                            this.playSound('winjingle.wav');
                        } else if (playerHand.score < luigiHand.score) {
                            message = `Luigi won with ${luigiHand.type}!`;
                            didWin = false;
                            this.playSound('lose.wav');
                            this.playSound('losejingle.wav');
                        } else {
                            message = `It's a tie! You get your bet back.`;
                            this.playerCoins += (this.hardMode ? this.currentBet * 10 : this.currentBet);
                            didWin = false;
                        }
                    }
                }
            }

            this.updateWinStreak(didWin);
        } else {
            if (playerHand.score > luigiHand.score) {
                message = `Wario won with ${playerHand.type}!`;
                this.playSound('win.wav');
                this.playSound('winjingle.wav');
            } else if (playerHand.score < luigiHand.score) {
                message = `Luigi won with ${luigiHand.type}!`;
                this.playSound('lose.wav');
                this.playSound('losejingle.wav');
            } else {
                if (playerHand.type === luigiHand.type) {
                    if (playerHand.type === 'Full House') {
                        const playerCounts = {};
                        const luigiCounts = {};
                        this.playerCards.forEach(card => playerCounts[card] = (playerCounts[card] || 0) + 1);
                        this.luigiCards.forEach(card => luigiCounts[card] = (luigiCounts[card] || 0) + 1);

                        // Get matching cards for both players sorted in descending order
                        const getMatchingCards = (counts) => {
                            return Object.entries(counts)
                                .filter(([_, count]) => count > 1)
                                .map(([value]) => parseInt(value))
                                .sort((a, b) => b - a);
                        };

                        const playerMatchingCards = getMatchingCards(playerCounts);
                        const luigiMatchingCards = getMatchingCards(luigiCounts);

                        // Compare matching cards in descending order
                        let tieResolved = false;
                        for (let i = 0; i < Math.min(playerMatchingCards.length, luigiMatchingCards.length); i++) {
                            if (playerMatchingCards[i] > luigiMatchingCards[i]) {
                                const multiplier = this.getMultiplier(playerHand.type);
                                const winnings = (this.hardMode ? this.currentBet * 10 : this.currentBet) * multiplier;
                                this.playerCoins += winnings;
                                message = `You won the tie! ${playerHand.type} x${multiplier} - You won ${winnings} coins!`;
                                didWin = true;
                                this.playSound('win.wav');
                                this.playSound('winjingle.wav');
                                tieResolved = true;
                                break;
                            } else if (playerMatchingCards[i] < luigiMatchingCards[i]) {
                                message = `Luigi won the tie!`;
                                didWin = false;
                                this.playSound('lose.wav');
                                this.playSound('losejingle.wav');
                                tieResolved = true;
                                break;
                            }
                        }

                        // If all matching cards are equal, compare remaining cards
                        if (!tieResolved) {
                            const playerUnhighlighted = this.playerCards.filter(card => !playerWinningCards.includes(card));
                            const luigiUnhighlighted = this.luigiCards.filter(card => !luigiWinningCards.includes(card));
                            
                            const sortedPlayerUnhighlighted = [...playerUnhighlighted].sort((a, b) => b - a);
                            const sortedLuigiUnhighlighted = [...luigiUnhighlighted].sort((a, b) => b - a);
                            
                            for (let i = 0; i < sortedPlayerUnhighlighted.length; i++) {
                                if (sortedPlayerUnhighlighted[i] > sortedLuigiUnhighlighted[i]) {
                                    const multiplier = this.getMultiplier(playerHand.type);
                                    const winnings = (this.hardMode ? this.currentBet * 10 : this.currentBet) * multiplier;
                                    this.playerCoins += winnings;
                                    message = `You won the tie! ${playerHand.type} x${multiplier} - You won ${winnings} coins!`;
                                    didWin = true;
                                    this.playSound('win.wav');
                                    this.playSound('winjingle.wav');
                                    tieResolved = true;
                                    break;
                                } else if (sortedPlayerUnhighlighted[i] < sortedLuigiUnhighlighted[i]) {
                                    message = `Luigi won the tie!`;
                                    didWin = false;
                                    this.playSound('lose.wav');
                                    this.playSound('losejingle.wav');
                                    tieResolved = true;
                                    break;
                                }
                            }
                            
                            if (!tieResolved) {
                                message = `It's a tie! You get your bet back.`;
                                this.playerCoins += (this.hardMode ? this.currentBet * 10 : this.currentBet);
                                didWin = false;
                            }
                        }
                    } else {
                        const playerHighlightedMax = Math.max(...playerWinningCards);
                        const luigiHighlightedMax = Math.max(...luigiWinningCards);
                        
                        if (playerHighlightedMax > luigiHighlightedMax) {
                            const multiplier = this.getMultiplier(playerHand.type);
                            const winnings = (this.hardMode ? this.currentBet * 10 : this.currentBet) * multiplier;
                            this.playerCoins += winnings;
                            message = `You won the tie! ${playerHand.type} x${multiplier} - You won ${winnings} coins!`;
                            didWin = true;
                            this.playSound('win.wav');
                            this.playSound('winjingle.wav');
                        } else if (playerHighlightedMax < luigiHighlightedMax) {
                            message = `Luigi won the tie!`;
                            didWin = false;
                            this.playSound('lose.wav');
                            this.playSound('losejingle.wav');
                        } else {
                            // If highlighted cards are equal, compare remaining cards
                            const playerUnhighlighted = this.playerCards.filter(card => !playerWinningCards.includes(card));
                            const luigiUnhighlighted = this.luigiCards.filter(card => !luigiWinningCards.includes(card));
                            
                            const sortedPlayerUnhighlighted = [...playerUnhighlighted].sort((a, b) => b - a);
                            const sortedLuigiUnhighlighted = [...luigiUnhighlighted].sort((a, b) => b - a);
                            
                            let tieResolved = false;
                            for (let i = 0; i < sortedPlayerUnhighlighted.length; i++) {
                                if (sortedPlayerUnhighlighted[i] > sortedLuigiUnhighlighted[i]) {
                                    const multiplier = this.getMultiplier(playerHand.type);
                                    const winnings = (this.hardMode ? this.currentBet * 10 : this.currentBet) * multiplier;
                                    this.playerCoins += winnings;
                                    message = `You won the tie! ${playerHand.type} x${multiplier} - You won ${winnings} coins!`;
                                    didWin = true;
                                    this.playSound('win.wav');
                                    this.playSound('winjingle.wav');
                                    tieResolved = true;
                                    break;
                                } else if (sortedPlayerUnhighlighted[i] < sortedLuigiUnhighlighted[i]) {
                                    message = `Luigi won the tie!`;
                                    didWin = false;
                                    this.playSound('lose.wav');
                                    this.playSound('losejingle.wav');
                                    tieResolved = true;
                                    break;
                                }
                            }
                            
                            if (!tieResolved) {
                                message = `It's a tie! You get your bet back.`;
                                this.playerCoins += (this.hardMode ? this.currentBet * 10 : this.currentBet);
                                didWin = false;
                            }
                        }
                    }
                } else {
                    if (playerHand.score > luigiHand.score) {
                        message = `Wario won with ${playerHand.type}!`;
                        this.playSound('win.wav');
                        this.playSound('winjingle.wav');
                    } else if (playerHand.score < luigiHand.score) {
                        message = `Luigi won with ${luigiHand.type}!`;
                        this.playSound('lose.wav');
                        this.playSound('losejingle.wav');
                    } else {
                        message = `It's a tie! Wario has ${playerHand.type}, Luigi has ${luigiHand.type}`;
                    }
                }
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

            if (this.callWario) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                await this.dealCards();
            }
        }

        // Check for achievements
        this.checkAchievements(playerHand.type, didWin);
    }

    async gameOver() {
        const playerCards = Array.from(this.playerCardsContainer.children);
        const fallDirections = ['left', 'right', 'center'];
        
        playerCards.forEach(card => {
            card.classList.remove('falling-left', 'falling-right', 'falling-center');
        });

        void playerCards[0].offsetWidth;
        
        playerCards.forEach(card => {
            const randomDirection = fallDirections[Math.floor(Math.random() * fallDirections.length)];
            card.classList.add(`falling-${randomDirection}`);
        });

        await new Promise(resolve => setTimeout(resolve, 1000));
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
        this.hasSeenWelcome = false;
        
        localStorage.removeItem('luigiPokerSave');
        
        this.gameOverOverlay.classList.remove('show');
        
        this.playerCardsContainer.innerHTML = '';
        this.luigiCardsContainer.innerHTML = '';
        this.messageArea.textContent = '';
        
        if (this.audioEnabled) {
            this.backgroundMusic.currentTime = 0;
            this.backgroundMusic.play().catch(error => {
                console.log('Error playing music:', error);
            });
        }
        
        this.updateUI();
    }

    evaluateHand(cards) {
        const counts = new Array(7).fill(0);
        cards.forEach(card => counts[card]++);
        
        const values = counts.filter(count => count > 0).sort((a, b) => b - a);
        
        for (const [type, { score, pattern }] of Object.entries(PicturePoker.handTypes)) {
            if (this.matchesPattern(values, pattern)) {
                return { type, score };
            }
        }
        
        return { type: 'High Card', score: 1 };
    }

    matchesPattern(values, pattern) {
        if (values.length !== pattern.length) return false;
        return values.every((value, index) => value === pattern[index]);
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
        const oldWinStreak = this.winStreak;
        
        if (didWin) {
            this.winStreak++;
        } else {
            this.winStreak = Math.max(0, this.winStreak - 1);
        }
        this.winStreakElement.textContent = this.winStreak;

        const oldMultiple = Math.floor(oldWinStreak / 5);
        const newMultiple = Math.floor(this.winStreak / 5);

        if (newMultiple > oldMultiple) {
            this.defaultBet = Math.min(5, this.defaultBet + 1);
            this.maxBet = 5;
            this.currentBet = this.defaultBet;
        } else if (newMultiple < oldMultiple) {
            this.defaultBet = Math.max(1, this.defaultBet - 1);
            this.maxBet = 5;
            this.currentBet = this.defaultBet;
        }

        this.updateUI();
    }

    updateUI() {
        this.playerCoinsElement.textContent = this.playerCoins;
        if (this.hardMode) {
            this.currentBetElement.textContent = (this.currentBet * 10).toString();
        } else {
            this.currentBetElement.textContent = this.currentBet;
        }
        this.winStreakElement.textContent = this.winStreak;

        const isWarioMode = this.callWario && this.gameState === 'discarding';
        const maxPossibleBet = this.hardMode ? Math.min(5, Math.floor(this.playerCoins / 10)) : this.playerCoins;
        this.increaseBetButton.disabled = isWarioMode || this.gameState !== 'discarding' || this.currentBet >= this.maxBet || this.currentBet >= maxPossibleBet;
        this.dealCardsButton.disabled = this.gameState !== 'initial';
        this.discardCardsButton.disabled = isWarioMode || this.gameState !== 'discarding' || this.gameState === 'animating';
        this.saveGameButton.disabled = this.gameState !== 'initial';

        // Reinitialize game modifiers when game state changes
        if (this.gameState === 'initial') {
            this.initializeGameModifiers();
        }

        const showLuigiHandToggle = document.getElementById('show-luigi-hand');
        const hardModeToggle = document.getElementById('hard-mode');
        const callWarioToggle = document.getElementById('call-wario');
        
        if (showLuigiHandToggle) showLuigiHandToggle.disabled = this.gameState !== 'initial';
        if (hardModeToggle) hardModeToggle.disabled = this.gameState !== 'initial';
        if (callWarioToggle) callWarioToggle.disabled = this.gameState !== 'initial';

        const playerCardsTitle = document.querySelector('.player-cards h2');
        if (playerCardsTitle) {
            playerCardsTitle.textContent = this.callWario ? "Wario's Cards" : "Your Cards";
        }

        this.updateHowToPlayText();
        document.body.classList.toggle('wario-mode', this.callWario);
    }

    updateHowToPlayText() {
        const howToPlayTitle = document.querySelector('.how-to-play-popup h2');
        const howToPlayInstructions = document.querySelector('.how-to-play-popup .instructions');
        const howToPlayButton = document.querySelector('#close-how-to-play');

        if (this.callWario) {
            if (howToPlayTitle) howToPlayTitle.textContent = "WARIOS ULTIMATE POKER GUIDE";
            if (howToPlayButton) howToPlayButton.textContent = "WARIO TIME!";
            if (howToPlayInstructions) {
                howToPlayInstructions.innerHTML = `
                    <p>1. START WITH 10 COINS, CHUMP CHANGE FOR A GENIUS LIKE ME!</p>
                    <p>2. CLICK "DEAL CARDS", WAH!!</p>
                    <p>3. SELECT CARDS TO DISCARD, WAH-HA! GET RID OF THE JUNK!</p>
                    <p>4. CLICK "DISCARD SELECTED", NEW CARDS, NEW CHANCES! MATCH THEM GOOD!</p>
                    <p>5. WIN COINS BY BEATING LUIGI, WAH-HA-HA! HIS TEARS TASTE LIKE GARLIC!</p>
                    <br>
                    <p><strong>HAND RANKINGS FROM BEST TO WORST:</strong></p>
                    <p>FIVE OF A KIND x16 - WAH-HA-HA! IM THE BEST!</p>
                    <p>FOUR OF A KIND x8 - NICE, VERY NICE!</p>
                    <p>FULL HOUSE x6 - NOT BAD, LUIGIS GONNA LOSE!</p>
                    <p>THREE OF A KIND x4 - WAH-HA! ENOUGH TO MAKE LUIGI CRY!</p>
                    <p>TWO PAIRS x3 - BETTER THAN LUIGI CAN DO!</p>
                    <p>ONE PAIR x2 - EVEN WALUIGI COULD BEAT LUIGI WITH THIS!</p>
                    <p>JUNK x1 - NOT NICE!</p>
                `;
            }
        } else {
            if (howToPlayTitle) howToPlayTitle.textContent = "How to Play Luigis Picture Poker";
            if (howToPlayButton) howToPlayButton.textContent = "Got it!";
            if (howToPlayInstructions) {
                howToPlayInstructions.innerHTML = `
                    <p>1. Start with 10 coins</p>
                    <p>2. Click "Deal Cards" to begin a round</p>
                    <p>3. Select cards you want to discard by clicking them, you want to get matching cards</p>
                    <p>4. Click "Discard Selected" to replace your chosen cards</p>
                    <p>5. Win coins by getting better hands than Luigi!</p>
                    <br>
                    <p><strong>Hand Rankings from highest to lowest:</strong></p>
                    <p>Five of a Kind x16</p>
                    <p>Four of a Kind x8</p>
                    <p>Full House x6</p>
                    <p>Three of a Kind x4</p>
                    <p>Two Pairs x3</p>
                    <p>One Pair x2</p>
                    <p>Junk x1</p>
                `;
            }
        }
    }

    saveGame() {
        try {
            const gameState = {
                playerCoins: this.playerCoins,
                currentBet: this.currentBet,
                defaultBet: this.defaultBet,
                maxBet: this.maxBet,
                winStreak: this.winStreak,
                playerCards: this.playerCards,
                luigiCards: this.luigiCards,
                gameState: this.gameState,
                hasSeenWelcome: this.hasSeenWelcome,
                achievements: JSON.parse(JSON.stringify(this.achievements)),
                lastSaved: new Date().toISOString()
            };
            
            localStorage.setItem('luigiPokerSave', JSON.stringify(gameState));
            console.log('Game saved successfully:', gameState);
            this.messageArea.textContent = 'Game saved!';
            setTimeout(() => {
                if (this.gameState === 'initial') {
                    this.messageArea.textContent = '';
                }
            }, 2000);
        } catch (error) {
            console.error('Error saving game:', error);
            this.messageArea.textContent = 'Error saving game!';
            
            // Try to save a minimal state if full save fails
            try {
                const minimalState = {
                    playerCoins: this.playerCoins,
                    achievements: JSON.parse(JSON.stringify(this.achievements))
                };
                localStorage.setItem('luigiPokerSave', JSON.stringify(minimalState));
                console.log('Minimal game state saved as fallback');
            } catch (fallbackError) {
                console.error('Fallback save also failed:', fallbackError);
            }
        }
    }

    showDeleteConfirmation() {
        this.confirmationPopup.classList.add('show');
    }

    hideDeleteConfirmation() {
        this.confirmationPopup.classList.remove('show');
    }

    deleteSave() {
        localStorage.removeItem('luigiPokerSave');
        localStorage.removeItem('luigiPokerSave');
        this.hideDeleteConfirmation();
        this.messageArea.textContent = 'Save deleted!';
        setTimeout(() => {
            this.messageArea.textContent = '';
        }, 2000);
        location.reload();
    }

    loadGame() {
        try {
            const savedGame = localStorage.getItem('luigiPokerSave');
            if (savedGame) {
                const parsedData = JSON.parse(savedGame);
                console.log('Loading saved game:', parsedData);
                
                // Load basic game state
                this.playerCoins = parsedData.playerCoins || 10;
                this.currentBet = parsedData.currentBet || 1;
                this.defaultBet = parsedData.defaultBet || 1;
                this.maxBet = parsedData.maxBet || 5;
                this.winStreak = parsedData.winStreak || 0;
                this.playerCards = parsedData.playerCards || [];
                this.luigiCards = parsedData.luigiCards || [];
                this.gameState = parsedData.gameState || 'initial';
                this.hasSeenWelcome = parsedData.hasSeenWelcome || false;

                // Load achievements
                if (parsedData.achievements) {
                    Object.keys(this.achievements).forEach(key => {
                        if (parsedData.achievements[key]) {
                            this.achievements[key] = {
                                ...this.achievements[key],
                                completed: parsedData.achievements[key].completed || false,
                                progress: parsedData.achievements[key].progress || '0 of 1'
                            };
                        }
                    });
                }

                if (this.playerCards.length > 0) {
                    this.displaySavedCards();
                }
                
                // Update achievement UI after loading
                this.updateAchievementUI();
                
                // Show last saved time if available
                if (parsedData.lastSaved) {
                    const lastSaved = new Date(parsedData.lastSaved);
                    console.log('Last saved:', lastSaved.toLocaleString());
                }
            } else {
                console.log('No saved game found');
            }
        } catch (error) {
            console.error('Error loading saved game:', error);
            this.messageArea.textContent = 'Error loading saved game!';
            
            // Try to load minimal state if full load fails
            try {
                const savedGame = localStorage.getItem('luigiPokerSave');
                if (savedGame) {
                    const parsedData = JSON.parse(savedGame);
                    if (parsedData.playerCoins) {
                        this.playerCoins = parsedData.playerCoins;
                    }
                    if (parsedData.achievements) {
                        Object.keys(this.achievements).forEach(key => {
                            if (parsedData.achievements[key]) {
                                this.achievements[key].completed = parsedData.achievements[key].completed || false;
                            }
                        });
                    }
                    console.log('Loaded minimal game state as fallback');
                    this.updateAchievementUI();
                }
            } catch (fallbackError) {
                console.error('Fallback load also failed:', fallbackError);
            localStorage.removeItem('luigiPokerSave');
            }
        }

        this.updateMusic();
    }

    displaySavedCards() {
        this.playerCardsContainer.innerHTML = '';
        this.luigiCardsContainer.innerHTML = '';

        for (let i = 0; i < this.playerCards.length; i++) {
            const cardElement = this.createCard(this.playerCards[i]);
            this.playerCardsContainer.appendChild(cardElement);
        }

        for (let i = 0; i < this.luigiCards.length; i++) {
            const cardElement = this.createCard(this.luigiCards[i]);
            this.luigiCardsContainer.appendChild(cardElement);
        }

        if (this.gameState === 'discarding') {
            Array.from(this.playerCardsContainer.children).forEach((cardElement, index) => {
                cardElement.addEventListener('click', () => this.toggleCardSelection(index));
            });
        }
    }

    toggleAudio() {
        if (!this.audioEnabled) {
            this.backgroundMusic.play().then(() => {
                this.audioEnabled = true;
                this.toggleMusicButton.textContent = 'Disable Audio';
            }).catch(error => {
                console.log('Error playing music:', error);
            });
        } else {
            this.backgroundMusic.pause();
            this.audioEnabled = false;
            this.toggleMusicButton.textContent = 'Enable Audio';
        }
    }

    playSound(soundFile) {
        if (this.audioEnabled) {
            const sound = new Audio(`assets/${soundFile}`);
            sound.play().catch(error => console.log(`Error playing ${soundFile}:`, error));
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
        this.hasSeenWelcome = true;
        
        this.backgroundMusic.play().then(() => {
            this.audioEnabled = true;
            this.toggleMusicButton.textContent = 'Disable Audio';
        }).catch(error => {
            console.log('Error playing music:', error);
        });
        
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

    initializeGameModifiers() {
        // Check if achievements are unlocked
        const showLuigiHandUnlocked = this.achievements['5-win-streak'].completed;
        const hardModeUnlocked = this.achievements['25-win-streak'].completed;

        // Get the toggle elements
        const showLuigiHandToggle = document.getElementById('show-luigi-hand');
        const hardModeToggle = document.getElementById('hard-mode');

        // Only set showLuigiHand to true if the achievement is unlocked and it was previously enabled
        this.showLuigiHand = showLuigiHandUnlocked && localStorage.getItem('showLuigiHand') === 'true';
        this.hardMode = hardModeUnlocked && localStorage.getItem('hardMode') === 'true';
        this.callWario = localStorage.getItem('callWario') === 'true';

        // Update UI state
        if (showLuigiHandUnlocked) {
            showLuigiHandToggle.disabled = false;
            showLuigiHandToggle.checked = this.showLuigiHand;
            showLuigiHandToggle.closest('.checkbox-container').classList.remove('locked');
        } else {
            showLuigiHandToggle.disabled = true;
            showLuigiHandToggle.checked = false;
            this.showLuigiHand = false; // Ensure it's false if achievement isn't unlocked
            showLuigiHandToggle.closest('.checkbox-container').classList.add('locked');
        }

        if (hardModeUnlocked) {
            hardModeToggle.disabled = false;
            hardModeToggle.checked = this.hardMode;
            hardModeToggle.closest('.checkbox-container').classList.remove('locked');
        } else {
            hardModeToggle.disabled = true;
            hardModeToggle.checked = false;
            this.hardMode = false; // Ensure it's false if achievement isn't unlocked
            hardModeToggle.closest('.checkbox-container').classList.add('locked');
        }

        // Update Wario mode
        const callWarioToggle = document.getElementById('call-wario');
        if (callWarioToggle) {
            callWarioToggle.checked = this.callWario;
        }
    }

    attachGameModifiers() {
        const showLuigiHandToggle = document.getElementById('show-luigi-hand');
        const hardModeToggle = document.getElementById('hard-mode');
        const callWarioToggle = document.getElementById('call-wario');

        if (showLuigiHandToggle) {
            showLuigiHandToggle.addEventListener('change', (e) => {
                // Only allow if achievement is unlocked and in initial state
                if (this.gameState === 'initial' && this.achievements['5-win-streak'].completed) {
                    this.showLuigiHand = e.target.checked;
                    localStorage.setItem('showLuigiHand', this.showLuigiHand);
                    console.log('Show Luigi Hand:', this.showLuigiHand);
                } else {
                    // Reset the toggle if achievement not unlocked
                    e.target.checked = false;
                    this.showLuigiHand = false;
                }
            });
        }

        if (hardModeToggle) {
            hardModeToggle.addEventListener('change', (e) => {
                // Only allow if achievement is unlocked and in initial state
                if (this.gameState === 'initial' && this.achievements['25-win-streak'].completed) {
                    this.hardMode = e.target.checked;
                    localStorage.setItem('hardMode', this.hardMode);
                    this.updateBetDisplay();
                    this.updateUI();
                    console.log('Hard Mode:', this.hardMode);
                } else {
                    // Reset the toggle if achievement not unlocked
                    e.target.checked = false;
                    this.hardMode = false;
                }
            });
        }

        if (callWarioToggle) {
            callWarioToggle.addEventListener('change', (e) => {
                if (this.gameState === 'initial') {
                    this.callWario = e.target.checked;
                    localStorage.setItem('callWario', this.callWario);
                    this.updateUI();
                    this.updateMusic();
                    console.log('Call Wario:', this.callWario);
                }
            });
        }
    }

    updateMusic() {
        if (this.audioEnabled) {
            this.backgroundMusic.pause();
            this.backgroundMusic.src = this.callWario ? 'assets/wario.mp3' : 'assets/casino.mp3';
            this.backgroundMusic.volume = this.callWario ? 0.25 : 0.5;
            this.backgroundMusic.play().catch(error => {
                console.log('Error playing music:', error);
            });
        }
    }

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

    updateBetDisplay() {
        const currentBetElement = document.getElementById('current-bet');
        if (this.hardMode) {
            this.defaultBet = 1;
            this.maxBet = Math.min(5, Math.floor(this.playerCoins / 10));
            currentBetElement.textContent = (this.currentBet * 10).toString();
        } else {
            this.defaultBet = 1;
            currentBetElement.textContent = this.defaultBet.toString();
            this.currentBet = this.defaultBet;
            this.maxBet = 5;
        }
    }

    async autoPlayHand() {
        if (!this.callWario) return;

        const counts = {};
        this.playerCards.forEach(card => {
            counts[card] = (counts[card] || 0) + 1;
        });

        const currentHand = this.evaluateHand(this.playerCards);
        const cardValues = Object.keys(counts).map(Number).sort((a, b) => b - a);
        const highCards = cardValues.filter(value => value >= 4);
        const pairs = Object.entries(counts).filter(([_, count]) => count === 2);
        const threeOfAKind = Object.entries(counts).find(([_, count]) => count === 3);
        const fourOfAKind = Object.entries(counts).find(([_, count]) => count === 4);

        let selectedDiscards = new Set();

        if (currentHand.score === 7) {
            // Five of a Kind
            selectedDiscards = new Set();
        } else if (currentHand.score === 6) {
            // Four of a Kind
            const fourValue = parseInt(fourOfAKind[0]);
            this.playerCards.forEach((card, index) => {
                if (card !== fourValue) {
                    selectedDiscards.add(index);
                }
            });
        } else if (currentHand.score === 5) {
            // Full House - Keep all cards
            selectedDiscards = new Set();
        } else if (currentHand.score === 4) {
            // Three of a Kind
            const threeValue = parseInt(threeOfAKind[0]);
            this.playerCards.forEach((card, index) => {
                if (card !== threeValue) {
                    selectedDiscards.add(index);
                }
            });
        } else if (currentHand.score === 3) {
            // Two Pairs
            const pairs = Object.entries(counts)
                .filter(([_, count]) => count === 2)
                .map(([value]) => parseInt(value));

            const outlierCard = this.playerCards.find(card => !pairs.includes(card));
            
            this.playerCards.forEach((card, index) => {
                if (card === outlierCard) {
                    selectedDiscards.add(index);
                }
            });
        } else if (currentHand.score === 2) {
            // One Pair
            const pairValue = parseInt(pairs[0][0]);
            
            this.playerCards.forEach((card, index) => {
                if (card !== pairValue) {
                    selectedDiscards.add(index);
                }
            });
        } else {
            // High Card
            const sortedCards = [...this.playerCards].sort((a, b) => b - a);
            const highestCard = sortedCards[0];
            
            
            if (highestCard >= 4) {
                this.playerCards.forEach((card, index) => {
                    if (card !== highestCard) {
                        selectedDiscards.add(index);
                    }
                });
            } else {
                
                this.playerCards.forEach((card, index) => {
                    selectedDiscards.add(index);
                });
            }
        }

        this.selectedCards = selectedDiscards;
        
        if (this.selectedCards.size > 0) {
            this.playSound('select.wav');
        }

        Array.from(this.playerCardsContainer.children).forEach((card, index) => {
            if (this.selectedCards.has(index)) {
                card.classList.add('selected');
            }
        });

        await new Promise(resolve => setTimeout(resolve, 1000));
        await this.discardCards();
    }

    initializeHelpButtons() {
        const helpButtons = {
            'show-luigi-hand-help': 'show-luigi-hand-help-popup',
            'hard-mode-help': 'hard-mode-help-popup',
            'call-wario-help': 'call-wario-help-popup'
        };

        for (const [buttonId, popupId] of Object.entries(helpButtons)) {
            const button = document.getElementById(buttonId);
            const popup = document.getElementById(popupId);
            const closeButton = popup.querySelector('.close-help-button');

            button.addEventListener('click', () => this.showHelpPopup(popup));
            closeButton.addEventListener('click', () => this.hideHelpPopup(popup));
        }
    }

    showHelpPopup(popup) {
        popup.classList.add('show');
    }

    hideHelpPopup(popup) {
        popup.classList.remove('show');
    }

    updateAchievementUI() {
        document.querySelectorAll('.achievement-item').forEach(item => {
            const achievementId = item.dataset.achievement;
            const achievement = this.achievements[achievementId];
            
            // Reset classes first
            item.classList.remove('locked', 'completed');
            
            // Add appropriate class based on completion status
            if (achievement.completed) {
                item.classList.add('completed');
            } else {
                item.classList.add('locked');
            }
        });
    }

    checkAchievements(handType, didWin) {
        // Don't check achievements if Wario mode is enabled
        if (this.callWario) {
            return;
        }

        // Check for Five of a Kind with Luigi cards
        if (handType === 'Five of a Kind' && this.playerCards.every(card => card === 4)) {
            this.achievements['five-of-a-kind-luigi'].progress = '1 of 1';
            this.unlockAchievement('five-of-a-kind-luigi');
        }

        // Check for Junk hand win
        if (handType === 'High Card' && didWin) {
            this.achievements['junk-win'].progress = '1 of 1';
            this.unlockAchievement('junk-win');
        }

        // Check for 25 win streak
        if (didWin) {
            this.achievements['25-win-streak'].progress = `${this.winStreak} of 25`;
            if (this.winStreak >= 25) {
                this.unlockAchievement('25-win-streak');
            }
        } else {
            this.achievements['25-win-streak'].progress = '0 of 25';
        }

        // Check for 5 win streak
        if (didWin) {
            this.achievements['5-win-streak'].progress = `${this.winStreak} of 5`;
            if (this.winStreak >= 5) {
                this.unlockAchievement('5-win-streak');
            }
        } else {
            this.achievements['5-win-streak'].progress = '0 of 5';
        }

        // Check for discarding only Luigi's cards
        if (this.discardedOnlyLuigiCards && didWin) {
            this.achievements['luigi-discard-only'].progress = '1 of 1';
            this.unlockAchievement('luigi-discard-only');
        }

        // Check for consecutive wins
        if (didWin) {
            // Note: We don't increment consecutiveWins here since it's handled in updateWinStreak
            this.achievements['10-consecutive-wins'].progress = `${this.winStreak} of 10`;
            if (this.winStreak >= 10) {
                this.unlockAchievement('10-consecutive-wins');
            }
        } else {
            this.achievements['10-consecutive-wins'].progress = '0 of 10';
        }

        // Check for consecutive full houses
        if (handType === 'Full House') {
            this.consecutiveFullHouses++;
            this.achievements['3-full-houses'].progress = `${this.consecutiveFullHouses} of 3`;
            if (this.consecutiveFullHouses >= 3) {
                this.unlockAchievement('3-full-houses');
            }
        } else {
            this.consecutiveFullHouses = 0;
            this.achievements['3-full-houses'].progress = '0 of 3';
        }

        // Check for Star-Mario combo
        if (didWin) {
            const counts = new Array(7).fill(0);
            this.playerCards.forEach(card => counts[card]++);
            
            // Check for two pairs (Mario and Luigi) and one Star
            const hasMarioPair = counts[5] === 2;  // Mario (5)
            const hasLuigiPair = counts[4] === 2;  // Luigi (4)
            const hasStar = counts[6] === 1;       // Star (6)
            
            if (hasMarioPair && hasLuigiPair && hasStar) {
                this.achievements['star-mario-combo'].progress = '1 of 1';
                this.unlockAchievement('star-mario-combo');
            }
        }

        // Check for true tie
        if (!didWin && this.messageArea.textContent.includes("It's a tie! You get your bet back.")) {
            const playerHand = this.evaluateHand(this.playerCards);
            const luigiHand = this.evaluateHand(this.luigiCards);
            
            // Check if all cards are equal in value
            const sortedPlayerCards = [...this.playerCards].sort((a, b) => b - a);
            const sortedLuigiCards = [...this.luigiCards].sort((a, b) => b - a);
            const allCardsEqual = sortedPlayerCards.every((card, index) => card === sortedLuigiCards[index]);
            
            if (playerHand.type === luigiHand.type && allCardsEqual) {
                this.achievements['true-tie'].progress = '1 of 1';
                this.unlockAchievement('true-tie');
            }
        }

        // Check for no discard win - only trigger if no cards were discarded during the round
        if (didWin && !this.hasDiscardedCards) {
            this.achievements['no-discard-win'].progress = '1 of 1';
            this.unlockAchievement('no-discard-win');
        }

        // Check for lowest win (only Clouds and Mushrooms)
        if (didWin) {
            const hasOnlyLowCards = this.playerCards.every(card => card === 1 || card === 2);  // Only Cloud (1) and Mushroom (2)
            if (hasOnlyLowCards) {
                this.achievements['lowest-win'].progress = '1 of 1';
                this.unlockAchievement('lowest-win');
            }
        }

        // Check for Mario-Luigi-Star achievement
        if (didWin) {
            const counts = new Array(7).fill(0);
            this.playerCards.forEach(card => counts[card]++);
            
            // Check for two pairs (Mario and Luigi) and one Star
            const hasMarioPair = counts[5] === 2;  // Mario (5)
            const hasLuigiPair = counts[4] === 2;  // Luigi (4)
            const hasStar = counts[6] === 1;       // Star (6)
            
            if (hasMarioPair && hasLuigiPair && hasStar) {
                this.achievements['mario-luigi-star'].progress = '1 of 1';
                this.unlockAchievement('mario-luigi-star');
            }
        }

        // Check for Luigi Master
        if (didWin) {
            const luigiCount = this.playerCards.filter(card => card === 4).length;
            if (luigiCount >= 3) {
                this.consecutiveLuigiWins++;
                this.achievements['luigi-master'].progress = `${this.consecutiveLuigiWins} of 5`;
                if (this.consecutiveLuigiWins >= 5) {
                    this.unlockAchievement('luigi-master');
                }
            } else {
                this.consecutiveLuigiWins = 0;
                this.achievements['luigi-master'].progress = '0 of 5';
            }
        } else {
            this.consecutiveLuigiWins = 0;
            this.achievements['luigi-master'].progress = '0 of 5';
        }

        // Reset flags for next game
        this.discardedOnlyLuigiCards = false;
        this.hasDiscardedCards = false;
    }

    unlockAchievement(achievementId) {
        if (!this.achievements[achievementId].completed) {
            this.achievements[achievementId].completed = true;
            
            // Handle modifier unlocks
            let unlockedModifier = false;
            if (achievementId === '5-win-streak') {
                localStorage.setItem('showLuigiHand', 'true');
                this.showLuigiHand = true;
                // Update Show Luigi Hand toggle UI
                const showLuigiHandToggle = document.getElementById('show-luigi-hand');
                if (showLuigiHandToggle) {
                    showLuigiHandToggle.disabled = false;
                    showLuigiHandToggle.checked = true;
                    showLuigiHandToggle.closest('.checkbox-container').classList.remove('locked');
                }
                unlockedModifier = true;
            } else if (achievementId === '25-win-streak') {
                localStorage.setItem('hardMode', 'true');
                this.hardMode = true;
                // Update Hard Mode toggle UI
                const hardModeToggle = document.getElementById('hard-mode');
                if (hardModeToggle) {
                    hardModeToggle.disabled = false;
                    hardModeToggle.checked = true;
                    hardModeToggle.closest('.checkbox-container').classList.remove('locked');
                }
                unlockedModifier = true;
            }
            
            this.saveGame();
            this.updateAchievementUI();
            this.updateUI();
            
            // Play achievement sound
            this.playSound('achievement.wav');
            
            // If a modifier was unlocked, play unlock sound after a short delay
            if (unlockedModifier) {
                setTimeout(() => {
                    this.playSound('unlock.wav');
                }, 500);
            }
            
            // Show achievement notification
            this.messageArea.textContent = `Achievement Unlocked: ${this.achievements[achievementId].name}!`;
            setTimeout(() => {
                if (this.gameState === 'initial') {
                    this.messageArea.textContent = '';
                }
            }, 3000);
        }
    }
}

window.addEventListener('load', () => {
    new PicturePoker();
}); 