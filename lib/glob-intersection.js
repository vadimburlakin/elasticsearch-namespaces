/**
 * Functions to check whether two glob patterns intersect.
 *
 * @module  lib/global-intersection
 */

const TokenType = {
  Char: 'C',
  Single: '?',
  Set: 'S',
  AnyString: '*',
  Unknown: '!'
};

class Token {

  constructor(val, type, prevToken) {
    this.val = val;
    this.type = type;
    this.index = -1;

    // shared end points
    this.endPoints = { head: this, tail: this };
    this.next = null;
    this.prev = null;

    if (prevToken) {
      if (prevToken.next) throw ('Previous already connected');
      prevToken.next = this;
      this.prev = prevToken;
      this.index = prevToken.index + 1;
      this.endPoints = prevToken.endPoints;
      this.endPoints.tail = this;
    }
  }

  removePrev() {
    this.prev = null;
    this.endPoints.head = this;
    return this;
  }

  removeNext() {
    this.next = null;
    this.endPoints.tail = this;
    return this;
  }

  toString() {
    let str = this.index + '. ';
    switch (this.type) {
      case TokenType.Single: str += '?'; break;
      case TokenType.Set: str += '[' + this.val.replace(']', '\\]') + ']'; break;
      case TokenType.Char: str += '\'' + this.val.replace('\'', '\\\'') + '\''; break;
      case TokenType.AnyString: str += '*'; break;
    }
    return str;
  }

}

class CompareResult {

  constructor(leftNext, rightNext, isGood) {
    this.leftNext = leftNext;
    this.rightNext = rightNext;
    this.isGood = (isGood === false) ? false : true;
  }

  swapTokens() {
    let temp = this.leftNext;
    this.leftNext = this.rightNext;
    this.rightNext = temp;
    return this;
  }

}

CompareResult.BadResult = new CompareResult(null, null, false);

function intersectsTrue(left, right) {
  let lt, rt,
    result = new CompareResult(null, null, true);


  lt = (!left || left instanceof Token) ? left : tokenize(left);
  rt = (!right || right instanceof Token) ? right : tokenize(right);

  while (result.isGood && (lt || rt)) {
    result = tokensCompare(lt, rt);

    lt = result.leftNext;
    rt = result.rightNext;
  }

  return result;
}

function intersects(left, right) {
  let lt, rt,
    result = new CompareResult(null, null, true);

  lt = (!left || left instanceof Token) ? left : tokenize(left);
  rt = (!right || right instanceof Token) ? right : tokenize(right);

  let loopLog = [];

  while ((lt || rt) && result.isGood) {
    loopLog.push({
      lt: (lt) ? lt.toString() : null,
      rt: (rt) ? rt.toString() : null,
      result: null,
      leftNext: null,
      rightNext: null
    });

    result = tokensCompare(lt, rt);

    if (result.log) loopLog = loopLog.concat(result.log);

    loopLog[loopLog.length - 1].result = result.isGood;
    if (result.leftNext) loopLog[loopLog.length - 1].leftNext = result.leftNext.toString();
    if (result.rightNext) loopLog[loopLog.length - 1].rightNext = result.rightNext.toString();

    lt = result.leftNext;
    rt = result.rightNext;
  }

  if (lt || rt) loopLog.push({
    lt: (lt) ? lt.toString() : null,
    rt: (rt) ? rt.toString() : null,
    result: false,
    leftNext: null,
    rightNext: null
  });

  // want to return distinct result to add log too (bad result was sharing);
  result = new CompareResult(result.leftNext, result.rightNext, result.isGood);
  result.log = loopLog;
  return result;
}

function tokensCompare(lt, rt) {
  if (!lt && rt) return tokensCompare(rt, lt).swapTokens();

  switch (lt.type) {
    case TokenType.Char: return charCompare(lt, rt);
    case TokenType.Single: return singleCompare(lt, rt);
    case TokenType.Set: return setCompare(lt, rt);
    case TokenType.AnyString: return anyCompare(lt, rt);
  }
}

function anyCompare(tAny, tOther) {
  if (!tOther) return new CompareResult(tAny.next, null);

  let result = CompareResult.BadResult;

  while (tOther && !result.isGood) {
    while (tOther && !result.isGood) {
      switch (tOther.type) {
        case TokenType.Char: result = charCompare(tOther, tAny.next).swapTokens(); break;
        case TokenType.Single: result = singleCompare(tOther, tAny.next).swapTokens(); break;
        case TokenType.Set: result = setCompare(tOther, tAny.next).swapTokens(); break;
        case TokenType.AnyString:
          // the anyCompare from the intersects will take over the processing.
          result = intersects(tAny, tOther.next);
          if (result.isGood) return result;
          result = intersects(tOther, tAny.next).swapTokens();
          if (result.isGood) return result;
          return CompareResult.BadResult;
      }

      if (!result.isGood) tOther = tOther.next;
    }

    if (result.isGood) {
      // we've found a starting point, but now we want to make sure this will always work.
      result = intersects(result.leftNext, result.rightNext);
      if (!result.isGood) tOther = tOther.next;
    }
  }

  // If we never got a good result that means we've eaten everything.
  if (!result.isGood) result = new CompareResult(tAny.next, null, true);

  return result;
}

function charCompare(tChar, tOther) {
  if (!tOther) return CompareResult.BadResult;

  switch (tOther.type) {
    case TokenType.Char: return charCharCompare(tChar, tOther);
    case TokenType.Single: return new CompareResult(tChar.next, tOther.next);
    case TokenType.Set: return setCharCompare(tOther, tChar).swapTokens();
    case TokenType.AnyString: return anyCompare(tOther, tChar).swapTokens();
  }

}

function singleCompare(tSingle, tOther) {
  if (!tOther) return CompareResult.BadResult;

  switch (tOther.type) {
    case TokenType.Char: return new CompareResult(tSingle.next, tOther.next);
    case TokenType.Single: return new CompareResult(tSingle.next, tOther.next);
    case TokenType.Set: return new CompareResult(tSingle.next, tOther.next);
    case TokenType.AnyString: return anyCompare(tOther, tSingle).swapTokens();
  }
}
function setCompare(tSet, tOther) {
  if (!tOther) return CompareResult.BadResult;

  switch (tOther.type) {
    case TokenType.Char: return setCharCompare(tSet, tOther);
    case TokenType.Single: return new CompareResult(tSet.next, tOther.next);
    case TokenType.Set: return setSetCompare(tSet, tOther);
    case TokenType.AnyString: return anyCompare(tOther, tSet).swapTokens();
  }
}

function anySingleCompare(tAny, tSingle) {
  let nextResult = (tAny.next) ? singleCompare(tSingle, tAny.next).swapTokens() :
    new CompareResult(tAny, tSingle.next);
  return (nextResult.isGood) ? nextResult: new CompareResult(tAny, tSingle.next);
}

function anyCharCompare(tAny, tChar) {
  let nextResult = (tAny.next) ? charCompare(tChar, tAny.next).swapTokens() :
    new CompareResult(tAny, tChar.next);

  return (nextResult.isGood) ? nextResult : new CompareResult(tAny, tChar.next);
}

function charCharCompare(litA, litB) {
  return (litA.val === litB.val) ?
    new CompareResult(litA.next, litB.next) : CompareResult.BadResult;
}

function setCharCompare(tSet, tChar) {
  return (tSet.val.indexOf(tChar.val) > -1) ?
    new CompareResult(tSet.next, tChar.next) : CompareResult.BadResult;
}

function setSetCompare(tSetA, tSetB) {
  let setA = tSetA.val,
    setB = tSetB.val;

  for (let i = 0, il = setA.length; i < il; i++) {
    if (setB.indexOf(setA.charAt(i)) > -1) return new CompareResult(tSetA.next, tSetB.next);
  }
  return CompareResult.BadResult;
}

// returns starting token
function tokenize(pattern) {
  let tokenizer = /(\\.)|([^*?[\\])|(\*)|(\?)|(\[(?:\\\]|[^\]])*\])/gi;
  let match;
  let cur = new Token('', TokenType.Unknown, null);
  let val;

  while ((match = tokenizer.exec(pattern))) {
    for (let i = 1, il = match.length; i < il; i++) {
      if (match[i]) {
        val = match[0];

        switch (i) {
          case 1:
            val = val.charAt(1);
            switch (val) {
              case 't': val = '\t'; break;
              case 'r': val = '\r'; break;
              case 'n': val = '\n'; break;
              case 'b': val = '\b'; break;
              case 'f': val = '\f'; break;
              case 'v': val = '\v'; break;
            }
            cur = new Token(val, TokenType.Char, cur);
            break;
          case 2:
            cur = new Token(val, TokenType.Char, cur);
            break;
          case 3:
            if (cur.type !== TokenType.AnyString) {
              cur = new Token(val, TokenType.AnyString, cur);
            }
            break;
          case 4: cur = new Token(val, TokenType.Single, cur); break;
          case 5:
            cur = new Token(val.substring(1, val.length - 1).replace('\\]', ']'), TokenType.Set, cur);
            break;
        }
        break;
      }
    }
  }

  // advance endpoints to true start;
  if ((cur = cur.endPoints.head.next)) {
    return cur.removePrev();
  }

  // empty pattern
  return null;
}

exports = module.exports = function testPattern(left, right) {
  return intersects(left, right);
}