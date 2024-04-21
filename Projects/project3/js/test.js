// Set up PIXI.js
const app = new PIXI.Application({ width: 800, height: 600 });
document.body.appendChild(app.view);

// Game variables
let wager = 0;
let multiplier = 1;
let timer = 0;
let isGameStarted = false;

// Create UI elements
const wagerInput = document.createElement('input');
wagerInput.type = 'number';
wagerInput.placeholder = 'Enter wager';
document.body.appendChild(wagerInput);

const cashOutButton = document.createElement('button');
cashOutButton.textContent = 'Cash Out';
cashOutButton.disabled = true;
document.body.appendChild(cashOutButton);

const multiplierText = new PIXI.Text('Multiplier: 1', { fill: 'white' });
multiplierText.position.set(10, 10);
app.stage.addChild(multiplierText);

const timerText = new PIXI.Text('Time: 0', { fill: 'white' });
timerText.position.set(10, 30);
app.stage.addChild(timerText);

// Handle user input
wagerInput.addEventListener('change', () => {
    wager = parseInt(wagerInput.value);
    if (!isNaN(wager) && wager > 0 && !isGameStarted) {
        cashOutButton.disabled = false;
    } else {
        cashOutButton.disabled = true;
    }
});

cashOutButton.addEventListener('click', () => {
    // Cash out logic
    const payout = wager * multiplier;
    alert(`You cashed out with ${payout} coins!`);
    resetGame();
});

// Game loop
app.ticker.add(() => {
    if (isGameStarted) {
        timer += app.ticker.deltaTime;
        timerText.text = `Time: ${Math.floor(timer)}`;
        multiplier += 0.01; // Example: Increase multiplier over time
        multiplierText.text = `Multiplier: ${multiplier.toFixed(2)}`;
    }
});

// Start the game
function startGame() {
    isGameStarted = true;
}

// Reset game state
function resetGame() {
    isGameStarted = false;
    wagerInput.value = '';
    cashOutButton.disabled = true;
    wager = 0;
    multiplier = 1;
    timer = 0;
    multiplierText.text = 'Multiplier: 1';
    timerText.text = 'Time: 0';
}