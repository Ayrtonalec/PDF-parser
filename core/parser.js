var util = require('./util.1');
var OPS = util.OPS;
var state = require('./state');


var JsonFactory = require('./jsonFactory');

var jsonFactory = new JsonFactory();

// jsonFactory.createElement('g');
// // var canvas = require('canvas');
// var Image = canvas.Image;

var rule = 1;
var current_alinea = 1;
var prev_x = 0;
var prev_y = 0;

//Official declarations:
    var XML_NS = 'http://www.w3.org/XML/1998/namespace';
    var XLINK_NS = 'http://www.w3.org/1999/xlink';
    var LINE_CAP_STYLES = ['butt', 'round', 'square'];
    var LINE_JOIN_STYLES = ['miter', 'round', 'bevel'];
    var clipCount = 0;
    var maskCount = 0;

var parser = function(commonObjs, objs) {
  this.current = new state();
  this.elements = [];
  this.commonObjs = commonObjs;
  this.objs = objs;
};

function pf(value) {
  if (Number.isInteger(value)) {
    return value.toString();
  }
  var s = value.toFixed(10);
  var i = s.length - 1;
  if (s[i] !== '0') {
    return s;
  }
  do {
    i--;
  } while (s[i] === '0');
  return s.substr(0, s[i] === '.' ? i : i + 1);
}
parser.prototype = {
  parse: function(operatorList) {



    var me = this;

    return this.loadDependencies(operatorList).then(function() {
      var opTree = me.convertOpList(operatorList);

      // console.log(operatorLsist);

      me.executeOpTree(opTree);
      return me.elements;
    });
  },
  convertOpList: function(operatorList) {
    var argsArray = operatorList.argsArray;
    var fnArray = operatorList.fnArray;
    var fnArrayLen = fnArray.length;
    var REVOPS = [];
    var opList = [];

    for (var op in OPS) {
      REVOPS[OPS[op]] = op;
    }

    for (var x = 0; x < fnArrayLen; x++) {
      var fnId = fnArray[x];
      opList.push({
        'fnId': fnId,
        'fn': REVOPS[fnId],
        'args': argsArray[x],
      });
    }
    return this.opListToTree(opList);
  },
  opListToTree: function(opList) {
    var opTree = [];
    var tmp = [];
    var opListLen = opList.length;

    for (var x = 0; x < opListLen; x++) {
      if (opList[x].fn === 'save') {
        opTree.push({ 'fnId': 92, 'fn': 'group', 'items': [], });
        tmp.push(opTree);
        opTree = opTree[opTree.length - 1].items;
        continue;
      }

      if (opList[x].fn === 'restore') {
        opTree = tmp.pop();
      }
      else {
        opTree.push(opList[x]);
      }
    }
    return opTree;
  },
  executeOpTree: function(opTree) {
    var opTreeLen = opTree.length;
    for (var x = 0; x < opTreeLen; x++) {
      var fn = opTree[x].fn;
      var fnId = opTree[x].fnId;
      var args = opTree[x].args;

      function pf(value) {
        if (Number.isInteger(value)) {
          return value.toString();
        }
        var s = value.toFixed(10);
        var i = s.length - 1;
        if (s[i] !== '0') {
          return s;
        }
        do {
          i--;
        } while (s[i] === '0');
        return s.substr(0, s[i] === '.' ? i : i + 1);
      }

      function pm(m) {
        if (m[4] === 0 && m[5] === 0) {
          if (m[1] === 0 && m[2] === 0) {
            if (m[0] === 1 && m[3] === 1) {
              return '';
            }
            return 'scale(' + pf(m[0]) + ' ' + pf(m[3]) + ')';
          }
          if (m[0] === m[3] && m[1] === -m[2]) {
            var a = Math.acos(m[0]) * 180 / Math.PI;
            return 'rotate(' + pf(a) + ')';
          }
        }
        else {
          if (m[0] === 1 && m[1] === 0 && m[2] === 0 && m[3] === 1) {
            return 'translate(' + pf(m[4]) + ' ' + pf(m[5]) + ')';
          }
        }
        return 'matrix(' + pf(m[0]) + ' ' + pf(m[1]) + ' ' + pf(m[2]) + ' ' + pf(m[3]) + ' ' + pf(m[4]) + ' ' + pf(m[5]) + ')';
      }

      switch (fnId | 0) {
        case OPS.beginText:
          console.log("beginText: ");
          this.beginText();

          break;
        case OPS.setLeading:
          // console.log("setLeading: ", args);
          this.setLeading(args);
          break;
        case OPS.setLeadingMoveText:
          this.setLeadingMoveText(args[0], args[1]);
          // console.log("setLeadingMoveText: ", args[0], args[1]);
          // console.log("setLeadingMoveText" + args[0] + args[1]);
          break;
        case OPS.setFont:
          // console.log("setFont: ", args);
          this.setFont(args);
          break;
        case OPS.showText:
          // console.log("showText");
          // console.log("showText: ", args[0]);
          this.showText(args[0]);
          break;
        case OPS.showSpacedText:
          // console.log("showSpacedText");
          console.log("showSpacedText: ", args[0]);
          this.showText(args[0]);
          break;
        case OPS.endText:
          console.log("endText");
          this.endText();
          break;
        case OPS.moveText:
          // console.log("movetext");
          console.log("moveText: ", args[0], args[1]);
          this.moveText(args[0], args[1]);
          break;
        case OPS.setCharSpacing:
          console.log("setCharSpacing: ", args[0]);
          this.setCharSpacing(args[0]);
          break;
        case OPS.setWordSpacing:
          console.log("setWordSpacing: ", args[0]);
          this.setWordSpacing(args[0]);
          break;
        case OPS.setHScale:
          console.log('setHScale', args[0]);
          this.setHScale(args[0]);
          break;
        case OPS.setTextMatrix:
          // // console.log("Functie OPS setTextMatrix");
          // console.log("setTextMatrix: ", args[0], args[1], args[2],
          //   args[3], args[4], args[5]);
          

          this.setTextMatrix(args[0], args[1], args[2],
            args[3], args[4], args[5]);
          break;
        case OPS.setTextRise:
          this.setTextRise(args[0]);
          break;
        case OPS.setLineWidth:
          this.setLineWidth(args[0]);
          break;
        case OPS.setLineJoin:
          this.setLineJoin(args[0]);
          break;
        case OPS.setLineCap:
          this.setLineCap(args[0]);
          break;
        case OPS.setMiterLimit:
          this.setMiterLimit(args[0]);
          break;
        case OPS.setFillRGBColor:
          // console.log("Functie OPS setFillRGBColor");
          // this.setFillRGBColor(args[0], args[1], args[2]);
          break;
        case OPS.setStrokeRGBColor:
          this.setStrokeRGBColor(args[0], args[1], args[2]);
          break;
        case OPS.setDash:
          this.setDash(args[0], args[1]);
          break;
        case OPS.setGState:
          console.log("Functie OPS SetGstate");
          this.setGState(args[0]);
          break;
        case OPS.fill:
          this.fill();
          break;
        case OPS.eoFill:
          this.eoFill();
          break;
        case OPS.stroke:
          this.stroke();
          break;
        case OPS.fillStroke:
          this.fillStroke();
          break;
        case OPS.eoFillStroke:
          this.eoFillStroke();
          break;
        case OPS.clip:
          this.clip('nonzero');
          break;
        case OPS.eoClip:
          this.clip('evenodd');
          break;
        case OPS.paintSolidColorImageMask:
          this.paintSolidColorImageMask();
          break;
        case OPS.paintJpegXObject:
          this.paintJpegXObject(args[0], args[1], args[2]);
          break;
        case OPS.paintImageXObject:
          this.paintImageXObject(args[0]);
          break;
        case OPS.paintInlineImageXObject:
          this.paintInlineImageXObject(args[0]);
          break;
        case OPS.paintImageMaskXObject:
          this.paintImageMaskXObject(args[0]);
          break;
        case OPS.paintFormXObjectBegin:
          this.paintFormXObjectBegin(args[0], args[1]);
          break;
        case OPS.paintFormXObjectEnd:
          this.paintFormXObjectEnd();
          break;
        case OPS.closePath:
          this.closePath();
          break;
        case OPS.closeStroke:
          this.closeStroke();
          break;
        case OPS.closeFillStroke:
          this.closeFillStroke();
          break;
        case OPS.nextLine:
          // console.log("Functie OPS nextLine");
          this.nextLine(); // Fixing the Y Cords in alinea's
          break;
        case OPS.transform:
          this.transform(args[0], args[1], args[2], args[3],
            args[4], args[5]);
          break;
        case OPS.constructPath:
          this.constructPath(args[0], args[1]);
          break;
        case OPS.endPath:
          this.endPath();
          break;
        case 92:
          this.group(opTree[x].items);
          break;
        default:

          break;
      }
    }
  },
  
  setLineWidth: function SVGGraphics_setLineWidth(width) {
        this.current.lineWidth = width;
      },
      setLineCap: function SVGGraphics_setLineCap(style) {
        this.current.lineCap = LINE_CAP_STYLES[style];
      },
      setLineJoin: function SVGGraphics_setLineJoin(style) {
        this.current.lineJoin = LINE_JOIN_STYLES[style];
      },
      setMiterLimit: function SVGGraphics_setMiterLimit(limit) {
        this.current.miterLimit = limit;
      },
      setStrokeAlpha: function SVGGraphics_setStrokeAlpha(strokeAlpha) {
        this.current.strokeAlpha = strokeAlpha;
      },
      setStrokeRGBColor: function SVGGraphics_setStrokeRGBColor(r, g, b) {
        var color = util.Util.makeCssRgb(r, g, b);
        this.current.strokeColor = color;
      },
      setFillAlpha: function SVGGraphics_setFillAlpha(fillAlpha) {
        this.current.fillAlpha = fillAlpha;
      },
      setFillRGBColor: function SVGGraphics_setFillRGBColor(r, g, b) {
        var color = util.Util.makeCssRgb(r, g, b);
        this.current.fillColor = color;
        this.current.tspan = this.svgFactory.createElement('svg:tspan');
        this.current.xcoords = [];
      },
      setDash: function SVGGraphics_setDash(dashArray, dashPhase) {
        this.current.dashArray = dashArray;
        this.current.dashPhase = dashPhase;
      },
  moveText: function(x, y) {
    var current = this.current;
    this.current.x = this.current.lineX += x;
    this.current.y = this.current.lineY += y;

    //Adding alinea's
    // if previous is equal 0
    if (prev_x == 0 || prev_y == 0) {
      prev_x = x; //used in the ifelse above
      prev_y = y; //used in the ifelse above
      this.current.alinea = current_alinea; //Set new property for element "Alinea" and fills it with the current alinea
    }
    else {
      if (prev_x == x || prev_y == y) {
        this.current.alinea = current_alinea; //Set new property for element "Alinea" and fills it with the current alinea
      }
      else {
        current_alinea = current_alinea + 1; //Counter to keep track of the current alinea
        this.current.alinea = current_alinea; //Set new property for element "Alinea" and fills it with the current alinea
      }
    }



  },
  nextLine: function() {

    this.moveText(0, this.current.leading);


  },

  loadDependencies: function(operatorList) {




    var fnArray = operatorList.fnArray;
    var fnArrayLen = fnArray.length;
    var argsArray = operatorList.argsArray;

    for (var i = 0; i < fnArrayLen; i++) {
      if (OPS.dependency === fnArray[i]) {
        var deps = argsArray[i];
        for (var n = 0, nn = deps.length; n < nn; n++) {
          var obj = deps[n];
          var common = obj.substring(0, 2) === 'g_';
          var promise;
          if (common) {
            promise = new Promise((resolve) => {
              this.commonObjs.get(obj, resolve);
            });
          }
          else {
            promise = new Promise((resolve) => {
              this.objs.get(obj, resolve);
            });
          }
          this.current.dependencies.push(promise);
        }
      }
    }
    return Promise.all(this.current.dependencies);
  },
  beginText: function() {
    this.current.x = this.current.lineX = 0;
    this.current.y = this.current.lineY = 0;


  },
  setTextMatrix: function(a, b, c, d, e, f) {


    var current = this.current;
    this.current.textMatrix = this.current.lineMatrix = [a, b, c, d, e, f];
    this.current.x = this.current.lineX = 0;
    this.current.y = this.current.lineY = 0;
    current.xcoords = [];
    
    var tm = new Array();
    tm.fontFamily = current.fontFamily;
    tm.fontSize = current.fontSize;
    tm.y = pf(-current.y);
    
    jsonFactory.createElement('text', tm);
   
    // current.tspan.setAttributeNS(null, 'font-family', current.fontFamily);
    // current.tspan.setAttributeNS(null, 'font-size', pf(current.fontSize) + 'px');
    // current.tspan.setAttributeNS(null, 'y', pf(-current.y));

    // current.txtElement.appendChild(current.tspan);
  },



  showText: function(glyphs) {
    var current = this.current;
    var font = current.font;
    var fontSize = current.fontSize;


    //for the first element of each page or in case of only one element a page
    if (typeof this.current.alinea !== "undefined") {
      // console.log('TRUE'); // Debug purposes 
    }
    else {
      // console.log('FALSE');  // Debug purposes 

      current_alinea = 1; //Resetting Alinea in case of mutiple pages

      this.current.alinea = current_alinea; //Setting first alinea's
    }



    if (fontSize === 0) {
    }

    var charSpacing = current.charSpacing;                 //set 0
    var wordSpacing = current.wordSpacing;                 //set 0
    var fontDirection = current.fontDirection;             //set 1
    var textHScale = current.textHScale * fontDirection;   //set 1
    var glyphsLength = glyphs.length;
    var vertical = font.vertical;
    



    var widthAdvanceScale = fontSize * current.fontMatrix[0];
    var x = 0,
      i;
      
      for (i = 0; i < glyphsLength; ++i) {
          var glyph = glyphs[i];
          if (glyph === null) {
            x += fontDirection * wordSpacing;
            continue;
          } else if ((0, util.isNum)(glyph)) {
            x += -glyph * fontSize * 0.001;
            continue;
          }
                var width = glyph.width;
          var character = glyph.fontChar;
          var spacing = (glyph.isSpace ? wordSpacing : 0) + charSpacing;
          var charWidth = width * widthAdvanceScale + spacing * fontDirection;
          if (!glyph.isInFont && !font.missingFile) {
            x += charWidth;
            continue;
          }
          current.xcoords.push(current.x + x * textHScale);
          // console.log(current);
          current.textContent += character;
          x += charWidth;
      }
        var textMatrix = current.textMatrix;
        if (current.textRise !== 0) {
          textMatrix = textMatrix.slice();
          textMatrix[5] += current.textRise;
        }
        
        
        // //Preventing undefined to occure
    // for (i = 0; i < glyphsLength; ++i) {
    //   var glyph = glyphs[i];
    //   var character = glyph.fontChar;
  //   if (glyph >= 0 || glyph <= 0) { //removing undefined
    //     character = "";
    //   }
    //   current.textContent += character;
    // }





    this.elements.push({ //Pushing data in Elements
      page: 'n/a',
      alinea: this.current.alinea,
      type: 'text', //Static Text
      fontFamily: this.current.fontFamily, //Setting font family

      x: this.current.x, //Setting X cord
      y: this.current.y, //Setting Y cord
      text: current.textContent //Containing the text
    });

    rule = rule + 1; //creating rule counter
    current.textContent = ""; // emptying variable




  },

  setLeading: function(leading) {
    this.current.leading = -leading;
  },

  setLeadingMoveText: function(x, y) {




    this.setLeading(-y);
    this.moveText(x, y);


  },
  paintJpegXObject: function SVGGraphics_paintJpegXObject(objId, w, h) {
    var imgObj = this.objs.get(objId);
    var imagedata = Array();
    imagedata.xlinkhref = imgObj.src;
    imagedata.width = pf(w);
    imagedata.height = pf(h);
    imagedata.x = 0;
    imagedata.y = pf(-h);
    imagedata.transform = 'scale(' + pf(1 / w) + ' ' + pf(-1 / h) + ')';
    
    jsonFactory.createElement('image', imagedata);
    
    console.log('Image data is called');
    // var imgEl = jsonFactory.createElement('image', 'TestData');
    // imgEl.setAttributeNS(XLINK_NS, 'xlink:href', imgObj.src);
    // imgEl.setAttributeNS(null, 'width', pf(w));
    // imgEl.setAttributeNS(null, 'height', pf(h));
    // imgEl.setAttributeNS(null, 'x', '0');
    // imgEl.setAttributeNS(null, 'y', pf(-h));
    // imgEl.setAttributeNS(null, 'transform', 'scale(' + pf(1 / w) + ' ' + pf(-1 / h) + ')');
    // this._ensureTransformGroup().appendChild(imgEl);
  },

  addFontStyle: function(fontObj) {
      if (!this.cssStyle) {
          this.cssStyle = this.svgFactory.createElement('svg:style');
          this.cssStyle.setAttributeNS(null, 'type', 'text/css');
          this.defs.appendChild(this.cssStyle);
        }
        var url = (0, util.createObjectURL)(fontObj.data, fontObj.mimetype, this.forceDataSchema);
        this.cssStyle.textContent += '@font-face { font-family: "' + fontObj.loadedName + '";' + ' src: url(' + url + '); }\n';
  },

  setFont: function(details) {
    var current = this.current;
    var fontObj = this.commonObjs.get(details[0]);
    var size = details[1];
    this.current.font = fontObj;
    
  current.fontMatrix = fontObj.fontMatrix;
      
    var bold = fontObj.black ? (fontObj.bold ? 'bolder' : 'bold') :
      (fontObj.bold ? 'bold' : 'normal');
    var italic = fontObj.italic ? 'italic' : 'normal';

    if (size < 0) {
      size = -size;
      current.fontDirection = -1;
    }
    else {
      current.fontDirection = 1;
    }
    current.fontSize = size;
    current.fontFamily = fontObj.loadedName;
    current.fontWeight = bold;
    current.fontStyle = italic;
    var fontData = Array();
    fontData.y = pf(-current.y);
 
    // rick
    var i=0;
    while(i < jsonFactory.object.textgroup.elements.length){
      if(jsonFactory.object.textgroup.elements[i].text.fontFamily == fontObj.loadedName){
        jsonFactory.object.textgroup.elements[i].text.y = fontData.y;
      }
      
      i = i +1;
    }
    
    // jsonFactory.createElement('tspan', fontData); 
    // console.log(jsonFactory.object.textgroup.elements);
  },setGState: function SVGGraphics_setGState(states) {
        for (var i = 0, ii = states.length; i < ii; i++) {

          var state = states[i];
          var key = state[0];
          var value = state[1];
          switch (key) {
            case 'LW':
              this.setLineWidth(value);
              break;
            case 'LC':
              this.setLineCap(value);
              break;
            case 'LJ':
              this.setLineJoin(value);
              break;
            case 'ML':
              this.setMiterLimit(value);
              break;
            case 'D':
              this.setDash(value[0], value[1]);
              break;
            case 'Font':
              this.setFont(value);
              break;
            case 'CA':
              this.setStrokeAlpha(value);
              break;
            case 'ca':
              this.setFillAlpha(value);
              break;
            default:
              (0, util.warn)('Unimplemented graphic state ' + key);
              break;
          }
        }
      },

  endText: function() {},
};

module.exports = parser;
