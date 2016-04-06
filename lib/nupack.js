var fs = require('fs');

function NuPack() {

}

NuPack.prototype.readInput = function(file) {
    if (!file) {
        throw new Error("Must supply file as argument!");
    }
    var data = fs.readFileSync(file);
    var inputArr = data.toString().split("\n");
    return inputArr;
};

module.exports = new NuPack();