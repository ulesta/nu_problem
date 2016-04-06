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
    var self = this;
    // File input
    if (!params) {
        throw new Error(errors.MISSING_PARAMS);
    }
    // Set configuration file
    self.config = JSON.parse(JSON.stringify(config));
    if (params.config) {
        var _config = params.config;
        Object.keys(_config).forEach(function(key) {
            self.config[key] = _config[key];
        })
    }

    if (params.file) {
        self.readInput(params.file);
    } else if (params.price && params.numWorkers && params.category) {
        _validateAndSet.call(self, params.price, params.numWorkers, params.category);
    } else {
        throw new Error(errors.MISSING_PARAMS);
    }

    // Decorators
    self.markupDec = new Decorator();
    self.priceDec = new Decorator();

    _initMarkups.apply(self);
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
 * @param file: (String) input filePath
 * @returns {Array} of lines in file
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
 * @param name: (String) name of the function
 * @param fn: (Function) of the form: fn(value) { return newVal }
 */
NuPack.prototype.addPriceModification = function (name, fn) {
    this.priceDec.addDecoration(name, fn);
};

/**
 * Adds price markup as part of Additional Markups
 * @param name: (String) name of the function
 * @param fn: (Function) of the form: fn(value) { return newVal }
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
        return value * (1 + self.config.baseMarkup);
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
            markup += self.config.workerMarkup;
        }

        return function (value) {
            return value + markup;
        }
    })());

    self.markupDec.addDecoration(CATEGORY_LABEL, function (value) {
        var markup = 0,
            category = (self.config.materialMap[self.category]) ? self.config.materialMap[self.category] : self.category;

        if (typeof self.config.materialMarkup[category] != TYPE_UNDEFINED) {
            markup = self.config.materialMarkup[category];
        }

        return value + markup;
    });
}

/**
 * Validates all required input data and sets them as NuPack's members
 * @param price: (String || Number)
 * @param numWorkers: (String || Number)
 * @param category: (String)
 * @private
 */
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