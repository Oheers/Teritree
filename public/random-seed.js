function seededRandom(seed) {
    let m = 2147483647; // Large prime number
    let a = 16807;      // The Multiplier
    let c = 0;          // The Increment
    let state = seed % m;

    return function() {
        state = (a * state + c) % m;
        return state / m;
    };
}

const seed = 26;
const randomGenerator = seededRandom(seed);

function getRandomNumber(min, max) {
    return Math.floor(randomGenerator() * (max - min + 1)) + min;
}