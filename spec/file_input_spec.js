var nupack = require('../index');

describe("Testing app reads from input", function() {

    it("it should throw an error", function() {
        expect(nupack.readInput).toThrow(new Error("Must supply file as argument!"));
    });

    it("should have Line 1: $1299.99", function() {
        expect(nupack.readInput('./spec/input/in1')[0]).toEqual("$1299.99");
    });

    it("should have Line 2: 3 people", function() {
        expect(nupack.readInput('./spec/input/in1')[0]).toEqual("$1299.99");
    });

    it("should have Line 3: food", function() {
        expect(nupack.readInput('./spec/input/in1')[0]).toEqual("$1299.99");
    });

});