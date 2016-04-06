module.exports = {
    MISSING_PARAMS: 'Must have params object: { config (optional): {}, file: String } || { config(optional): {}, price: Number, numWorkers: Int, category: String }',
    MISSING_FILE: 'Must supply file as argument!',

    INVALID_PRICE: 'Invalid price input!',
    INVALID_WORKERS: 'Invalid number of workers!',
    INVALID_CATEGORY: 'Category is empty!',
    INVALID_SCHEMA: 'Must follow the schema -> Line 1: (String) $xx.xx, Line 2: (Integer) people/person, Line 3: (String) category',

    ERROR_FILE_READ: 'Cannot read file!'
};