const is = require('is');

const toJSON = (collection) => {
    const json = {};

    for (let [name, value] of Object.entries(collection)) {
        if (is.primitive(value)) {
            json[name] = value;
        } else if (is.object(value)) {
            if (value.toJSON) {
                json[name] = value.toJSON();
            } else {
                json[name] = toJSON(value);
            }
        }
    }

    return json;
}

module.exports = toJSON;