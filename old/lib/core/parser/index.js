const MetrixParser = require('./metrix-parser');
const ErrorParser = require('./error-parser');
const parserMap = new Map();

parserMap.set('built-in', MetrixParser);
parserMap.set('application', MetrixParser);
parserMap.set('error', ErrorParser);

exports.parserMap = parserMap;