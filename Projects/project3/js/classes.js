class Multiplier {

    constructor() {
        // Generate a random number between 0 and 1 (excluding 1)
        const randomNumber = Math.random();

        // Calculate the maximum multiplier based on the winning probability
        let maxMultiplier = Math.floor(0.99 / randomNumber);

        // Ensure the maximum multiplier does not exceed 1000
        maxMultiplier = Math.min(maxMultiplier, 1000);

        // Generate a random number between 1 and the maximum multiplier
        const gameMultiplier = Math.floor(Math.random() * maxMultiplier) + 1;

        return gameMultiplier;
    }



}

