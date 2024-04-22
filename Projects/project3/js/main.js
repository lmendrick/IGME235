"use strict";

window.onload = (e) => {document.querySelector("#wagerButton").onclick = wagerButtonClicked, 
document.querySelector("#cashoutButton").onclick = cashoutButtonClicked};


let gameWindow = document.querySelector("#gameWindow");
console.log(gameWindow);

const app = new PIXI.Application({
    width: 800,
    height: 800
});
document.body.appendChild(app.view);

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
let gameScene,ship,scoreLabel,lifeLabel,shootSound,hitSound,fireballSound;
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
    currentMultiplier.x = 300;
    currentMultiplier.y = sceneHeight - 100;
    // currentMultiplier.interactive = true;
    // currentMultiplier.buttonMode = true;
    // currentMultiplier.on("pointerup", startGame);     // startGame is a function reference
    // currentMultiplier.on("pointerover", e => e.target.alpha = 0.7);       // concise arrow function with no brackets
    // currentMultiplier.on("pointerout", e => e.currentTarget.alpha = 1.0);
    startScene.addChild(currentMultiplier);
    
}

// function startGame() {

    

    

//     let inputValue = input.value.trim();
//     wager = parseFloat(inputValue);


    
// }

function wagerButtonClicked(){

    timer = 1;
    isTimerUp = false;
    isCashedOut = false;

    // get wager input object
    let wagerInput = document.querySelector("#wager");

    // set wager equal to input value
    wager = wagerInput.value;

    console.log(wager);

    multiplier = generateMultiplier();

    console.log(multiplier);



    // Start the timer
    incrementTimer();

    isGameStarted = true;

    // gameLoop();

}



// Generate the game multiplier it will reach based on uniform distribution
function generateMultiplier() {


    // // First decide if the game will be a "winner"
    // let winRandom = Math.random();

    // // LOSE
    // // 5% chance that the multiplyer is under 1x
    // if (winRandom <= 0.05) {
        
    //     let loseMultiplyer = Math.random();
    //     return loseMultiplyer;
    // }

    // WIN
    // Generate a random float between 0 and 1
    const randomNumber = Math.random();

    // Calculate multiplier
    // Roughly 1 / Uniform distributon of (0,1)
    const winnerMultiplier = 1 / (1 - randomNumber);

    return winnerMultiplier;

}

// increment the timer and update the displayed multiplier
function incrementTimer() {

        // Calculate "delta time"
        let dt = 1 / app.ticker.FPS;

    timer += dt;

    if (timer < multiplier && !isCashedOut) {
        console.log("Timer:", timer);
        console.log("Multiplier:", multiplier);

        // convert to miliseconds and increment
        setTimeout(incrementTimer, dt * 1000); 
    } 
    else if (timer <= multiplier && isCashedOut) {
        console.log("YOU WIN: " + wager);
    }
    else {
        console.log("Time's up!");
        
        isTimerUp = true;
        
    }

    // Update displayed multiplier
    currentMultiplier.text = timer.toFixed(2) + "x";


    // Lose money
    if (isTimerUp && !isCashedOut) {
        console.log("You lost: " + wager);
        isGameStarted = false;
    }

    // // Win money
    // if (!isTimerUp && isCashedOut) {
    //     wager = multiplier * wager;
    //     isGameStarted = false;
    // }
}

function cashoutButtonClicked() {

    isCashedOut = true;
    wager = (wager * timer).toFixed(2);
    // console.log(wager);
}
