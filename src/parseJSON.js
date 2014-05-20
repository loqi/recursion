var parseJSON = function(json) {
  var src = json; // nextLiteral() eats characters off the left side of src until it's exhausted.
  var escCodeTable = { 'b':'\b' , 'f':'\f' , 'n':'\n' , 'r':'\r' , 't':'\t' }; // \uHHHH is hardcoded.
  var isString = function(val) { return typeof val == 'string' || val instanceof String; };
  var reA; // "regex exec array"; Contains the result from the most recent regex .exec() call.
  var eatSrc = function(rex) { reA = rex.exec(src); if(reA){src=src.slice(reA[0].length)} return !!reA; };
  var nextLiteral = function() { // [Recursively] eats the leftmost [compound] literal value from `src`.
    token = eatSrc(/^\s*(([+-]?\d*\.?\d+([eE][-+]?\d+)?)|\w+|\"|\[|\{)/) && reA[1] || ''; // numeric or keyword or '"' or '[' or '{' or ''
    if (/^[+-\d.]/.test(token)) return +token;  //############ NUMERIC LITERAL
    if (/^\w/.test(token)) {                    //############ KEYWORD LITERAL
      if (token === 'null') return null;
      if (token === 'true') return true;
      if (token === 'false') return false;
      throw new SyntaxError('Unknown keyword: '+token);
    }
    if (token === '"') {                        //############ STRING LITERAL
      var retS = '';
      while (src.length > 0) {
        if (eatSrc(/^[^"\\]*/)) retS += reA[0];
        if (src.length < 1) break;
        if (eatSrc(/^\"/)) return retS; // After passing this line, the next char must be '\'
        if (!eatSrc(/^\\(.)/)) throw new SyntaxError('Empty character escape sequence at end of string -- "... \\"');
        if (reA[1] !== 'u') { retS += escCodeTable[reA[1]] || reA[1] ; continue; }
        if (!eatSrc(/^[0-9a-fA-F]{1,4}/)) throw new SyntaxError('Escape sequence \\u requires four trailing hexadecimal digits.');
        retS += String.fromCharCode('0x'+reA[0]);
      }
      throw new SyntaxError('Unterminated string literal "...');
    }
    if (token === '[') {                        //########## ARRAY LITERAL
      var retA = [];
      while (eatSrc(/^\s*/) , src.length > 0) {
        if (eatSrc(/^\]/)) return retA;
        retA.push(nextLiteral());
        eatSrc(/^\s*,/); // [1 2]ok; [1,2,]ok; [,1]err; [1,,2]err.
      }
      throw new SyntaxError('Unterminated array literal [...');
    }
    if (token === '{') {                        //############ OBJECT LITERAL
      var retOb = {};
      while (eatSrc(/^\s*/) , src.length > 0) {
        if (eatSrc(/^\}/)) return retOb;
        var key = nextLiteral();
        if (!isString(key)) throw new SyntaxError('Object key must be a string value -- string: anything');
        if (!eatSrc(/^\s*:/)) throw new SyntaxError('Object literal requires colon between key and value -- key:value');
        retOb[key] = nextLiteral(); // A repeated key overwrites the predecessor.
        eatSrc(/^\s*,/);
      }
      throw new SyntaxError('Unterminated object literal {...');
    }
    throw new SyntaxError('Unknown JSON literal: '+token+src.slice(0,10));
  };

  return (/^\s*$/.test(json)) ? void 0 : nextLiteral(); // JS value represented by the first JSON literal, ignoring leftovers.
};
