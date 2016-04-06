var Decorator = require('../lib/decorator');

describe("Testing Decorator functionality", function() {
    var initialVal = 100,
        myDecorator = new Decorator();

    it("it should return the original value if there are no Decorators", function() {
        var output = myDecorator.decorate(initialVal);

        expect(output).toEqual(initialVal);
    });

    it("it should add 13% tax", function() {
        myDecorator.addDecoration('tax', function(value) {
            return value * 1.13;
        });
        var output = myDecorator.decorate(initialVal);

        expect(output).toEqual(initialVal * 1.13);
    });

    it("it should calculate final price based on markups", function() {
        var myDecoratorPrice = new Decorator(),
            myDecoratorMarkups = new Decorator();
            initialVal = 1299.99;

        var FLAT_MARKUP = 0.05,
            NUM_WORKERS = 3,
            WORKER_MARKUP = 0.012,
            FOOD_MARKUP = 0.13;

        myDecoratorMarkups.addDecoration('workerMarkup', (function() {
            var markup = 0;
            for (var i = 0; i < NUM_WORKERS; i++) {
                markup += WORKER_MARKUP;
            }

            return function(value) {
                return value + markup;
            }
        })());

        myDecoratorMarkups.addDecoration('foodMarkup', function(value) {
            return value + FOOD_MARKUP;
        });

        myDecoratorPrice.addDecoration('flatMarkup', function(value) {
            return value * (1+FLAT_MARKUP);
        });

        myDecoratorPrice.addDecoration('additionalMarkups', function(value) {
            return value * myDecoratorMarkups.decorate(1)
        });

        var output = Math.round(myDecoratorPrice.decorate(initialVal) * 100) / 100;

        expect(output).toEqual(1591.58);
    });

});