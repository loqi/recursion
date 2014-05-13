// If life was easy, we could just do things the easy way:
// var getElementsByClassName = function (className) {
//   return document.getElementsByClassName(className);
// };
// But instead we're going to implement it from scratch:


var getElementsByClassName = function(className){
  return accumulateElementsByClassName(className);
};

var isElementOfClass = function(domNode, className) {
  return _.any( domNode.className.split(/\s+/) , function(cname){return cname===className;} );
};

var accumulateElementsByClassName = function(className, thisDomNode, accumA) {
  thisDomNode = thisDomNode || document.body;
  accumA = accumA || [];
  if (isElementOfClass(thisDomNode, className)) accumA.push(thisDomNode);
  var childA = thisDomNode.children;
  for (var i = 0 ; i < childA.length ; i++) {
    accumulateElementsByClassName(className, childA[i], accumA);
  }
  return accumA;
};
