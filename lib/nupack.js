var fs = require('fs'),
    errors = require('./errors'),
    config = require('../config.json'),
    Decorator = require('./decorator');

var LINES_SCHEMA = 3,
    BASE_LABEL = 'base',
    ADDITIONAL_LABEL = 'additional',
    WORKER_LABEL = 'worker',
    CATEGORY_LABEL = 'category',
    TYPE_STRING = 'string',
    TYPE_UNDEFINED = 'undefined';

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
        throw new Error(errors.MISSING_PARAMS);
    }
    // Set configuration file
    this.config = params.config ? params.config : config;

    if (params.file) {
        this.readInput(params.file);
    } else if (params.price && params.numWorkers && params.category) {
        _validateAndSet.call(this, params.price, params.numWorkers, params.category);
    } else {
        throw new Error(errors.MISSING_PARAMS);
    }

    // Decorators
    this.markupDec = new Decorator();
    this.priceDec = new Decorator();

    _initMarkups.apply(this);
};

/**
 * Calculate the estimate for a given order
 * @return String: final estimate for given price
 */
NuPack.prototype.getEstimate = function () {
    return "$" + Math.round(this.priceDec.decorate(this.price) * 100) / 100;
};

/**
 * Takes a file as input
 * @param file
 * @returns {Array}
 */
NuPack.prototype.readInput = function (file) {
    var self = this;

    if (!file) {
        throw new Error(errors.MISSING_FILE);
    }
    var data = fs.readFileSync(file);
    if (!data) {
        throw new Error(errors.ERROR_FILE_READ);
    }

    var inputArr = data.toString().split("\n");

    if (inputArr.length < LINES_SCHEMA) {
        throw new Error(errors.INVALID_SCHEMA);
    }

    var price = inputArr[0];
    var numWorkers = inputArr[1];
    var category = inputArr[2];

    _validateAndSet.call(self, price, numWorkers, category);

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

    self.priceDec.addDecoration(BASE_LABEL, function (value) {
        return value * (1 + config.baseMarkup);
    });

    self.priceDec.addDecoration(ADDITIONAL_LABEL, function (value) {
        return value * self.markupDec.decorate(1);
    });
}

/**
 * Initializes all the Additional Markups including Workers and Category
 * @private
 */
function _initAdditionalMarkups() {
    var self = this;

    self.markupDec.addDecoration(WORKER_LABEL, (function () {
        var markup = 0;
        for (var i = 0; i < self.numWorkers; i++) {
            markup += config.workerMarkup;
        }

        return function (value) {
            return value + markup;
        }
    })());

    self.markupDec.addDecoration(CATEGORY_LABEL, function (value) {
        var markup = 0,
            category = (config.materialMap[self.category]) ? config.materialMap[self.category] : self.category;

        if (typeof config.materialMarkup[category] != TYPE_UNDEFINED) {
            markup = config.materialMarkup[category];
        }

        return value + markup;
    });
}

function _validateAndSet(price, numWorkers, category) {
    var priceParsed = price;
    if (typeof priceParsed === TYPE_STRING) {
        priceParsed = parseFloat(price.replace(/[^0-9\.]+/g,""));
    }
    if (isNaN(priceParsed) || priceParsed <= 0) {
        throw new Error(errors.INVALID_PRICE);
    }

    var workersParsed = numWorkers;
    if (typeof workersParsed === TYPE_STRING) {
        workersParsed = parseInt(numWorkers.split(" ")[0]);
    }
    if (isNaN(workersParsed) || workersParsed <= 0) {
        throw new Error(errors.INVALID_WORKERS);
    }

    if (category.length <= 0) {
        throw new Error(errors.INVALID_CATEGORY);
    }

    this.price = priceParsed;
    this.numWorkers = workersParsed;
    this.category = category;
}

module.exports = new NuPack();