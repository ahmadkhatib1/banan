const cryptoRandomString = require('randomstring');

CODES_TYPES = {
    ALPHA_NUMERIC: 'alphanumeric',
    NUMERIC: 'numeric'
}

class RandomCodesGenerator {
    static generate(
    length = 10, 
    codeType = CODES_TYPES.ALPHA_NUMERIC
    ) 
    {
        return cryptoRandomString.generate({length, type: codeType});
    }
    
}

module.exports =  RandomCodesGenerator;
  