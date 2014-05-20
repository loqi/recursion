var getElementsByClassName = function(className, thisDomNode, accumA) {
  thisDomNode = thisDomNode || document.body;
  accumA = accumA || [];
  classRex = className instanceof RegExp ? className :
      ( (className === '') ? /.?/ : new RegExp('(^|\\s+)'+className+'(\\s+|$)') );
  if (classRex.test(thisDomNode.className))  accumA.push(thisDomNode);
  var childA = thisDomNode.children;
  for (var i = 0 ; i < childA.length ; i++)  getElementsByClassName(className, childA[i], accumA);
  return accumA;
};
