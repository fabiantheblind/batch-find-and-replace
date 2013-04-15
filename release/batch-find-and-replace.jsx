
/*************************************************
*
* This script batch processes InDesign FNR
*
****************************************************
* Copyright (c)  2013
* Fabian "fabiantheblind" Morón Zirfas
* Permission is hereby granted, free of charge, to any 
* person obtaining a copy of this software and associated
* documentation files (the "Software"), to deal in the Software
* without restriction, including without limitation the rights 
* to use, copy, modify, merge, publish, distribute, sublicense,
* and/or sell copies of the Software, and to  permit persons to 
* whom the Software is furnished to do so, subject to
* the following conditions:
* The above copyright notice and this permission notice
* shall be included in all copies or substantial portions of the Software.
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
* IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
* DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF  CONTRACT,
* TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTIO
* WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*
* see also http://www.opensource.org/licenses/mit-license.php
*
* Btw: It's awesome that you are reading the source code
* feel free to ask me anything about it
*
****************************************************
* there are some js libraries used
* ----------------------------------------------
* a toml (Tom's Obvious, Minimal Language) parser https://github.com/mojombo/toml 
* by JonAbrams https://github.com/JonAbrams/tomljs
* ----------------------------------------------
* ----------------------------------------------
* JsonDiffPatch by benjamine to get the toml into
* our structure
* Diff & Patch for JavaScript objects and arrays
* (ie. any JSON serializable structure)
* https://github.com/benjamine/JsonDiffPatch
**************************************************/


/**
 * This runs the full script
 * @return {[type]} [description]
 */
function bfnr_run(){
var path = ((File($.fileName)).path);

// $.evalFile(File(path + '/submodules/tomljs/toml.js'));// https://github.com/JonAbrams/tomljs

// $.evalFile(File(path +'/submodules/JsonDiffPatch/src/jsondiffpatch.js')); // https://github.

/**
 * the settings
 * @type {Object}
 */
var bfnr = {
  'version':'0.1.2',
  'toml':null,
  'settings':{
  'do_text':false,
  'do_grep':false,
  'do_glyph':false,
  'do_object':false,
  'do_all_docs':true
  }
};
// lets get the data
var tomltxt = readfile('toml', path);
if(tomltxt !==null){
  // diff and patch the settings
  // 
  bfnr.toml = TOML.parse(tomltxt);
  var delta = jsondiffpatch.diff(bfnr.settings, bfnr.toml);
  // alert(delta.toSource());
  jsondiffpatch.patch(bfnr.settings, delta);
  // alert(bfnr.settings.toSource());
}

// this is written for mirna to work on all of her docs ;)
// http://forums.adobe.com/message/5228290#5228290
var doc = null;
if(bfnr.settings.do_all_docs === true){
  for(var d = 0; d < app.documents.length;d++){
    doc = app.documents[d];
    if(doc !== null){
    run_processor(doc, bfnr);
    }
  }

}else{
  doc = app.activeDocument;
  if(doc !== null){
    run_processor(doc, bfnr);
  }
}

} // end of run function
/**
 * [run_processor description]
 * @param  {[type]} doc  [description]
 * @param  {[type]} bfnr [description]
 * @return {[type]}      [description]
 */
function run_processor(doc, bfnr){
if(bfnr.settings.do_text === true){
  processor(doc, SearchModes.TEXT_SEARCH, bfnr.toml.text.files);
}
if(bfnr.settings.do_grep === true){
  processor(doc, SearchModes.GREP_SEARCH, bfnr.toml.grep.files);
}
if(bfnr.settings.do_glyph === true){
  processor(doc, SearchModes.GLYPH_SEARCH, bfnr.toml.glyph.files);
}
if(bfnr.settings.do_object === true){
  processor(doc, SearchModes.OBJECT_SEARCH, bfnr.toml.objects.files);
}
}
/**
 * [processor description]
 * @param  {[type]} doc  [description]
 * @param  {[type]} mode [description]
 * @param  {[type]} list [description]
 * @return {[type]}      [description]
 */
function processor(doc, mode, list){
for(var i = 0; i < list.length;i++){

  try{
    empty_fc_fields(mode);
  app.loadFindChangeQuery (list[i], mode);
  }catch(e){
    alert('There was an error while trying to process the "' + list[i]+'.xml"\n'+
      'Please make sure it exists and is at the right spot\n'+
      e);
    }
  // try{
  if(mode == SearchModes.TEXT_SEARCH){
    doc.changeText();
    }
  // }catch(e){
  //   alert('There was an error while processing the changeText command\n' + e);
  // }
  //   try{

  if(mode == SearchModes.GREP_SEARCH){
    // empty_fc_fields(mode);
    doc.changeGrep();
    }
  //     }catch(e){
  //   alert('There was an error while processing the changeGrep command\n' + e);
  // }
  //     try{

  if(mode == SearchModes.OBJECT_SEARCH){
    // empty_fc_fields(mode);
    doc.changeObject();
    }
  //     }catch(e){
  //   alert('There was an error while processing the changeObject command\n' + e);
  // }
  //     try{

  if(mode == SearchModes.GLYPH_SEARCH){
    // empty_fc_fields(mode);
    doc.changeGlyph();
    }
  // }catch(e){
  //   alert('There was an error while processing the changeGlyph command\n' + e);
  //   }
  }
}
/**
 * basic file reading function
 * @param  {String} type the type of file
 * @return {String or null}
 */
function readfile(type, path){
  var file_to_read = null;
  file_to_read = File(path + '/' + 'batch-find-and-replace.toml');
  if(file_to_read.exists !== true){
    file_to_read = File.openDialog("Select a "+type+" file to import.", "*."+type,false);
  }

  var txt = null;
  if (file_to_read !== null) {
    file_to_read.open('r','TEXT','????');
    txt = file_to_read.read();
    file_to_read.close();
  }
  if(txt !== null){
    return txt;
  }else{
    alert('Error reading file');
    return null;
  }
}


function empty_fc_fields(mode){

  if(mode == SearchModes.TEXT_SEARCH){
  app.findTextPreferences = NothingEnum.nothing; // now empty the find what field!!!thats important!!!
  app.changeTextPreferences = NothingEnum.nothing; // empts the change to field!!!thats important!!!
    
  }
  if(mode == SearchModes.GREP_SEARCH){

  app.findGrepPreferences = NothingEnum.nothing; // now empty the find what field!!!thats important!!!
  app.changeGrepPreferences = NothingEnum.nothing; // empts the change to field!!!thats important!!!
    
  }
  if(mode == SearchModes.GLYPH_SEARCH){
  app.findGlyphPreference = NothingEnum.nothing; // now empty the find what field!!!thats important!!!
  app.changeGlyphPreferences = NothingEnum.nothing; // empts the change to field!!!thats important!!!
    
  }

  if(mode == SearchModes.OBJECT_SEARCH){
  app.findObjectPreference = NothingEnum.nothing; // now empty the find what field!!!thats important!!!
  app.changeObjectPreferences = NothingEnum.nothing; // empts the change to field!!!thats important!!!
    
  }

}
  //  _______ ____  __  __ _      _____        _____   _____ ______ 
  // |__   __/ __ \|  \/  | |    |  __ \ /\   |  __ \ / ____|  ____|
  //    | | | |  | | \  / | |    | |__) /  \  | |__) | (___ | |__   
  //    | | | |  | | |\/| | |    |  ___/ /\ \ |  _  / \___ \|  __|  
  //    | | | |__| | |  | | |____| |  / ____ \| | \ \ ____) | |____ 
  //    |_|  \____/|_|  |_|______|_| /_/    \_\_|  \_\_____/|______|
                                                                 
                                                                 
// ********************************************************************************
// Generated by CoffeeScript 1.5.0
// minimal edit to make it usable by extendscript
var getVal;

var TOML = {};

TOML.parse = function(text) {
  var addKey, equalsIndex, isArray, key, keygroup, line, lineNum, obj, processArray, strTokens, val, value, _i, _len, _ref;
  obj = {};
  text = text.replace(/^\s\s*/gm, "").replace(/\s\s*$/gm, "");
  strTokens = [];
  text = text.replace(/"(?:\\[^\n]|[^"\n])*"/g, function(str) {
    str = str.slice(0, str.length - 1).slice(1);
    str = str.replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\0/g, "\0").replace(/\\r/g, "\r").replace(/\\\\/g, "\\").replace(/\\"/g, "\"");
    strTokens.push(str);
    return "string" + (strTokens.length - 1);
  });
  text = text.replace(/\s*#.*$/gm, "");
  keygroup = obj;
  _ref = text.split("\n");
  for (lineNum = _i = 0, _len = _ref.length; _i < _len; lineNum = ++_i) {
    line = _ref[lineNum];
    if (line === "") {
      continue;
    }
    if (line.match(/^\[[_a-zA-Z](\w|\.)*]$/)) {
      keygroup = obj;
      addKey = function(keys, parent) {
        var key;
        if (keys.length === 0) {
          keygroup = parent;
          return;
        }
        if (!parent) {
          parent = obj;
        }
        key = keys.shift();
        if (!parent[key]) {
          parent[key] = {};
        }
        return addKey(keys, parent[key]);
      };
      addKey(line.replace(/^\[/, "").replace(/]$/, "").split("."), keygroup);
    } else if (!line.match(/^[_a-zA-z]\w*\s*=\s*[string\d|\[\d]|true|false/)) {
      throw "Invalid statement on line " + lineNum;
    } else {
      equalsIndex = line.indexOf("=");
      key = line.slice(0, equalsIndex).replace(/\s*$/, "");
      value = line.slice(equalsIndex + 1).replace(/^\s*/, "");
      if (value.match(isArray = /^\[.*]$/)) {
        processArray = function(arrayStr, parent) {
          var newArray, topArray, val, valueMatch, _ref1, _ref2;
          if (parent == null) {
            parent = null;
          }
          while (!arrayStr.match(/^\s*$/)) {
            arrayStr = arrayStr.replace(/^\s*/, "").replace(/\s*$/, "");
            if (arrayStr[0] === "[") {
              if (parent) {
                newArray = [];
                arrayStr = arrayStr.slice(1);
                _ref1 = processArray(arrayStr, newArray), arrayStr = _ref1[0], newArray = _ref1[1];
                parent.push(newArray);
              } else {
                _ref2 = processArray(arrayStr.slice(1), []), arrayStr = _ref2[0], topArray = _ref2[1];
                return topArray;
              }
            } else if (arrayStr[0] === "]") {
              if (!parent) {
                throw "Could not parse array on line " + lineNum + ". Check for extra ] characters.";
              }
              return [arrayStr.replace(/]\s*,?\s*/, ""), parent];
            } else {
              valueMatch = arrayStr.match(/[^,\]]+/);
              if (!valueMatch) {
                throw "Could not parse array on line " + lineNum + ". Check the number of opening and closing brackets.";
              }
              val = getVal(valueMatch[0].replace(/\s*$/, ""), strTokens);
              if (val === null) {
                // debugger;
                throw "Could not parse array on line " + lineNum + ". Check for extra commas.";
              }
              parent.push(val);
              arrayStr = arrayStr.replace(/[^,\]]+/, "");
              if (arrayStr[0] === ",") {
                arrayStr = arrayStr.slice(1);
              }
            }
          }
          throw "Could not parse array on line " + lineNum + ". Check for missing closing brackets.";
        };
        val = processArray(value);
      } else {
        val = getVal(value, strTokens);
        if (val == null) {
          throw "Invalid value with assignment on line " + lineNum;
        }
      }
      keygroup[key] = val;
    }
  }
  return obj;
};

getVal = function(valStr, strTokens) {
  var date;
  if (valStr.match(/^true|false$/)) {
    return /true/.test(valStr);
  } else if (valStr.match(/^-?\d*\.?\d+$/)) {
    return parseFloat(valStr.match(/^\d*\.?\d+$/)[0]);
  } else if (valStr.match(/string\d+/)) {
    return strTokens[parseInt(valStr.match(/\d+/)[0], 10)];
  } else if ((date = new Date(valStr)).toString() !== "Invalid Date") {
    return date;
  }
  return null;
};


  //       _  _____  ____  _   _ _____ _____ ______ ______ 
  //      | |/ ____|/ __ \| \ | |  __ \_   _|  ____|  ____|
  //      | | (___ | |  | |  \| | |  | || | | |__  | |__   
  //  _   | |\___ \| |  | | . ` | |  | || | |  __| |  __|  
  // | |__| |____) | |__| | |\  | |__| || |_| |    | |     
  //  \____/|_____/ \____/|_| \_|_____/_____|_|    |_|     
                                                        
                                                        

// ********************************************************************************

/*
*   Json Diff Patch
*   ---------------
*   https://github.com/benjamine/JsonDiffPatch
*   by Benjamin Eidelman - beneidel@gmail.com
*   minimal edits to make it available to extendscript
*/


    var jdp = {};
    if (typeof jsondiffpatch != 'undefined'){
        jdp = jsondiffpatch;
    }
    var jsondiffpatch = jdp;
    jdp.version = '0.0.7';
    jdp.config = {
        textDiffMinLength: 60,
        detectArrayMove: true,
        includeValueOnArrayMove: false
    };

    var sequenceDiffer = {

        diff: function(array1, array2, objectHash, objectInnerDiff) {
            var commonHead = 0, commonTail = 0, index, index1;
            var len1 = array1.length;
            var len2 = array2.length;
            var diff;
            var hashCache1 = [];
            var hashCache2 = [];
            var areTheSame = typeof objectHash == 'function' ?
                function(value1, value2, index1, index2) {
                    if (value1 === value2)
                        return true;
                    if (typeof value1 != 'object' || typeof value2 != 'object')
                        return false;
                    var hash1, hash2;
                    if (typeof index1 == 'number') {
                        hash1 =  hashCache1[index1];
                        if (typeof hash1 == 'undefined') {
                            hashCache1[index1] = hash1 = objectHash(value1);
                        }
                    } else {
                        hash1 = objectHash(value1);
                    }
                    if (typeof index2 == 'number') {
                        hash2 =  hashCache2[index2];
                        if (typeof hash2 == 'undefined') {
                            hashCache2[index2] = hash2 = objectHash(value2);
                        }
                    } else {
                        hash2 = objectHash(value2);
                    }
                    return hash1 === hash2;
                } :
                function(value1, value2) {
                    return value1 === value2;
                };
            var areTheSameByIndex = function(index1, index2) {
                return areTheSame(array1[index1], array2[index2], index1, index2);
            };

            var tryObjectInnerDiff = function(index1, index2) {
                if (!objectInnerDiff) {
                    return;
                }
                if (typeof array1[index1] != 'object' || typeof array2[index2] != 'object') {
                    return;
                }
                var result = objectInnerDiff(array1[index1], array2[index2]);
                if (typeof result == 'undefined') {
                    return;
                }
                if (!diff) {
                    diff = { _t: 'a' };
                }
                diff[index2] = result;
            };

            // separate common head
            while (commonHead < len1 && commonHead < len2 &&
                areTheSameByIndex(commonHead, commonHead)) {
                tryObjectInnerDiff(commonHead, commonHead);
                commonHead++;
            }
            // separate common tail
            while (commonTail + commonHead < len1 && commonTail + commonHead < len2 &&
                areTheSameByIndex(len1 - 1 - commonTail, len2 - 1 - commonTail)) {
                tryObjectInnerDiff(len1 - 1 - commonTail, len2 - 1 - commonTail);
                commonTail++;
            }

            if (commonHead + commonTail === len1) {
                if (len1 === len2) {
                    // arrays are identical
                    return diff;
                }
                // trivial case, a block (1 or more) was added at array2
                diff = diff || { _t: 'a' };
                for (index = commonHead; index < len2 - commonTail; index++) {
                    diff[index] = [array2[index]];
                }
                return diff;
            } else if (commonHead + commonTail === len2) {
                // trivial case, a block (1 or more) was removed from array1
                diff = diff || { _t: 'a' };
                for (index = commonHead; index < len1 - commonTail; index++) {
                    diff['_'+index] = [array1[index], 0, 0];
                }
                return diff;
            }

            // diff is not trivial, find the LCS (Longest Common Subsequence)
            var lcs = this.lcs(
                array1.slice(commonHead, len1 - commonTail),
                array2.slice(commonHead, len2  - commonTail),
                {
                    areTheSameByIndex: function(index1, index2) {
                        return areTheSameByIndex(index1 + commonHead, index2 + commonHead);
                    }
                });

            diff = diff || { _t: 'a' };

            var removedItems = [];
            for (index = commonHead; index < len1 - commonTail; index++) {
                if (lcs.indices1.indexOf(index - commonHead) < 0) {
                    // removed
                    diff['_'+index] = [array1[index], 0, 0];
                    removedItems.push(index);
                }
            }
            var removedItemsLength = removedItems.length;
            for (index = commonHead; index < len2 - commonTail; index++) {
                var indexOnArray2 = lcs.indices2.indexOf(index - commonHead);
                if (indexOnArray2 < 0) {
                    // added, try to match with a removed item and register as position move
                    var isMove = false;
                    if (jdp.config.detectArrayMove) {                        
                        if (removedItemsLength > 0) {
                            for (index1 = 0; index1 < removedItemsLength; index1++) {
                                if (areTheSameByIndex(removedItems[index1], index)) {
                                    // store position move as: [originalValue, newPosition, 3]
                                    diff['_' + removedItems[index1]].splice(1, 2, index, 3);
                                    if (!jdp.config.includeValueOnArrayMove) {
                                        // don't include moved value on diff, to save bytes
                                        diff['_' + removedItems[index1]][0] = '';
                                    }
                                    tryObjectInnerDiff(removedItems[index1], index);
                                    removedItems.splice(index1, 1);
                                    isMove = true;
                                    break;
                                }
                            }
                        }
                    }
                    if (!isMove) {
                        // added
                        diff[index] = [array2[index]];
                    }
                } else {
                    // match, do inner diff
                    tryObjectInnerDiff(lcs.indices1[indexOnArray2] + commonHead, lcs.indices2[indexOnArray2] + commonHead);
                }
            }

            return diff;
        },

        getArrayIndexBefore: function(d, indexAfter) {
            var index, indexBefore = indexAfter;
            for (var prop in d) {
                if (d.hasOwnProperty(prop)) {
                    if (isArray(d[prop])) {
                        if (prop.slice(0, 1) === '_') {
                            index = parseInt(prop.slice(1), 10);
                        } else {
                            index = parseInt(prop, 10);
                        }
                        if (d[prop].length === 1) {
                            if (index < indexAfter) {
                                // this item was inserted before
                                indexBefore--;
                            } else {
                                if (index === indexAfter) {
                                    // the item is new
                                    return -1;
                                }
                            }
                        } else if (d[prop].length === 3) {
                            if (d[prop][2] === 0) {
                                if (index <= indexAfter) {
                                    // this item was removed before
                                    indexBefore++;
                                }
                            } else {
                                if (d[prop][2] === 3) {
                                    if (index <= indexAfter) {
                                        // this item was moved from a position before
                                        indexBefore++;
                                    }
                                    if (d[prop][1] > indexAfter) {
                                        // this item was moved to a position before
                                        indexBefore--;
                                    } else {
                                        if (d[prop][1] === indexAfter) {
                                            // the items was moved from other position
                                            return index;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return indexBefore;
        },

        patch: function(array, d, objectInnerPatch, path) {
            var index, index1;
            var numerically = function(a, b) {
                return a - b;
            };
            var numericallyBy = function(name) {
                return function(a, b) {
                    return a[name] - b[name];
                };
            };

            // first, separate removals, insertions and modifications
            var toRemove = [];
            var toInsert = [];
            var toModify = [];
            for (index in d) {
                if (index !== '_t') {
                    if (index[0] == '_') {
                        // removed item from original array
                        if (d[index][2] === 0 || d[index][2] === 3) {
                            toRemove.push(parseInt(index.slice(1), 10));
                        } else {
                            throw new Error('only removal or move can be applied at original array indices, invalid diff type: ' + d[index][2]);
                        }
                    } else {
                        if (d[index].length === 1) {
                            // added item at new array
                            toInsert.push({
                                index: parseInt(index, 10),
                                value: d[index][0]
                            });
                        } else {
                            // modified item at new array
                            toModify.push({
                                index: parseInt(index, 10),
                                diff: d[index]
                            });
                        }
                    }
                }
            }

            // remove items, in reverse order to avoid sawing our own floor
            toRemove = toRemove.sort(numerically);
            for (index = toRemove.length - 1; index >= 0; index--) {
                index1 = toRemove[index];
                var indexDiff = d['_' + index1];
                var removedValue = array.splice(index1, 1)[0];
                if (indexDiff[2] === 3) {
                    // reinsert later
                    toInsert.push({
                        index: indexDiff[1],
                        value: removedValue
                    });
                }
            }

            // insert items, in reverse order to avoid moving our own floor
            toInsert = toInsert.sort(numericallyBy('index'));
            var toInsertLength = toInsert.length;
            for (index = 0; index < toInsertLength; index++) {
                var insertion = toInsert[index];
                array.splice(insertion.index, 0, insertion.value);
            }

            // apply modifications
            var toModifyLength = toModify.length;
            if (toModifyLength > 0) {
                if (typeof objectInnerPatch != 'function') {
                    throw new Error('to patch items in the array an objectInnerPatch function must be provided');
                }
                for (index = 0; index < toModifyLength; index++) {
                    var modification = toModify[index];
                    objectInnerPatch(array, modification.index.toString(), modification.diff, path);
                }
            }

            return array;
        },

        lcs: function(array1, array2, options) {

            // http://en.wikipedia.org/wiki/Longest_common_subsequence_problem
            options.areTheSameByIndex = options.areTheSameByIndex || function(index1, index2) {
                return array1[index1] === array2[index2];
            };
            var matrix = this.lengthMatrix(array1, array2, options);
            var result = this.backtrack(matrix, array1, array2, array1.length, array2.length);
            if (typeof array1 == 'string' && typeof array2 == 'string') {
                result.sequence = result.sequence.join('');
            }
            return result;
        },

        lengthMatrix: function(array1, array2, options) {
            var len1 = array1.length;
            var len2 = array2.length;
            var x, y;
            
            // initialize empty matrix of len1+1 x len2+1
            var matrix = [len1 + 1];
            for (x = 0; x < len1 + 1; x++) {
                matrix[x] = [len2 + 1];
                for (y = 0; y < len2 + 1; y++) {
                    matrix[x][y] = 0;
                }
            }
            matrix.options = options;
            // save sequence lengths for each coordinate
            for (x = 1; x < len1 + 1; x++) {
                for (y = 1; y < len2 + 1; y++) {
                    if (options.areTheSameByIndex(x - 1, y - 1)) {
                        matrix[x][y] = matrix[x - 1][y - 1] + 1;
                    } else {
                        matrix[x][y] = Math.max(matrix[x - 1][y], matrix[x][y - 1]);
                    }
                }
            }
            return matrix;
        },

        backtrack: function(lenghtMatrix, array1, array2, index1, index2) {
            if (index1 === 0 || index2 === 0) {
                return {
                    sequence: [],
                    indices1: [],
                    indices2: []
                };
            }

            if (lenghtMatrix.options.areTheSameByIndex(index1 - 1, index2 - 1)) {
                var subsequence = this.backtrack(lenghtMatrix, array1, array2, index1 - 1, index2 - 1);
                subsequence.sequence.push(array1[index1 - 1]);
                subsequence.indices1.push(index1 - 1);
                subsequence.indices2.push(index2 - 1);
                return subsequence;
            }

            if (lenghtMatrix[index1][index2 - 1] > lenghtMatrix[index1 - 1][index2]) {
                return this.backtrack(lenghtMatrix, array1, array2, index1, index2 - 1);
            } else {
                return this.backtrack(lenghtMatrix, array1, array2, index1 - 1, index2);
            }
        }
    };

    jdp.sequenceDiffer = sequenceDiffer;

    jdp.dateReviver = function(key, value){
        var a;
        if (typeof value === 'string') {
            a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)(Z|([+\-])(\d{2}):(\d{2}))$/.exec(value);
            if (a) {
                return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4], +a[5], +a[6]));
            }
        }
        return value;
    };
    
    var diff_match_patch_autoconfig = function(){
        var dmp;
        
        if (jdp.config.diff_match_patch) {
            dmp = new jdp.config.diff_match_patch.diff_match_patch();
        }
        if (typeof diff_match_patch != 'undefined') {
            if (typeof diff_match_patch == 'function') {
                dmp = new diff_match_patch();
            }
            else if (typeof diff_match_patch == 'object' && typeof diff_match_patch.diff_match_patch == 'function') {
                dmp = new diff_match_patch.diff_match_patch();
            }
        }
        
        if (dmp) {
            jdp.config.textDiff = function(txt1, txt2){
                return dmp.patch_toText(dmp.patch_make(txt1, txt2));
            };
            jdp.config.textPatch = function(txt1, patch){
                var results = dmp.patch_apply(dmp.patch_fromText(patch), txt1);
                for (var i = 0; i < results[1].length; i++) {
                    if (!results[1][i]) {
                        throw new Error('text patch failed');
                    }
                }
                return results[0];
            };
            return true;
        }
    };

    var isArray = jdp.isArray = (typeof Array.isArray == 'function') ?
        // use native function
        Array.isArray :
        // use instanceof operator
        function(a) {
            return typeof a == 'object' && a instanceof Array;
        };

    var isDate = jdp.isDate = function(d){
        return d instanceof Date || Object.prototype.toString.call(d) === '[object Date]';
    };

    var arrayDiff = function(o, n){
        return sequenceDiffer.diff(o, n, jdp.config.objectHash, jdp.diff);
    };

    var objectDiff = function(o, n){
    
        var odiff, pdiff, prop, addPropDiff;
        
        addPropDiff = function(name){
            
            pdiff = diff(o[name], n[name]);
            if (typeof pdiff != 'undefined') {
                if (typeof odiff == 'undefined') {
                    odiff = {};
                }
                odiff[name] = pdiff;
            }
        };
        
        for (prop in n) {
            if (n.hasOwnProperty(prop)) {
                addPropDiff(prop);
            }
        }
        for (prop in o) {
            if (o.hasOwnProperty(prop)) {
                if (typeof n[prop] == 'undefined') {
                    addPropDiff(prop);
                }
            }
        }
        return odiff;
    };
    
    var diff = jdp.diff = function(o, n){
        var ntype, otype, nnull, onull, d;
        
        if (o === n) {
            return;
        }
        if ((o !== o) && (n !== n)) {
            return; // o and n are both NaN
        }
        ntype = typeof n;
        otype = typeof o;
        nnull = n === null;
        onull = o === null;

        // handle Date objects
        if (otype == 'object' && isDate(o)){
            otype = 'date';
        }
        if (ntype == 'object' && isDate(n)){
            ntype = 'date';
            if (otype == 'date'){
                // check if equal dates
                if (o.getTime() === n.getTime()){
                    return;
                }
            }
        }
        
        if (nnull || onull || ntype == 'undefined' || ntype != otype ||
        ntype == 'number' ||
        otype == 'number' ||
        ntype == 'boolean' ||
        otype == 'boolean' ||
        ntype == 'string' ||
        otype == 'string' ||
        ntype == 'date' ||
        otype == 'date' ||
        ((ntype === 'object') && (isArray(n) != isArray(o)))) {
            // value changed
            d = [];
            if (typeof o != 'undefined') {
                if (typeof n != 'undefined') {
                    var longText = (ntype == 'string' && otype == 'string' && Math.min(o.length, n.length) > jdp.config.textDiffMinLength);
                    if (longText && !jdp.config.textDiff) {
                        diff_match_patch_autoconfig();
                    }
                    if (longText && jdp.config.textDiff) {
                        // get changes form old value to new value as a text diff
                        d.push(jdp.config.textDiff(o, n), 0, 2);
                    }
                    else {
                        // old value changed to new value
                        d.push(o);
                        d.push(n);
                    }
                }
                else {
                    // old value has been removed
                    d.push(o);
                    d.push(0, 0);
                }
            }
            else {
                // new value is added
                d.push(n);
            }
            return d;
        }
        else {
            if (isArray(n)) {
                // diff 2 arrays
                return arrayDiff(o, n);
            }
            else {
                // diff 2 objects
                return objectDiff(o, n);
            }
        }
    };
    
    var objectGet = function(obj, key){
        if (isArray(obj)) {
            return obj[parseInt(key, 10)];
        }
        return obj[key];
    };
    
    jdp.getByKey = objectGet;
    
    var objectSet = function(obj, key, value){
        if (isArray(obj) && obj._key) {
            var getKey = obj._key;
            if (typeof obj._key != 'function') {
                getKey = function(item){
                    return item[obj._key];
                };
            }
            for (var i = 0; i < obj.length; i++) {
                if (getKey(obj[i]) === key) {
                    if (typeof value == 'undefined') {
                        obj.splice(i, 1);
                        i--;
                    }
                    else {
                        obj[i] = value;
                    }
                    return;
                }
            }
            if (typeof value != 'undefined') {
                obj.push(value);
            }
            return;
        }
        if (typeof value == 'undefined') {
            if (isArray(obj)) {
                obj.splice(key, 1);
            } else {
                delete obj[key];
            }
        }
        else {
            obj[key] = value;
        }
    };

    var textDiffReverse = function(td){

        if (!jdp.config.textDiffReverse){
            jdp.config.textDiffReverse = function(d){

                var i, l, lines, line, lineTmp, header = null, headerRegex = /^@@ +\-(\d+),(\d+) +\+(\d+),(\d+) +@@$/, lineHeader, lineAdd, lineRemove;

                var diffSwap = function() {
                    // swap
                    if (lineAdd !== null) {
                        lines[lineAdd] = '-' + lines[lineAdd].slice(1);
                    }
                    if (lineRemove !== null) {
                        lines[lineRemove] = '+' + lines[lineRemove].slice(1);
                        if (lineAdd !== null) {
                            lineTmp = lines[lineAdd];
                            lines[lineAdd] = lines[lineRemove];
                            lines[lineRemove] = lineTmp;
                        }
                    }

                    // fix header
                    lines[lineHeader] = '@@ -' + header[3] + ',' + header[4] + ' +' + header[1] + ',' + header[2] + ' @@';

                    header = null;
                    lineHeader = null;
                    lineAdd = null;
                    lineRemove = null;
                };

                lines = d.split('\n');
                for (i = 0, l = lines.length; i<l; i++) {
                    line = lines[i];
                    var lineStart = line.slice(0,1);
                    if (lineStart==='@'){
                        if (header !== null) {
                            //diffSwap();
                        }
                        header = headerRegex.exec(line);
                        lineHeader = i;
                        lineAdd = null;
                        lineRemove = null;

                        // fix header
                        lines[lineHeader] = '@@ -' + header[3] + ',' + header[4] + ' +' + header[1] + ',' + header[2] + ' @@';
                    } else if (lineStart == '+'){
                        lineAdd = i;
                        lines[i] = '-' + lines[i].slice(1);
                    } else if (lineStart == '-'){
                        lineRemove = i;
                        lines[i] = '+' + lines[i].slice(1);
                    }
                }
                if (header !== null) {
                    //diffSwap();
                }
                return lines.join('\n');
            };
        }
        return jdp.config.textDiffReverse(td);
    };

    var reverse = jdp.reverse = function(d){

        var prop, rd;

        if (typeof d == 'undefined')
        {
            return;
        }
        else if (d === null)
        {
            return null;
        }
        else if (typeof d == 'object' && !isDate(d))
        {
            if (isArray(d))
            {
                if (d.length < 3)
                {
                    if (d.length === 1) {
                        // add => delete
                        return [d[0], 0, 0];
                    } else {
                        // modify => reverse modify
                        return [d[1], d[0]];
                    }
                }
                else
                {
                    if (d[2] === 0)
                    {
                        // undefined, delete value => add value
                        return [d[0]];
                    }
                    else
                    {
                        if (d[2] === 2) {
                            return [textDiffReverse(d[0]), 0, 2];
                        }
                        else
                        {
                            throw new Error("invalid diff type");
                        }
                    }
                }
            }
            else
            {
                rd = {};
                if (d._t === 'a') {
                    for (prop in d) {
                        if (d.hasOwnProperty(prop) && prop !== '_t') {
                            var index, reverseProp = prop;
                            if (prop.slice(0, 1) === '_') {
                                index = parseInt(prop.slice(1), 10);
                            } else {
                                index = parseInt(prop, 10);
                            }
                            if (isArray(d[prop])) {
                                if (d[prop].length === 1) {
                                    // add => delete
                                    reverseProp = '_' + index;
                                } else {
                                    if (d[prop].length === 2) {
                                        // modify => reverse modify
                                        reverseProp = sequenceDiffer.getArrayIndexBefore(d, index);
                                    } else {
                                        if (d[prop][2] === 0) {
                                            // delete => add
                                            reverseProp = index.toString();
                                        } else {
                                            if (d[prop][2] === 3) {
                                                // move => reverse move
                                                reverseProp = '_' + d[prop][1];
                                                rd[reverseProp] = [d[prop][0], index, 3];
                                                continue;
                                            } else {
                                                // other modify (eg. textDiff) => reverse modify
                                                reverseProp = sequenceDiffer.getArrayIndexBefore(d, index);
                                            }
                                        }
                                    }
                                }
                            } else {
                                // inner diff => reverse inner diff
                                reverseProp = sequenceDiffer.getArrayIndexBefore(d, index);
                            }
                            rd[reverseProp] = reverse(d[prop]);
                        }
                    }
                    rd._t = 'a';
                } else {
                    for (prop in d) {
                        if (d.hasOwnProperty(prop)) {
                            rd[prop] = reverse(d[prop]);
                        }
                    }
                }
                return rd;
            }
        } else if (typeof d === 'string' && d.slice(0,2) === '@@'){
            return textDiffReverse(d);
        }
        return d;
    };
    
    var patch = jdp.patch = function(o, pname, d, path) {
    
        var p, nvalue, subpath = '', target;
        
        if (typeof pname != 'string') {
            path = d;
            d = pname;
            pname = null;
        }
        else {
            if (typeof o != 'object') {
                pname = null;
            }
        }
        
        if (path) {
            subpath += path;
        }
        subpath += '/';
        if (pname !== null) {
            subpath += pname;
        }
        
        if (typeof d == 'object') {
            if (isArray(d)) {
                // changed value
                if (d.length < 3) {
                    nvalue = d[d.length - 1];
                    if (pname !== null) {
                        objectSet(o, pname, nvalue);
                    }
                    return nvalue;
                }
                else {
                    if (d[2] === 0) {
                        // undefined, delete value
                        if (pname !== null) {
                            objectSet(o, pname);
                        }
                        else {
                            return;
                        }
                    }
                    else
                    {
                        if (d[2] === 2) {
                            // text diff
                            if (!jdp.config.textPatch) {
                                diff_match_patch_autoconfig();
                            }
                            if (!jdp.config.textPatch) {
                                throw new Error("textPatch function not found");
                            }
                            try {
                                nvalue = jdp.config.textPatch(objectGet(o, pname), d[0]);
                            }
                            catch (text_patch_err) {
                                throw new Error('cannot apply patch at "' + subpath + '": ' + text_patch_err);
                            }
                            if (pname !== null) {
                                objectSet(o, pname, nvalue);
                            }
                            return nvalue;
                        }
                        else
                        {
                            if (d[2] === 3) {
                                // position move

                                // TODO: remove from current position, to insert later at new position
                                throw new Error("Not implemented diff type: " + d[2]);
                            } else {
                                throw new Error("invalid diff type: " + d[2]);
                            }
                        }
                    }
                }
            }
            else {
                if (d._t == 'a') {
                    // array diff
                    target = pname === null ? o : objectGet(o, pname);
                    if (typeof target != 'object' || !isArray(target)) {
                        throw new Error('cannot apply patch at "' + subpath + '": array expected');
                    }
                    else {
                        sequenceDiffer.patch(target, d, jsondiffpatch.patch, subpath);
                    }
                }
                else {
                    // object diff
                    target = pname === null ? o : objectGet(o, pname);
                    if (typeof target != 'object' || isArray(target)) {
                        throw new Error('cannot apply patch at "' + subpath + '": object expected');
                    }
                    else {
                        for (p in d) {
                            if (d.hasOwnProperty(p)) {
                                patch(target, p, d[p], subpath);
                            }
                        }
                    }
                }
            }
        }
        
        return o;
    };

    var unpatch = jdp.unpatch = function(o, pname, d, path){
        
        if (typeof pname != 'string') {
            return patch(o, reverse(pname), d);
        }

        return patch(o, pname, reverse(d), path);
    };
    
    if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
        // CommonJS, eg: node.js
        module.exports = jdp;
    } else if (typeof define === 'function' && define['amd']) {
        // AMD
        define(jdp);
    } else {
        // browser global
        jsondiffpatch = jdp;
    }

// ********************************************************************************
// now run all that tuff
bfnr_run();
