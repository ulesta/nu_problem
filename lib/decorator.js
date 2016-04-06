/**
 * Decorator allows for the decoration of an initial value
 * @constructor
 * @params decorations: (Object) which has predefined decoration functions
 */
function Decorator(decorations) {
    this.listDecorations = [];
    this.decorations = (decorations) ? decorations : {};
}

/**
 * This will decorate an initial value by passing it through an Array of decorators
 * @param initialValue: initial Value of data to be decorated
 * @returns {*}: decorated data
 */
Decorator.prototype.decorate = function (initialValue) {
    var list = this.listDecorations;

    for (var i = 0; i < list.length; i++) {
        var decorate = this.decorations[list[i]];
        initialValue = decorate(initialValue);
    }

    return initialValue;
};

/**
 * This adds a Decoration to the Decoration lookup table and into the list
 * @param name: (String) name of the Decoration function
 * @param fn (optional): (Function) fn of Decoration function which takes in a param of 'value' and returns a new value
 */
Decorator.prototype.addDecoration = function(name, fn) {
    if (!this.decorations[name] && !fn) {
        throw new Error('Cannot add non-existent Decoration, please supply a Decoration fn as 2nd param');
    } else if (this.decorations[name] && !fn) {
        this.listDecorations.push(name);
    } else {
        this.decorations[name] = fn;
        this.listDecorations.push(name);
    }
};

/**
 * Pops the last added Decoration from Decorator List
 * @returns String
 */
Decorator.prototype.popDecoration = function() {
    return this.listDecorations.pop();
};

/**
 * Sets a named fn as a Decoration
 * @param name: (String) name of Decoration function
 * @param fn: (Function) fn of Decoration function which takes in a param of 'value' and returns a new value
 */
Decorator.prototype.setDecoration = function(name, fn) {
    this.decorations[name] = fn;
};

module.exports = Decorator;