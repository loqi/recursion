var getElementsByClassName = function(className, thisDomNode, accumA) {
  classRex = className instanceof RegExp ? className :
      ( className === '' ? /.?/ : new RegExp('(^|\\s+)'+className+'(\\s+|$)') );
  thisDomNode = thisDomNode || document.body;
  accumA = accumA || [];
  if (classRex.test(thisDomNode.className))  accumA.push(thisDomNode);
  var childA = thisDomNode.children;
  for (var i = 0 ; i < childA.length ; i++)  getElementsByClassName(classRex, childA[i], accumA);
  return accumA;
};
