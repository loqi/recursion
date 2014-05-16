// this is what you would do if you liked things to be easy:
// var stringifyJSON = JSON.stringify;
// but you don't so you're going to write it from scratch:

var stringifyJSON = function(obj) {
  if (typeof obj == 'undefined') return '';
  if (typeof obj == 'function') return '';
  if (obj == null) return 'null';
  if (typeof obj === 'string') return '"'+obj+'"';
  if (typeof obj === 'boolean') return obj.toString();
  if (typeof obj === 'number') return obj.toString();

  var ret = '';
  var sep = '';
  function retCat(leftS, rightS) { if(rightS.length>0){ret += sep+leftS+rightS ; sep=',';} }

  if (Array.isArray(obj)) {
    for (var i=0; i<obj.length; i++)   retCat('', stringifyJSON(obj[i]));
    return '[' + ret + ']';
  }
  for (var key in obj)   retCat(stringifyJSON(key)+':', stringifyJSON(obj[key]));
  return '{' + ret + '}';

};
