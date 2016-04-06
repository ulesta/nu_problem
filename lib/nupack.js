var fs = require('fs');

function NuPack(price, numWorkers, category) {
    this.price = price;
    this.numWorkers = numWorkers;
    this.category = category;
}

/**
 * Calculate the estimate for a given order
 */
NuPack.prototype.calculate = function() {

};

/**
 * Takes a file as input
 * @param file
 * @returns {Array}
 */
NuPack.prototype.readInput = function(file) {
    if (!file) {
        throw new Error("Must supply file as argument!");
    }
    var data = fs.readFileSync(file);
    var inputArr = data.toString().split("\n");
    return inputArr;
};

module.exports = new NuPack();