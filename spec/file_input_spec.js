var nupack = require('../index');

describe("Testing app reads from input", function() {

    it("it should throw an error", function() {
        expect(nupack.readInput).toThrow(new Error("Must supply file as argument!"));
    });

    it("should have a first line: $1299.99", function() {
        expect(nupack.readInput('./spec/input/in1')[0]).toEqual("$1299.99");
    });

});