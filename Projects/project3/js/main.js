"use strict";

window.onload = (e) => {
    document.querySelector("#wagerButton").onclick = wagerButtonClicked,
        document.querySelector("#cashoutButton").onclick = cashoutButtonClicked,
        document.querySelector("#autoCashout").addEventListener('input', updatePotentialWin),
        document.querySelector("#wager").addEventListener('input', updatePotentialWin);
};


let gameWindow = document.querySelector("#gameWindow");

const app = new PIXI.Application({
    width: 1000,
    height: 500
});
gameWindow.appendChild(app.view);

// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;

// pre-load the images (this code works with PIXI v6)
app.loader.
    add([
        "images/spaceship.png",
        "images/explosions.png"
    ]);
app.loader.onProgress.add(e => { console.log(`progress=${e.progress}`) });
app.loader.onComplete.add(setup);
app.loader.load();



// aliases
let stage;

// game variables
let startScene;
let gameScene, ship, scoreLabel, lifeLabel, shootSound, hitSound, fireballSound;
let gameOverScene;
let input;

// Game variables
let wager = 0;
let multiplier = 0.00;
let timer = 1.00;
let isGameStarted = false;
let currentMultiplier;
let isCashedOut = false;
let isTimerUp = false;
let credits = 200;
let profit;
let creditsText;
let winText;
let autoCashoutValue;
let isAutoCashout;

// Graphics

const circleDefaultX = 100;
const circleDefaultY = (sceneHeight - 50);

const graphicsSpeedScale = 1;
const timerScale = 0.001;

// Make circle (xPos, yPos, radius, color)
const circle = makeCircle(circleDefaultX, circleDefaultY, 5, 0xFFFF00);
app.stage.addChild(circle);

// Make rectangle (width, height, color)
const graphX = makeRectangle(sceneWidth, 5, 0x4c525e);
graphX.x = sceneWidth / 2;
graphX.y = sceneHeight - 50;
app.stage.addChild(graphX);

const graphY = makeRectangle(5, sceneHeight, 0x4c525e);
graphY.x = 100;
graphY.y = sceneHeight / 2;
app.stage.addChild(graphY);

// const lineRect = makeRectangle(2.5, 2.5, 0xFFFF00);
// lineRect.x = circleDefaultX;
// lineRect.y = circleDefaultY;
// lineRect.x = 0;
// lineRect.y = sceneHeight;
// app.stage.addChild(lineRect);

const line = new PIXI.Graphics();
app.stage.addChild(line);
line.lineStyle(5, 0xFFFF00);
line.position.set(circleDefaultX, circleDefaultY);
line.lineTo(circle.x, circle.y);
// app.stage.addChild(line);


// Axis Labels
const timeLabels = [];
const multiplierLabels = [];
const timeInterval = 2;
let multiplierInterval = 0.2;
let elapsedTime = 0;

let hasCircleStopped = false;


// Historic Data
let previousMultipliers = [];

let previousRounds = [];

let hasLost;


function setup() {
    stage = app.stage;
    // #1 - Create the `start` scene
    startScene = new PIXI.Container();
    app.renderer.backgroundColor = 0x203340;
    stage.addChild(startScene);

    // #2 - Create the main `game` scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);

    // #3 - Create the `gameOver` scene and make it invisible
    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);



    // Create labels for x-axis (Time)
    for (let i = 0; i <= 5; i++) {
        const timeLabel = new Label((i * timeInterval).toFixed(0) + "s", (i / 5) * sceneWidth + 50, sceneHeight - 50, { fill: 0xffffff });
        if (i == 0) {
            timeLabel.setText("");
        }
        timeLabels.push(timeLabel);
    }




    // Create labels for y-axis (Multiplier)
    for (let i = 0; i < 5; i++) {

        let multiplierValue;
        if (i === 0) {
            multiplierValue = 1.0.toFixed(1); // First label is always 1
        } else {
            multiplierValue = (i * multiplierInterval + 1).toFixed(1); // Calculate multiplier value
        }
        const multiplierLabel = new Label(multiplierValue + "x", 40, (0.8 - i / 5) * sceneHeight, { fill: 0xffffff });
        multiplierLabels.push(multiplierLabel);
    }

    // // #4 - Create labels for all 3 scenes
    // createLabelsAndButtons();

    // // #5 - Create ship
    // ship = new Ship();
    // gameScene.addChild(ship);

    // // #6 - Load Sounds
    // shootSound = new Howl({
    //     src: ['sounds/shoot.wav']
    // });

    // hitSound = new Howl({
    //     src: ['sounds/hit.mp3']
    // });

    // fireballSound = new Howl({
    //     src: ['sounds/fireball.mp3']
    // });

    // // #7 - Load sprite sheet
    // explosionTextures = loadSpriteSheet();

    // // #8 - Start update loop
    // app.ticker.add(gameLoop);

    // // #9 - Start listening for click events on the canvas
    // app.view.onclick = fireBullet;

    // Now our `startScene` is visible
    // Clicking the button calls startGame()

    // input = new PIXI.TextInput({
    //     input: {
    //         fontSize: '24px',
    //         padding: '12px',
    //         width: '200px',
    //         color: '#26272E'
    //     },
    //     box: {
    //         default: {fill: 0xE8E9F3, rounded: 12, stroke: {color: 0xCBCEE0, width: 3}},
    //         focused: {fill: 0xDFE1EC, rounded: 12, stroke: {color: 0xABAFC6, width: 3}},
    //         disabled: {fill: 0xDBDBDB, rounded: 12}
    //     }
    // });
    // input.placeholder = 'Enter Text';
    // input.position.set(300, 600);
    // startScene.addChild(input);


    let textStyle = new PIXI.TextStyle({
        fill: 0xffffff,
        fontSize: 48,
        fontFamily: "Futura"
    });

    // let wagerButton = new PIXI.Text("Place Bet!");
    // wagerButton.style = buttonStyle;
    // wagerButton.x = 300;
    // wagerButton.y = sceneHeight - 100;
    // wagerButton.interactive = true;
    // wagerButton.buttonMode = true;
    // wagerButton.on("pointerup", startGame);     // startGame is a function reference
    // wagerButton.on("pointerover", e => e.target.alpha = 0.7);       // concise arrow function with no brackets
    // wagerButton.on("pointerout", e => e.currentTarget.alpha = 1.0);
    // startScene.addChild(wagerButton);


    currentMultiplier = new PIXI.Text(timer.toFixed(2) + "x");
    currentMultiplier.style = textStyle;
    currentMultiplier.x = sceneWidth / 2;
    currentMultiplier.y = sceneHeight / 2 - 100;
    // currentMultiplier.interactive = true;
    // currentMultiplier.buttonMode = true;
    // currentMultiplier.on("pointerup", startGame);     // startGame is a function reference
    // currentMultiplier.on("pointerover", e => e.target.alpha = 0.7);       // concise arrow function with no brackets
    // currentMultiplier.on("pointerout", e => e.currentTarget.alpha = 1.0);
    startScene.addChild(currentMultiplier);

    creditsText = new PIXI.Text("Credits: $" + credits.toFixed(2));
    creditsText.style = textStyle;
    creditsText.x = 125;
    creditsText.y = 20;
    startScene.addChild(creditsText);


    winText = new PIXI.Text();
    winText.style = textStyle;
    winText.x = 400;
    winText.y = sceneHeight - 110;
    startScene.addChild(winText);

    // displayPreviousMultipliers();
}

// function startGame() {





//     let inputValue = input.value.trim();
//     wager = parseFloat(inputValue);



// }

function wagerButtonClicked() {

    // reset variables
    resetGraphics();
    timer = 1;
    isTimerUp = false;
    isCashedOut = false;
    winText.text = null;
    isAutoCashout = false;
    currentMultiplier.style.fill = 'green';
    hasLost = false;
    // circle.x = circleDefaultX;
    // circle.y = circleDefaultY;

    // get wager input object
    let wagerInput = document.querySelector("#wager");

    // set wager equal to input value
    wager = wagerInput.value;

    // credits -= wager;

    console.log(wager);

    // Get auto-cashout object
    let autoCashout = document.querySelector("#autoCashout");

    autoCashoutValue = autoCashout.value;

    // let potentialWin = document.querySelector("#potentialWin");

    // potentialWin.onChange


    // Get the auto value if there is one
    if (autoCashoutValue != null) {
        isAutoCashout = true;
        // potentialWin.innerHTML = (autoCashoutValue * wager).toFixed(2);
    }
    else {
        isAutoCashout = false;
    }

    console.log(autoCashoutValue);

    multiplier = generateMultiplier();

    console.log(multiplier);


    if (wager <= 0) {
        alert("Wager must be greater than $0.")
    }
    else if (credits - wager < 0) {
        alert("You don't have enough credits.")
    }
    else if (autoCashoutValue != '' && autoCashoutValue < 1.1)
    {
        alert("Cashout value must be greater than 1.1.")
    }
    else {

        credits -= wager;

        isGameStarted = true;
        // Start the timer
        incrementTimer();

        // isGameStarted = true;

        document.querySelector("#cashoutButton").disabled = false;
        document.querySelector("#wagerButton").disabled = true;
    }

    // // Start the timer
    // incrementTimer();

    // isGameStarted = true;

    // document.querySelector("#cashoutButton").disabled = false;
    // document.querySelector("#wagerButton").disabled = true;

}



// Generate the game multiplier it will reach based on uniform distribution
function generateMultiplier() {


    // // FOR TESTING 
    // if (wager > 1337.13) {
    //     let testMultiplier = 10.00;
    //     return testMultiplier;
    // }

    // First decide if the game could be a "winner"
    let winRandom = Math.random();

    // LOSE
    // 5% chance that game ends almost instantly
    if (winRandom <= 0.05) {

        let loseMultiplyer = Math.random() * 0.1 + 1;
        return loseMultiplyer;
    }

    // WIN
    // Generate a random float between 0 and 1
    const randomNumber = Math.random();

    // Calculate multiplier
    // Roughly 1 / Uniform distributon of (0,1)
    const winnerMultiplier = 1 / (1 - randomNumber);

    return winnerMultiplier;

}

// GAME LOOP
// increment the timer and update the displayed multiplier
function incrementTimer() {

    // Calculate "delta time"
    let dt = 1 / app.ticker.FPS;
    elapsedTime += 1 / app.ticker.FPS;

    // Increment the timer to gradually increase speed over time
    let timerIncrement = Math.pow(timer, 0.5) * timerScale;
    timer += timerIncrement;


    // GAME RUNNING
    if (timer < multiplier && !isCashedOut) {
        // console.log("xPos: " + circle.x);
        // console.log("yPos: " + circle.y);


        // stop the circle from moving off the screen
        if (circle.x < sceneWidth - (sceneWidth / 5) && circle.y > -sceneHeight + (sceneHeight / 3.5)) {

            // Update the circle position
            circle.x += timer * graphicsSpeedScale;
            circle.y = calculateParabolicY(circle.x);


            // Recalculate the line width to keep it the same
            let lineWidth = calculateLineWidth(circle.x);

            // Get midpoint of the line to use as a control point for quadratic curve
            let cpX = (circle.x) / 2;
            let cpY = calculateParabolicY(cpX);

            // Update the line every frame with it's width and curve
            line.clear();
            line.lineStyle(lineWidth, 0xFFFF00);
            line.moveTo(0, 0);
            line.quadraticCurveTo(cpX, cpY, circle.x, circle.y);
        }
        else if (circle.x > sceneWidth || circle.y < -450)
        {
            hasCircleStopped = true;
        }
        // Slow down circle
        else {
            // Update axis values
            hasCircleStopped = true;

            let slowScale = 0.005;

            // Update the circle position
            circle.x += timer * slowScale;
            circle.y = calculateParabolicY(circle.x);


            // Recalculate the line width to keep it the same
            let lineWidth = calculateLineWidth(circle.x);

            // Get midpoint of the line to use as a control point for quadratic curve
            let cpX = (circle.x) / 2;
            let cpY = calculateParabolicY(cpX);

            // Update the line every frame with it's width and curve
            line.clear();
            line.lineStyle(lineWidth, 0xFFFF00);
            line.moveTo(0, 0);
            line.quadraticCurveTo(cpX, cpY, circle.x, circle.y);
        }




        // convert to miliseconds and increment
        setTimeout(incrementTimer, dt * 1000);
    }

    // Handle autocashout
    if (isAutoCashout && !isCashedOut && timer >= parseFloat(autoCashoutValue)) {
        console.log("Autocashout triggered.");
        handleAutoCashout();

        // Add the multiplier to the historic data
        previousMultipliers.push(multiplier);
        // Keep only the last 5 multipliers
        if (previousMultipliers.length > 5) {
            previousMultipliers.shift(); // Remove the oldest multiplier
        }
    }

    // WIN
    else if (timer <= multiplier && isCashedOut) {
        console.log("YOU WIN: " + wager);
        winText.text = "YOU WIN: $" + wager;

        // Add the multiplier to the historic data
        previousMultipliers.push(multiplier);
        if (previousMultipliers.length > 5) {
            previousMultipliers.shift();
        }
    }

    // LOSE
    else if (!isCashedOut && timer >= multiplier) {

        currentMultiplier.style.fill = 'red';
        // credits -= wager;
        console.log("Time's up!");
        console.log("You lost: " + wager);
        isGameStarted = false;
        isTimerUp = true;
        hasLost = true;

        // Toggle buttons
        document.querySelector("#cashoutButton").disabled = true;
        document.querySelector("#wagerButton").disabled = false;


        // Add round data to array
        let cashoutValue = timer;
        let profit = -wager;
        previousRounds.push({
            multiplier: multiplier,
            cashoutValue: cashoutValue,
            profit: profit
        });

        displayPreviousRounds();
    }

    // Update displayed multiplier
    currentMultiplier.text = timer.toFixed(2) + "x";

    // if (hasCircleStopped) {
    // Update axis values
    updateAxisValues(elapsedTime, timer);
    // }
    // // Update axis values
    // updateAxisValues(elapsedTime, timer);


    // Update credits
    creditsText.text = "Credits: $" + credits.toFixed(2);

    // displayPreviousMultipliers();
}

function cashoutButtonClicked() {

    isCashedOut = true;
    wager = (wager * timer).toFixed(2);
    let cashoutValue = timer;
    let profit = parseFloat(wager);
    credits += parseFloat(wager);
    // console.log(wager);

    // Add round data to array
    previousRounds.push({
        multiplier: multiplier, 
        cashoutValue: cashoutValue, 
        profit: profit});

    displayPreviousRounds();

    // Toggle buttons
    document.querySelector("#cashoutButton").disabled = true;
    document.querySelector("#wagerButton").disabled = false;
}

function handleAutoCashout() {

    console.log("autocashout!");

    isCashedOut = true;




    wager = (wager * timer).toFixed(2);
    credits += parseFloat(wager);

    winText.text = "YOU WIN: $" + wager;

    // Add round data to array
    let cashoutValue = timer;
    let profit = parseFloat(wager);
    previousRounds.push({
        multiplier: multiplier, 
        cashoutValue: cashoutValue, 
        profit: profit});

    displayPreviousRounds();

    document.querySelector("#cashoutButton").disabled = true;
    document.querySelector("#wagerButton").disabled = false;
}


// update the potential win value
function updatePotentialWin() {

    // Get values to calculate potential win
    let autoCashoutValue = parseFloat(document.querySelector("#autoCashout").value);
    let wager = parseFloat(document.querySelector("#wager").value);
    let potentialWin = document.querySelector("#potentialWin");

    // Check if null or less than 0 and update potential win text
    if (!isNaN(autoCashoutValue) && autoCashoutValue > 0 && !isNaN(wager) && wager > 0) {
        potentialWin.innerHTML = "Potential Win: $" + (autoCashoutValue * wager).toFixed(2);
    } else {
        potentialWin.innerHTML = "";
    }
}


function makeCircle(xPos = 50, yPos = 50, radius = 5, color) {
    let circle = new PIXI.Graphics();
    circle.beginFill(color);
    circle.lineStyle(4, 0xFFFF00, 1);
    circle.drawCircle(xPos, yPos, radius);
    circle.endFill();
    return circle;
}

function makeRectangle(width = 50, height = 50, color = 0xFF0000) {
    // https://pixijs.download/release/docs/PIXI.Graphics.html
    let rect = new PIXI.Graphics();
    rect.beginFill(color);
    rect.lineStyle(4, 0x4c525e, 1);
    rect.drawRect(-width * .5, -height * .5, width, height);
    rect.endFill();
    return rect;
}

function resetGraphics() {

    // 0 = default position
    circle.x = 0;
    circle.y = 0;
    // lineRect.x = circleDefaultX;
    // lineRect.y = circleDefaultY;
    line.clear();
    line.lineStyle(5, 0xFFFF00);
    line.position.set(circleDefaultX, circleDefaultY);
    line.lineTo(circle.x, circle.y);
    // updateAxisValues(0, 1);
    elapsedTime = 0;
    hasCircleStopped = false;

    // Reset time labels to default values
    for (let i = 0; i <= 5; i++) {
        const timeLabel = timeLabels[i];
        timeLabel.setText((i * timeInterval).toFixed(0) + "s");

    }
    timeLabels[0].setText("");
    // Reset multiplier labels to default values
    for (let i = 0; i < 5; i++) {
        let multiplierValue;
        if (i === 0) {
            multiplierValue = 1.0.toFixed(1); // First label is always 1
        } else {
            multiplierValue = (i * multiplierInterval + 1).toFixed(1); // Calculate multiplier value
        }
        const multiplierLabel = multiplierLabels[i];
        multiplierLabel.setText(multiplierValue + "x");
    }
}

// Calculate parabolic y for circle and line using quadratic equation
function calculateParabolicY(x) {

    // set values, a increases "curve speed"
    let a = -0.0006;
    let b = 0;
    let c = 0;

    // quadratic equation
    let y = a * x * x + b * x + c;

    return y;
}

// Calculate the line width based on the position of the circle
function calculateLineWidth(x) {
    return Math.min(5, Math.pow(x, 0.5));
}

function updateAxisValues(time, multiplier) {

    console.log("Updating axis values...");
    console.log("Time:", time);
    console.log("Multiplier:", multiplier);


    // Update x-axis labels (Time)
    const baseTimer = 0;
    const maxTimerValue = time + 3;
    const timeStepSize = (maxTimerValue - baseTimer) / 4;

    if (hasCircleStopped) {
        for (let i = 0; i < 5; i++) {
            const label = timeLabels[i];
            let updatedTime;


            // Calculate multiplier value based on the base multiplier and step size
            updatedTime = (baseTimer + i * timeStepSize).toFixed(0);
            label.setText(updatedTime + "s");

            // Hide first label
            timeLabels[0].setText("");
        }
    }


    const baseMultiplier = 1;
    // Calculate the maximum value for the multiplier labels based on the current timer
    const maxMultiplierValue = multiplier + 0.3; // Top Y-Axis value will always be 0.3 more than current multiplier

    // Calculate the step size between each multiplier label
    const stepSize = (maxMultiplierValue - baseMultiplier) / 4;
    for (let i = 0; i < 5; i++) {
        let multiplierValue;
        if (i == 0) {
            multiplierValue = baseMultiplier.toFixed(1); // First label should always be 1
        } else {

            // Calculate multiplier value based on the base multiplier and step size
            multiplierValue = (baseMultiplier + i * stepSize).toFixed(1);
        }
        const label = multiplierLabels[i];

        if (label) {
            label.setText(multiplierValue + "x"); // Update label text
        }
    }


}

function displayPreviousMultipliers() {

    // Get the list element
    let multiplierList = document.getElementById("multiplierList");

    multiplierList.innerHTML = "";

    // Create list items
    for (let i = 0; i < previousMultipliers.length; i++) {
        let listItem = document.createElement("li");
        // Set its text to the multiplier value
        listItem.textContent = previousMultipliers[i].toFixed(2) + "x";
        // Use prepend - adds new value to top and other values shift down
        multiplierList.prepend(listItem);
    }
}

function displayPreviousRounds() {

    // Get the list element
    let table = document.getElementById("roundData");

    

    // Remove the oldest data once there are 5 rows
    if (table.rows.length >= 10) {
        table.deleteRow(0); 
        previousRounds.shift();
    }

    table.innerHTML = "";

    // Add round data to list
    for (let i = previousRounds.length - 1; i >= 0; i--) {

        
        // get round data
        let round = previousRounds[i];
        let multiplier = round.multiplier.toFixed(2);
        let cashoutValue = parseFloat(round.cashoutValue).toFixed(2);
        let profit = parseFloat(round.profit).toFixed(2);

        // Make a new row
        let row = table.insertRow();

        // Add cells for each value
        let multiplierCell = row.insertCell();
        multiplierCell.textContent = multiplier + "x";
        let cashedOutCell = row.insertCell();
        // Handle losses
        if (cashoutValue >= multiplier && hasLost) {
            cashedOutCell.textContent = "Crash!";
        }
        else {
            cashedOutCell.textContent = cashoutValue + "x";
        }
        // cashedOutCell.textContent = cashoutValue + "x";
        
        let profitCell = row.insertCell();
        profitCell.textContent = "$" + profit;

        // Change color of row based on profit
        if (profit > 0) {
            row.style.backgroundColor = 'lightgreen';
        }
        else if (profit <= 0){
            row.style.backgroundColor = 'lightcoral';
        }
        
        // // Set the text content to display multiplier, cashed-out value, and profit
        // listItem.textContent = `Actual: ${multiplier}x, Cashed Out: ${cashoutValue}x, Profit: $${profit}`;
        
        // Use prepend - adds new value to top and other values shift down
        // roundList.prepend(listItem);
    }
}
