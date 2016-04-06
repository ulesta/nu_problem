var nupack = require('../lib/nupack'),
    in1 = './spec/input/in1',
    in2 = './spec/input/in2',
    in3 = './spec/input/in3',
    invalid1 = './spec/input/invalid1',
    invalid2 = './spec/input/invalid2',
    invalid3 = './spec/input/invalid3';


describe('Testing app reads from input', function () {
    it('it should throw an error', function () {
        expect(nupack.readInput).toThrow(new Error('Must supply file as argument!'));
    });

    it('should have Line 1: $1299.99', function () {
        expect(nupack.readInput(in1)[0]).toEqual('$1299.99');
    });

    it('should have Line 2: 3 people', function () {
        expect(nupack.readInput(in1)[1]).toEqual('3 people');
    });

    it('should have Line 3: food', function () {
        expect(nupack.readInput(in1)[2]).toEqual('food');
    });
});

describe('App should produce correct estimate', function () {
    it('should produce: 1591 based on sample input 1', function () {
        nupack.init({
            price: 1299.99,
            numWorkers: 3,
            category: 'food'
        });
        expect(nupack.getEstimate()).toEqual('$1591.58');
    });

    it('should produce: 6199.81 based on sample input 2', function () {
        nupack.init({
            price: 5432,
            numWorkers: 1,
            category: 'drugs'
        });
        expect(nupack.getEstimate()).toEqual('$6199.81');
    });

    it('should produce: 13707.63 based on sample input 3', function () {
        nupack.init({
            price: 12456.95,
            numWorkers: 4,
            category: 'books'
        });
        expect(nupack.getEstimate()).toEqual('$13707.63');
    });

    it('should produce: 13707 with new price Modification Floor', function () {
        nupack.init({
            price: 12456.95,
            numWorkers: 4,
            category: 'books'
        });
        nupack.addPriceModification('floor', function (value) {
            return Math.floor(value);
        });
        expect(nupack.getEstimate()).toEqual('$13707');
    });
});

describe('App will read from file and produce correct output', function () {
    it('should produce: 1591 based on sample input 1', function () {
        nupack.init({ file: in1 });

        expect(nupack.getEstimate()).toEqual('$1591.58');
    });

    it('should produce: 6199.81 based on sample input 2', function () {
        nupack.init({ file: in2 });
        expect(nupack.getEstimate()).toEqual('$6199.81');
    });

    it('should produce: 13707.63 based on sample input 3', function () {
        nupack.init({ file: in3 });
        expect(nupack.getEstimate()).toEqual('$13707.63');
    });
});

describe('App will throw Errors whenever appropriate', function () {
    it('should throw Error: missing params', function () {
        expect(function() {
            return nupack.init({});
        }).toThrow(new Error('Must have params object: { config (optional): {}, file: String } || { config(optional): {}, price: Number, numWorkers: Int, category: String }'));
    });

    it('should throw Error: invalid price', function () {
        expect(function() {
            return nupack.init({
                file: invalid1
            });
        }).toThrow(new Error('Invalid price input!'));
    });

    it('should throw Error: invalid num of workers', function () {
        expect(function() {
            return nupack.init({
                file: invalid2
            });
        }).toThrow(new Error('Invalid number of workers!'));
    });

    it('should throw Error: invalid category', function () {
        expect(function() {
            return nupack.init({
                file: invalid3
            });
        }).toThrow(new Error('Category is empty!'));
    });
});

describe('App throws Errors whenever supplied with negative inputs', function () {
    it('should throw Error: invalid price input', function () {
        expect(function() {
            return nupack.init({
                price: -12456.95,
                numWorkers: 4,
                category: 'books'
            });
        }).toThrow(new Error('Invalid price input!'));
    });

    it('should throw Error: invalid num of workers', function () {
        expect(function() {
            return nupack.init({
                price: 12456.95,
                numWorkers: -4,
                category: 'books'
            });
        }).toThrow(new Error('Invalid number of workers!'));
    });
});

describe('App should change output based on configurations', function () {
    it('should output the same amount', function () {
        nupack.init({
            config: {
                "baseMarkup": 0.0,
                "workerMarkup": 0.0,
                "materialMap": {
                    "drugs": "pharmaceuticals",
                    "chicken": "food"
                },
                "materialMarkup": {
                    "pharmaceuticals": 0.075,
                    "food": 0.13,
                    "electronics": 0.02
                }
            },
            price: 12456.95,
            numWorkers: 4,
            category: 'books'
        });

        expect(nupack.getEstimate()).toBe('$12456.95');
    });

    it('should output as book now has a markup or 10%: $120', function () {
        nupack.init({
            config: {
                "baseMarkup": 0.0,
                "workerMarkup": 0.01,
                "materialMap": {
                    "drugs": "pharmaceuticals",
                    "chicken": "food"
                },
                "materialMarkup": {
                    "pharmaceuticals": 0.075,
                    "food": 0.13,
                    "electronics": 0.02,
                    "books": 0.1
                }
            },
            price: 100,
            numWorkers: 10,
            category: 'books'
        });

        expect(nupack.getEstimate()).toBe('$120');
    });

    it('should gracefully fill the gaps with default values if not specified in config obj', function () {
        nupack.init({
            config: {
                "workerMarkup": 0.01
            },
            price: 100,
            numWorkers: 10,
            category: 'books'
        });

        expect(nupack.getEstimate()).toBe('$115.5');
    });
});