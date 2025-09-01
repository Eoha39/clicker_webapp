// Telegram Web App initialization
let tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Game state
let gameState = {
    coins: 0,
    coinsPerClick: 1,
    coinsPerSecond: 0,
    upgrades: {
        autoClicker: { level: 0, cost: 10, baseCost: 10, multiplier: 1.15, cps: 0.1 },
        megaClicker: { level: 0, cost: 50, baseCost: 50, multiplier: 1.15, cps: 0.5 },
        gigaClicker: { level: 0, cost: 200, baseCost: 200, multiplier: 1.15, cps: 2 },
        teraClicker: { level: 0, cost: 1000, baseCost: 1000, multiplier: 1.15, cps: 10 },
        petaClicker: { level: 0, cost: 5000, baseCost: 5000, multiplier: 1.15, cps: 50 },
        clickMultiplier: { level: 0, cost: 100, baseCost: 100, multiplier: 1.15, effect: 1 }
    },
    achievements: {
        firstClick: { unlocked: false, requirement: 1, type: 'clicks' },
        tenClicks: { unlocked: false, requirement: 10, type: 'clicks' },
        hundredClicks: { unlocked: false, requirement: 100, type: 'clicks' },
        thousandClicks: { unlocked: false, requirement: 1000, type: 'clicks' },
        firstUpgrade: { unlocked: false, requirement: 1, type: 'upgrades' },
        tenUpgrades: { unlocked: false, requirement: 10, type: 'upgrades' },
        firstAutoClicker: { unlocked: false, requirement: 1, type: 'autoClickers' },
        tenAutoClickers: { unlocked: false, requirement: 10, type: 'autoClickers' },
        richPlayer: { unlocked: false, requirement: 1000, type: 'coins' },
        millionaire: { unlocked: false, requirement: 1000000, type: 'coins' }
    },
    stats: {
        totalClicks: 0,
        totalUpgrades: 0,
        totalAutoClickers: 0
    }
};

// Load game state from localStorage
function loadGame() {
    const saved = localStorage.getItem('gigaCodeClicker');
    if (saved) {
        const loaded = JSON.parse(saved);
        gameState = { ...gameState, ...loaded };
    }
}

// Save game state to localStorage
function saveGame() {
    localStorage.setItem('gigaCodeClicker', JSON.stringify(gameState));
}

// Format numbers for display
function formatNumber(num) {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return Math.floor(num).toString();
}

// Update UI
function updateUI() {
    document.getElementById('coins').textContent = formatNumber(gameState.coins);
    document.getElementById('cps').textContent = formatNumber(gameState.coinsPerSecond);
    updateUpgrades();
    updateAchievements();
}

// Handle clicking
function handleClick() {
    const coinsGained = gameState.coinsPerClick;
    gameState.coins += coinsGained;
    gameState.stats.totalClicks++;
    
    // Visual effects
    showClickEffect();
    showClickText(coinsGained);
    
    // Check achievements
    checkAchievements();
    
    // Update UI and save
    updateUI();
    saveGame();
}

// Show click effect
function showClickEffect() {
    const effect = document.getElementById('click-effect');
    effect.style.animation = 'none';
    effect.offsetHeight; // Trigger reflow
    effect.style.animation = 'clickPulse 0.3s ease-out';
}

// Show click text
function showClickText(amount) {
    const clickText = document.getElementById('click-text');
    clickText.textContent = `+${formatNumber(amount)}`;
    clickText.style.animation = 'none';
    clickText.offsetHeight; // Trigger reflow
    clickText.style.animation = 'floatUp 1s ease-out';
}

// Calculate upgrade cost
function calculateUpgradeCost(upgrade) {
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.multiplier, upgrade.level));
}

// Buy upgrade
function buyUpgrade(upgradeKey) {
    const upgrade = gameState.upgrades[upgradeKey];
    const cost = calculateUpgradeCost(upgrade);
    
    if (gameState.coins >= cost) {
        gameState.coins -= cost;
        upgrade.level++;
        upgrade.cost = calculateUpgradeCost(upgrade);
        gameState.stats.totalUpgrades++;
        
        // Apply upgrade effects
        if (upgradeKey === 'clickMultiplier') {
            gameState.coinsPerClick = 1 + (upgrade.level * upgrade.effect);
        } else {
            gameState.coinsPerSecond += upgrade.cps;
        }
        
        // Check achievements
        checkAchievements();
        
        // Update UI and save
        updateUI();
        saveGame();
        
        // Show notification
        tg.showAlert(`Улучшение куплено! +${upgrade.cps || upgrade.effect} ${upgradeKey === 'clickMultiplier' ? 'за клик' : 'в секунду'}`);
    }
}

// Update upgrades display
function updateUpgrades() {
    const upgradesGrid = document.getElementById('upgrades-grid');
    upgradesGrid.innerHTML = '';
    
    const upgradeData = {
        autoClicker: { name: 'Автокликер', description: 'Автоматически кликает за вас', icon: '🤖' },
        megaClicker: { name: 'Мега-кликер', description: 'Мощный автокликер', icon: '⚡' },
        gigaClicker: { name: 'Гига-кликер', description: 'Очень мощный автокликер', icon: '🚀' },
        teraClicker: { name: 'Тера-кликер', description: 'Невероятно мощный автокликер', icon: '💎' },
        petaClicker: { name: 'Пета-кликер', description: 'Легендарный автокликер', icon: '👑' },
        clickMultiplier: { name: 'Множитель кликов', description: 'Увеличивает монеты за клик', icon: '🎯' }
    };
    
    Object.entries(gameState.upgrades).forEach(([key, upgrade]) => {
        const data = upgradeData[key];
        const cost = calculateUpgradeCost(upgrade);
        const canAfford = gameState.coins >= cost;
        
        const upgradeElement = document.createElement('div');
        upgradeElement.className = `upgrade-item ${canAfford ? 'affordable' : 'expensive'}`;
        upgradeElement.onclick = () => buyUpgrade(key);
        
        upgradeElement.innerHTML = `
            <div class="upgrade-info">
                <div class="upgrade-name">${data.icon} ${data.name} (${upgrade.level})</div>
                <div class="upgrade-description">${data.description}</div>
            </div>
            <div class="upgrade-cost">${formatNumber(cost)} 🪙</div>
        `;
        
        upgradesGrid.appendChild(upgradeElement);
    });
}

// Check achievements
function checkAchievements() {
    let totalUpgrades = 0;
    let totalAutoClickers = 0;
    
    Object.values(gameState.upgrades).forEach(upgrade => {
        totalUpgrades += upgrade.level;
        if (upgrade.cps) totalAutoClickers += upgrade.level;
    });
    
    Object.entries(gameState.achievements).forEach(([key, achievement]) => {
        if (achievement.unlocked) return;
        
        let currentValue = 0;
        switch (achievement.type) {
            case 'clicks':
                currentValue = gameState.stats.totalClicks;
                break;
            case 'upgrades':
                currentValue = totalUpgrades;
                break;
            case 'autoClickers':
                currentValue = totalAutoClickers;
                break;
            case 'coins':
                currentValue = gameState.coins;
                break;
        }
        
        if (currentValue >= achievement.requirement) {
            achievement.unlocked = true;
            tg.showAlert(`🏆 Достижение разблокировано: ${getAchievementName(key)}!`);
        }
    });
}

// Get achievement name
function getAchievementName(key) {
    const names = {
        firstClick: 'Первый клик',
        tenClicks: '10 кликов',
        hundredClicks: '100 кликов',
        thousandClicks: '1000 кликов',
        firstUpgrade: 'Первое улучшение',
        tenUpgrades: '10 улучшений',
        firstAutoClicker: 'Первый автокликер',
        tenAutoClickers: '10 автокликеров',
        richPlayer: 'Богач',
        millionaire: 'Миллионер'
    };
    return names[key] || key;
}

// Update achievements display
function updateAchievements() {
    const achievementsGrid = document.getElementById('achievements-grid');
    achievementsGrid.innerHTML = '';
    
    const achievementData = {
        firstClick: { icon: '👆', description: 'Сделайте первый клик' },
        tenClicks: { icon: '👆👆', description: 'Сделайте 10 кликов' },
        hundredClicks: { icon: '👆👆👆', description: 'Сделайте 100 кликов' },
        thousandClicks: { icon: '👆👆👆👆', description: 'Сделайте 1000 кликов' },
        firstUpgrade: { icon: '🛠️', description: 'Купите первое улучшение' },
        tenUpgrades: { icon: '🔧', description: 'Купите 10 улучшений' },
        firstAutoClicker: { icon: '🤖', description: 'Купите первый автокликер' },
        tenAutoClickers: { icon: '⚡', description: 'Купите 10 автокликеров' },
        richPlayer: { icon: '💰', description: 'Накопите 1000 монет' },
        millionaire: { icon: '💎', description: 'Накопите 1,000,000 монет' }
    };
    
    Object.entries(gameState.achievements).forEach(([key, achievement]) => {
        const data = achievementData[key];
        
        let currentValue = 0;
        switch (achievement.type) {
            case 'clicks':
                currentValue = gameState.stats.totalClicks;
                break;
            case 'upgrades':
                currentValue = Object.values(gameState.upgrades).reduce((sum, u) => sum + u.level, 0);
                break;
            case 'autoClickers':
                currentValue = Object.values(gameState.upgrades).reduce((sum, u) => sum + (u.cps ? u.level : 0), 0);
                break;
            case 'coins':
                currentValue = gameState.coins;
                break;
        }
        
        const progress = Math.min(currentValue / achievement.requirement, 1);
        
        const achievementElement = document.createElement('div');
        achievementElement.className = `achievement-item ${achievement.unlocked ? 'unlocked' : ''}`;
        
        achievementElement.innerHTML = `
            <div class="achievement-icon">${data.icon}</div>
            <div class="achievement-info">
                <div class="achievement-name">${getAchievementName(key)}</div>
                <div class="achievement-description">${data.description}</div>
                <div class="achievement-progress">
                    <div class="achievement-progress-bar" style="width: ${progress * 100}%"></div>
                </div>
            </div>
        `;
        
        achievementsGrid.appendChild(achievementElement);
    });
}

// Auto-save and passive income
function gameLoop() {
    // Passive income
    gameState.coins += gameState.coinsPerSecond / 10; // 10 times per second
    
    // Update UI
    updateUI();
    
    // Save game
    saveGame();
}

// Initialize game
function initGame() {
    loadGame();
    updateUI();
    
    // Set up click handler
    document.getElementById('clickable-logo').addEventListener('click', handleClick);
    
    // Set up game loop
    setInterval(gameLoop, 100);
    
    // Show welcome message
    if (gameState.coins === 0) {
        tg.showAlert('Добро пожаловать в GigaCode Clicker! Кликайте по логотипу, чтобы заработать монеты!');
    }
}

// Start the game when page loads
document.addEventListener('DOMContentLoaded', initGame);

// Handle visibility change to save game when app is minimized
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        saveGame();
    }
});
