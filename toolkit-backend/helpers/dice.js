//file for assorted functions simulating the rolling of dice. Very usefull in a DnD toolkit


/**
 * Simulates dice being rolled
 * @param {Int} size number of sides on the die being rolled
 * @param {Int} count number of dice being rolled. Defaults to one
 * @returns Total of dice rolled
 */
function rollDice(size, count = 1){
    let total = 0;
    for(let i=0;i<count;i++)
        total += Math.ceil(Math.random()*size);
    
    return total;
}

module.exports = { rollDice }