var getElementsByClassName = function(className, thisDomNode, accumA) {
  thisDomNode = thisDomNode || document.body;
  accumA = accumA || [];
  classRex = (className && className.length > 0) ? new RegExp('(^|\\s+)'+className+'(\\s+|$)') : /.?/;
  if (classRex.test(thisDomNode.className))  accumA.push(thisDomNode);
  var childA = thisDomNode.children;
  for (var i = 0 ; i < childA.length ; i++)  getElementsByClassName(className, childA[i], accumA);
  return accumA;
};
