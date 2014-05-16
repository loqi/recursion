// this is what you would do if you were one to do things the easy way:
// var parseJSON = JSON.parse;
// but you're not, so you'll write it from scratch:

var parseJSON = function(json) {
  var src = json; // nextLiteral() eats characters off the left side of src until it's exhausted.
  var escCodeTable = { 'b':'\b' , 'f':'\f' , 'n':'\n' , 'r':'\r' , 't':'\t' }; // \uHHHH is hardcoded.
  var isString = function(val) { return typeof val == 'string' || val instanceof String; };
  var reA; // "regex exec array"; Contains the result from the most recent regex .exec() call.
  var eatRex = function(rex) { reA = rex.exec(src); if(reA){src=src.slice(reA[0].length)} return !!reA; };
  var nextLiteral = function() { // [Recursively] eats the leftmost [compound] literal value from `src`.
    token = eatRex(/^\s*(([+-]?\d*\.?\d+([eE][-+]?\d+)?)|\w+|\"|\[|\{)/) && reA[1] || ''; // numeric or keyword or '"' or '[' or '{' or ''

    if (/^[+-\d.]/.test(token)) return +token;  // Numeric literal

    if (/^\w/.test(token)) {                    // Keyword literal
      if (token === 'null') return null;
      if (token === 'true') return true;
      if (token === 'false') return false;
      throw new SyntaxError('Unknown keyword: '+token);
    }

    if (token === '"') {                        // String literal
      var retS = '';
      while (src.length > 0) {
        if (eatRex(/^[^"\\]*/)) retS += reA[0]; // 0 or more chars up to not including '"' or '\' or EOS
        if (src.length < 1) break;              // ran out of string before terminating quote
        if (eatRex(/^\"/)) return retS;         // treminating quote character
        if (!eatRex(/^\\(.)/)) throw new SyntaxError('Empty character escape sequence at end of string -- "... \\"');
        if (reA[1] !== 'u') { retS += escCodeTable[reA[1]] || reA[1] ; continue; }
        if (!eatRex(/^[0-9a-fA-F]{1,4}/)) throw new SyntaxError('Escape sequence \\u requires four trailing hexadecimal digits.');
        retS += String.fromCharCode('0x'+reA[0]);
      }
      throw new SyntaxError('Unterminated string literal "...');
    }

    if (token === '[') {                        // Array quasi-literal
      var retA = [];
      while (src.length > 0) {
        if (eatRex(/^\s*\]/)) return retA;
        retA.push(nextLiteral());
        eatRex(/^\s*,/);                        // commas are optional (Postel's Law)
      }
      throw new SyntaxError('Unterminated array literal [...');
    }

    if (token === '{') {                        // Object quasi-literal
      var retOb = {};
      while (src.length > 0) {
        if (eatRex(/^(\s*\})/)) return retOb;
        var key = nextLiteral();
        if (!isString(key)) throw new SyntaxError('Object key must be a string value -- string: anything');
        if (!eatRex(/^\s*:/)) throw new SyntaxError('Object literal requires colon between key and value -- key:value');
        retOb[key] = nextLiteral();             // A repeated key overwrites its predicessor.
        eatRex(/^\s*,/);                        // commas are optional (Postel's Law)
      }
      throw new SyntaxError('Unterminated object literal {...');
    }
    throw new SyntaxError('Unknown JSON literal: '+token);
  };

  if (/^\s*$/.test(json)) return;     // FIXME: A tokenless string resolves to undefined value. Is this correct behavior?
  builtObj = nextLiteral();           // Recursively eats up `src` which is initialized to `json` parameter.
  if (/\S/.test(src)) throw new SyntaxError('Orphan trailing characters: '+src.trim());
  return builtObj;
};
