const is = require('is');

module.exports = function flat(obj, scope = []) {
    let returnValue = {};
    const prefix = scope.length > 0 ? (scope.join('_') + '_'): '';

    for (let [name, value] of Object.entries(obj)) {
        if (is.primitive(value)) {
            Object.assign(
                returnValue, {
                    [prefix + name]: value
                }
            );
        } else if (value && value.constructor === Object) {
            Object.assign(
                returnValue, flat(value, [
                    ...scope, name
                ])
            );
        }
    }

    return returnValue;
};
