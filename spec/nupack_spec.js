var nupack = require('../lib/nupack');

describe("Testing app reads from input", function() {

    it("it should throw an error", function() {
        expect(nupack.readInput).toThrow(new Error("Must supply file as argument!"));
    });

    it("should have Line 1: $1299.99", function() {
        expect(nupack.readInput('./spec/input/in1')[0]).toEqual("$1299.99");
    });

    it("should have Line 2: 3 people", function() {
        expect(nupack.readInput('./spec/input/in1')[1]).toEqual("3 people");
    });

    it("should have Line 3: food", function() {
        expect(nupack.readInput('./spec/input/in1')[2]).toEqual("food");
    });

});

describe("App should produce correct estimate", function() {
    it("should produce: 1591 based on sample input 1", function() {
        nupack.init({
            price: 1299.99,
            numWorkers: 3,
            category: "food"
        });
        expect(nupack.getEstimate()).toEqual(1591.58);
    });

    it("should produce: 6199.81 based on sample input 2", function() {
        nupack.init({
            price: 5432,
            numWorkers: 1,
            category: "drugs"
        });
        expect(nupack.getEstimate()).toEqual(6199.81);
    });

    it("should produce: 13707.63 based on sample input 3", function() {
        nupack.init({
            price: 12456.95,
            numWorkers: 4,
            category: "books"
        });
        expect(nupack.getEstimate()).toEqual(13707.63);
    });

    it("should produce: 13707 with new price Modification Floor", function() {
        nupack.init({
            price: 12456.95,
            numWorkers: 4,
            category: "books"
        });
        nupack.addPriceModification("floor", function(value) {
            return Math.floor(value);
        });
        expect(nupack.getEstimate()).toEqual(13707);
    });

});