const is = require('is');

module.exports = function flat(obj, scope = []) {
    let returnValue = {};
    const prefix = scope.length > 0 ? (scope.join('_') + '_'): '';
    for (let [name, value] of Object.entries(obj)) {
        if (is.object(value)) {
            Object.assign(
                returnValue, flat(value, [
                    ...scope,
                    name
                ])
            );
        } else {
            Object.assign(
                returnValue, {
                    [prefix + name]: value
                }
            );
        }
    }
    return returnValue;
};
