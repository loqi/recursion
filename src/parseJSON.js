// this is what you would do if you were one to do things the easy way:
// var parseJSON = JSON.parse;
// but you're not, so you'll write it from scratch:

var parseJSON = function(json) {
  var src = json; // nextSrcValue() eats characters off the left side of src until it's exhausted.
  var escCodeTable = { 'b':'\b' , 'f':'\f' , 'n':'\n' , 'r':'\r' , 't':'\t' }; // \uHHHH is hardcoded.
  var isString = function(val) { return typeof val == 'string' || val instanceof String; };
  var reA; // "regex exec array"; Contains the result from the most recent regex .exec() call.
  var eatRex = function(rex) { reA = rex.exec(src); if(reA){src=src.slice(reA[0].length)} return !!reA; };
  var nextSrcValue = function() { // [Recursively] eats the leftmost [compound] literal from `src`.
    src = src.trimLeft();
    token = eatRex(/^([+-]?\d*\.?\d+([eE][-+]?\d+)?)|\w+|\"|\[|\{/) && reA[0] || ''; // numeric or keyword or '"' or '[' or '{' or ''
    // Numeric literal
    if (/^[\d+-.]/.test(token)) return +token;
    // Keyword literal
    if (/^\w/.test(token)) {
      if (token === 'null') return null;
      if (token === 'true') return true;
      if (token === 'false') return false;
      throw new SyntaxError('Unknown keyword: '+token);
    }
    // String literal
    if (token === '"') {
      var str = '';
      while (src.length > 0) {
        if (eatRex(/^[^"\\]*/)) str += reA[0]; // 0 or more chars up to not including '"' or '\' or EOS
        if (src.length < 1) break;                                         // ran out of string before terminating quote
        if (eatRex(/^\"/)) return str;                                     // treminating quote character
        if (!eatRex(/^\\(.)/)) throw new SyntaxError('Empty character escape sequence at end of string -- "... \\"');
        if (reA[1] !== 'u') { str += escCodeTable[reA[1]] || reA[1] ; continue; }
        if (!eatRex(/^[0-9a-fA-F]{1,4}/)) throw new SyntaxError('Character escape \\u requires four trailing hexadecimal digits.');
        str += String.fromCharCode('0x'+reA[0]);
      }
      throw new SyntaxError('Unterminated string literal "...');
    }
    // Array literal
    if (token === '[') {
      var arr = [];
      while (src.length > 0) {
        if (eatRex(/^\s*\]/)) return arr;
        arr.push(nextSrcValue());
        eatRex(/^\s*,/);              // Commas are optional. Postel's law.
      }
      throw new SyntaxError('Unterminated array literal [...');
    }
    // Object literal
    if (token === '{') {
      var obj = {};
      while (src.length > 0) {
        if (eatRex(/^(\s*\})/)) return obj;
        var key = nextSrcValue();
        if (!isString(key)) throw new SyntaxError('Object key must be a string value -- string: anything');
        if (!eatRex(/^\s*:/)) throw new SyntaxError('Object literal requires colon between key and value -- key:value');
        obj[key] = nextSrcValue();    // A repeated key overwrites its predicessor.
        eatRex(/^\s*,/);              // Commas are optional. Postel's Law.
      }
      throw new SyntaxError('Unterminated object literal {...');
    }
    // Anything else
    throw new SyntaxError('Unknown JSON literal: '+token);
  };

  if (/^\s*$/.test(json)) return; // FIXME: A tokenless string resolves to undefined value. Is this correct behavior?
  builtObj = nextSrcValue();
  if (src.trimLeft().length > 0) throw new SyntaxError('Orphan trailing characters: '+src.trimLeft());
  return builtObj;
};
