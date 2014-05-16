var getElementsByClassName = function(className){

  var accumulateElementsByClassName = function(classNameS, thisDomNode, accumA) {
    thisDomNode = thisDomNode || document.body;
    accumA = accumA || [];
    classNameR = (classNameS && classNameS.length > 0) ? new RegExp('(^|\\s+)'+classNameS+'(\\s+|$)') : /.?/;
    if (classNameR.test(thisDomNode.className))   accumA.push(thisDomNode);
    var childA = thisDomNode.children;
    for (var i = 0 ; i < childA.length ; i++)   accumulateElementsByClassName(classNameS, childA[i], accumA);
    return accumA;
  };

  return accumulateElementsByClassName(className);
};
