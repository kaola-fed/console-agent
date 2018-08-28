module.exports = function(json, valueHandle) {
    let output = {};

    for (let [name, value] of Object.entries(json)) {
        let list = [];
        for (let [id, meta] of Object.entries(value)) {
            const newObj = Object.assign({
                id: id
            }, valueHandle(meta));
            list.push(newObj);
        }
        Object.assign(output, {
            [name]: list
        });
    }
    return output;
};