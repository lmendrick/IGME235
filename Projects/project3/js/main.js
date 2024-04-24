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
let credits = 2000;
let profit;
let creditsText;
let winText;
let autoCashoutValue;
let isAutoCashout;

// Graphics

const circleDefaultX = 100;
const circleDefaultY = (sceneHeight - 50);

const graphicsSpeedScale = 0.25;

// Make circle (xPos, yPos, radius, color)
const circle = makeCircle(circleDefaultX, circleDefaultY, 5, 0xFFFF00);
app.stage.addChild(circle);

// Make rectangle (width, height, color)
const graphX = makeRectangle(sceneWidth, 5, 0xFFFF00);
graphX.x = sceneWidth/2;
graphX.y = sceneHeight - 50;
app.stage.addChild(graphX);

const graphY = makeRectangle(5, sceneHeight, 0xFFFF00);
graphY.x = 100;
graphY.y = sceneHeight/2;
app.stage.addChild(graphY);

// const lineRect = makeRectangle(2.5, 2.5, 0xFFFF00);
// lineRect.x = circleDefaultX;
// lineRect.y = circleDefaultY;
// lineRect.x = 0;
// lineRect.y = sceneHeight;
// app.stage.addChild(lineRect);

const line = new PIXI.Graphics();
app.stage.addChild(line);
line.lineStyle(5, 0xffffff);
line.position.set(circleDefaultX, circleDefaultY);
line.lineTo(circle.x, circle.y);
// app.stage.addChild(line);

function setup() {
    stage = app.stage;
    // #1 - Create the `start` scene
    startScene = new PIXI.Container();
    stage.addChild(startScene);

    // #2 - Create the main `game` scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);

    // #3 - Create the `gameOver` scene and make it invisible
    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);

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
        fill: 0xFF0000,
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
    currentMultiplier.y = sceneHeight / 2;
    // currentMultiplier.interactive = true;
    // currentMultiplier.buttonMode = true;
    // currentMultiplier.on("pointerup", startGame);     // startGame is a function reference
    // currentMultiplier.on("pointerover", e => e.target.alpha = 0.7);       // concise arrow function with no brackets
    // currentMultiplier.on("pointerout", e => e.currentTarget.alpha = 1.0);
    startScene.addChild(currentMultiplier);

    creditsText = new PIXI.Text("Credits: $" + credits.toFixed(2));
    creditsText.style = textStyle;
    creditsText.x = 100;
    creditsText.y = 20;
    startScene.addChild(creditsText);


    winText = new PIXI.Text();
    winText.style = textStyle;
    winText.x = 200;
    winText.y = 100;
    startScene.addChild(winText);

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
    // circle.x = circleDefaultX;
    // circle.y = circleDefaultY;

    // get wager input object
    let wagerInput = document.querySelector("#wager");

    // set wager equal to input value
    wager = wagerInput.value;

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
    else if (credits - wager < 0)
    {
        alert("You don't have enough credits.")
    }
    else {

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


    // FOR TESTING 
    if (wager > 1337.13)
    {
        let testMultiplier = 5.00;
        return testMultiplier;
    }

    // First decide if the game could be a "winner"
    let winRandom = Math.random();

    // LOSE
    // 5% chance that the multiplyer is under 1x
    if (winRandom <= 0.05) {

        let loseMultiplyer = Math.random() + 1;
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

    timer += dt / 10;

    // GAME RUNNING
    if (timer < multiplier && !isCashedOut) {
        console.log("xPos: " + circle.x);
        console.log("yPos: " + circle.y);

        // stop the circle from moving off the screen
        if (circle.x < sceneWidth - (sceneWidth / 5) && circle.y < sceneHeight - (sceneHeight / 2.5)) {
            circle.x += timer * graphicsSpeedScale;
            circle.y -= timer * (graphicsSpeedScale / 2);
            
            // lineRect.x = circle.x;
            // lineRect.y = sceneHeight + circle.y;
            // lineRect.width += timer * graphicsSpeedScale;
            // lineRect.height -= timer * (graphicsSpeedScale / 2);


            // const line = new PIXI.Graphics();
            // app.stage.addChild(line);
            // line.lineStyle(4, 0xffffff);
            line.moveTo(0, 0);
            line.lineTo(circle.x, circle.y);

            // line.clear();
            // line.lineTo(circle.x, circle.y);
            
        }


        // convert to miliseconds and increment
        setTimeout(incrementTimer, dt * 1000);
    }

    // Handle autocashout
    if (isAutoCashout && !isCashedOut && timer >= parseFloat(autoCashoutValue))
    {
        console.log("Autocashout triggered.");
        handleAutoCashout();
    }

    // WIN
    else if (timer <= multiplier && isCashedOut) {
        console.log("YOU WIN: " + wager);
        winText.text = "YOU WIN: $" + wager;
    }

    // LOSE
    else if (!isCashedOut && timer >= multiplier){

        currentMultiplier.style.fill = 'red';
        credits -= wager;
        console.log("Time's up!");
        console.log("You lost: " + wager);
        isGameStarted = false;
        isTimerUp = true;

        // Toggle buttons
        document.querySelector("#cashoutButton").disabled = true;
        document.querySelector("#wagerButton").disabled = false;

        
    }

    // Update displayed multiplier
    currentMultiplier.text = timer.toFixed(2) + "x";


    // Update credits
    creditsText.text = "Credits: $" + credits.toFixed(2);
}

function cashoutButtonClicked() {

    isCashedOut = true;
    wager = (wager * timer).toFixed(2);
    credits += parseFloat(wager);
    // console.log(wager);

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


function makeCircle(xPos=50, yPos=50, radius=5, color){
	let circle = new PIXI.Graphics();
	circle.beginFill(color);
	circle.lineStyle(4, 0xFFFF00, 1);
	circle.drawCircle(xPos, yPos, radius);
	circle.endFill();
	return circle;
}

function makeRectangle(width=50,height=50,color=0xFF0000){
	// https://pixijs.download/release/docs/PIXI.Graphics.html
	let rect = new PIXI.Graphics();
	rect.beginFill(color);
	rect.lineStyle(4, 0xFFFF00, 1);
	rect.drawRect(-width*.5, -height*.5, width, height);
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
    line.lineStyle(5, 0xffffff);
    line.position.set(circleDefaultX, circleDefaultY);
    line.lineTo(circle.x, circle.y);
}