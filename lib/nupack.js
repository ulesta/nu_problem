var fs = require('fs'),
    config = require('../config.json'),
    Decorator = require('./decorator');

var LINES_SCHEMA = 3;

function NuPack() {
}
// Public Functions

/**
 * Initializes NuPack
 * @param params: {
 *      config(optional): (String) configuration file,
 *      file: (String) file path,
 *      price: (Number) starting price
 *      numWorkers: (Integer) number of workers working on the order,
 *      category: (String) category of materials in the order
 * }
 */
NuPack.prototype.init = function (params) {
    // File input
    if (!params) {
        throw new Error("Must have params object: { config (optional): {}, file: String } || { config(optional): {}, price: Number, numWorkers: Int, category: String } ");
    }
    // Set configuration file
    this.config = params.config ? params.config : config;

    if (params.file) {
        this.readInput(params.file);
    } else if (params.price && params.numWorkers && params.category) {
        _validateAndSet.call(this, params.price, params.numWorkers, params.category);
    } else {
        throw new Error("Could not initialized due to bad parameters!");
    }

    // Decorators
    this.markupDec = new Decorator();
    this.priceDec = new Decorator();

    _initMarkups.apply(this);
};

/**
 * Calculate the estimate for a given order
 * @return Number: final estimate for given price
 */
NuPack.prototype.getEstimate = function () {
    return Math.round(this.priceDec.decorate(this.price) * 100) / 100;
};

/**
 * Takes a file as input
 * @param file
 * @returns {Array}
 */
NuPack.prototype.readInput = function (file) {
    var self = this;

    if (!file) {
        throw new Error("Must supply file as argument!");
    }
    var data = fs.readFileSync(file);
    if (!data) {
        throw new Error("Cannot read file!");
    }

    var inputArr = data.toString().split("\n");

    if (inputArr.length < LINES_SCHEMA) {
        throw new Error("Must follow the schema -> Line 1: (String) $xx.xx, Line 2: (Integer) people/person, Line 3: (String) category");
    }

    var price = inputArr[0];
    var numWorkers = inputArr[1];
    var category = inputArr[2];

    _validateAndSet(price, numWorkers, category);

    return inputArr;
};

/**
 * Adds price alteration on top of adding Base Flat markup + Additional markups
 * @param name: name of the function
 * @param fn: of the form: fn(value) { return newVal }
 */
NuPack.prototype.addPriceModification = function (name, fn) {
    this.priceDec.addDecoration(name, fn);
};

/**
 * Adds price markup as part of Additional Markups
 * @param name: name of the function
 * @param fn: of the form: fn(value) { return newVal }
 */
NuPack.prototype.addMarkup = function (name, fn) {
    this.markupDec.addDecoration(name, fn);
};

// Private functions

/**
 * Initialize Markups
 */
function _initMarkups() {
    var self = this;
    _initAdditionalMarkups.apply(self);
    _initTotalMarkups.apply(self);
}

/**
 * Initializes Total Markups to price, where Total = StartingPrice * Base * Additional Markups
 * @private
 */
function _initTotalMarkups() {
    var self = this;

    self.priceDec.addDecoration('base', function (value) {
        return value * (1 + config.baseMarkup);
    });

    self.priceDec.addDecoration('additional', function (value) {
        return value * self.markupDec.decorate(1);
    });
}

/**
 * Initializes all the Additional Markups including Workers and Category
 * @private
 */
function _initAdditionalMarkups() {
    var self = this;

    self.markupDec.addDecoration('worker', (function () {
        var markup = 0;
        for (var i = 0; i < self.numWorkers; i++) {
            markup += config.workerMarkup;
        }

        return function (value) {
            return value + markup;
        }
    })());

    self.markupDec.addDecoration('category', function (value) {
        var markup = 0,
            category = (config.materialMap[self.category]) ? config.materialMap[self.category] : self.category;

        if (typeof config.materialMarkup[category] != 'undefined') {
            markup = config.materialMarkup[category];
        }

        return value + markup;
    });
}

function _validateAndSet(price, numWorkers, category) {
    var priceParsed = price;
    if (typeof priceParsed === 'string') {
        priceParsed = parseFloat(price.replace(/[^0-9\.]+/g,""));
    }
    if (isNaN(priceParsed)) {
        throw new Error('Invalid price input!');
    }

    var workersParsed = numWorkers;
    if (typeof workersParsed === 'string') {
        workersParsed = parseInt(numWorkers.split(" ")[0]);
    }
    if (isNaN(workersParsed)) {
        throw new Error('Invalid number of workers!');
    }

    if (category.length <= 0) {
        throw new Error('Category is empty!');
    }

    this.price = priceParsed;
    this.numWorkers = workersParsed;
    this.category = category;
}

module.exports = new NuPack();