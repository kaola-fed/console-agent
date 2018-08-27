const is = require('is');

const toJSON = (collection) => {
    const json = {};

    for (let [name, value] of Object.entries(collection)) {
        if (value.toJSON) {
            json[name] = value.toJSON()
        } else if (is.object(value)) {
            json[name] = toJSON(value);
        } else {
            json[name] = value;
        }
    }

    return json;
}

module.exports = toJSON;