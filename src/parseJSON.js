// this is what you would do if you were one to do things the easy way:
// var parseJSON = JSON.parse;
// but you're not, so you'll write it from scratch:

var parseJSON = function(json) {
  var src = json; // nextSrcValue() eats characters off the left side of src until it's exhausted.
  var escCodeTable = { 'b':'\b' , 'f':'\f' , 'n':'\n' , 'r':'\r' , 't':'\t' }; // \uHHHH is hardcoded.
  var isString = function(val) { return typeof val == 'string' || val instanceof String; };
  var nextSrcValue = function() { // (Recursively) parses the leftmost (compound) literal from `src`.
    src = src.trimLeft();
    var execA = /^(([+-]?\d*\.?\d+([eE][-+]?\d+)?)|\w+|\"|\[|\{|)/.exec(src) // numeric or keyword or '"' or '[' or '{'
    var token = execA && execA[1] || '';
    src = src.slice(token.length);

    // Numeric literal
    if (/^[\d+-.]/.test(token)) return +token;

    // Keyword literal
    if (/^\w/.test(token)) {
      if (token === 'null') return null;
      if (token === 'true') return true;
      if (token === 'false') return false;
      throw new SyntaxError('Unknown keyword: '+token);
    }

    var ret; // Return value built by string, array or object quasi-literal

    // String literal
    if (token === '"') {
      ret = '';
      while (src.length > 0) {
        execA = /^([^"\\]*)/.exec(src)
        if (execA) { ret += execA[1];  src = src.slice(execA[1].length); } // 0 or more chars up to not including '"' or '\' or EOS
        if (src.length < 1) break;                                         // ran out of string before terminating quote
        if (/^\"/.test(src)) { src = src.slice(1) ; return ret; }          // treminating quote character
        execA = /^(\\(.))/.exec(src);
        if (!execA) throw new SyntaxError('Empty character escape sequence at end of string -- "... \\"');
        src = src.slice(2);
        if (execA[2] !== 'u') { ret += escCodeTable[execA[2]] || execA[2]  ; continue; }
        execA = /^([0-9a-fA-F]{1,4})/.exec(src);
        if (!execA) throw new SyntaxError('Character escape \\u requires four trailing hexadecimal digits.');
        ret += String.fromCharCode('0x'+execA[1]);
        src = src.slice(execA[1].length);
      }
      throw new SyntaxError('Unterminated string literal "...');
    }

    // Array literal
    if (token === '[') {
      ret = [];
      while (src.length > 0) {
        execA = /^(\s*\])/.exec(src);
        if (execA) { src = src.slice(execA[1].length) ; return ret; }
        ret.push(nextSrcValue());
        execA = /^(\s*,)/.exec(src);
        if (execA) src = src.slice(execA[1].length);    // Postel's Law: Commas are optional.
      }
      throw new SyntaxError('Unterminated array literal [...');
    }

    // Object literal
    if (token === '{') {
      ret = {};
      while (src.length > 0) {
        execA = /^(\s*\})/.exec(src);
        if (execA) { src = src.slice(execA[1].length) ; return ret; }
        var key = nextSrcValue();
        if (!isString(key)) throw new SyntaxError('Object key must be a string value -- string: anything');
        execA = /^(\s*:)/.exec(src);
        if (!execA) throw new SyntaxError('Object literal requires colon between key and value -- key:value');
        src = src.slice(execA[1].length);
        ret[key] = nextSrcValue();                      // A repeated key overwrites its predicessor.
        execA = /^(\s*,)/.exec(src);
        if (execA) src = src.slice(execA[1].length);    // Postel's Law: Commas are optional.
      }
      throw new SyntaxError('Unterminated object literal {...');
    }

    // Anything else
    throw new SyntaxError('Unknown JSON literal: '+token);
  };

  if (/^\s*$/.test(json)) return; // FIXME: All whitespace resolves to undefined. Is this right?
  builtObj = nextSrcValue();
  if (src.trimLeft().length > 0) throw new SyntaxError('Orphan trailing characters: '+src.trimLeft());
  return builtObj;
};
