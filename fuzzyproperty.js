const lcs = function lcs(seq1, seq2) {
  "use strict";
  let arr1 = [...seq1??[]];
  let arr2 = [...seq2??[]];
  if (arr2.length > arr1.length) {
    [arr1, arr2] = [arr2, arr1];
  }
  const dp = Array(arr1.length + 1).fill(0).map(() => Array(arr2.length + 1).fill(0));
  const dp_length = dp.length;
  for (let i = 1; i !== dp_length; i++) {
    const dpi_length = dp[i].length;
    for (let x = 1; x !== dpi_length; x++) {
      if (arr1[i - 1] === arr2[x - 1]) {
        dp[i][x] = dp[i - 1][x - 1] + 1
      } else {
        dp[i][x] = Math.max(dp[i][x - 1], dp[i - 1][x])
      }
    }
  }
  return dp[arr1.length][arr2.length]
};
const wordMatch = function wordMatch(str1, str2) {
  return lcs(str1, str2) >= Math.floor(0.8 * Math.max(str1?.length ?? 0, str2?.length ?? 0));
}

function isNullish(x){
  return x == null;
}

function fuzzProp(obj, prop){
  if(isNullish(obj)){
    return null;
  }
  if(!isNullish(obj[prop])){
    return obj.prop;
  }
  const lowProp = prop.toLowerCase();
  for(const key in obj){
    if((key.toLowerCase() == lowProp) && !isNullish(obj[key])){
      return obj[key];
    }
  }
  const names = Object.getOwnPropertyNames(obj);
  for(const key of names){
    if((key.toLowerCase() == lowProp) && !isNullish(obj[key])){
      return obj[key];
    }
  }
  const syms = Object.getOwnPropertySymbols(obj);
  for(const key of syms){
    if((String(key.description).toLowerCase() == lowProp) && !isNullish(obj[key])){
      return obj[key];
    }
  }
  for(const key in obj){
    if(wordMatch(key.toLowerCase(),lowProp) && !isNullish(obj[key])){
      return obj[key];
    }
  }
  for(const key of names){
    if(wordMatch(key.toLowerCase(),lowProp) && !isNullish(obj[key])){
      return obj[key];
    }
  }
  for(const key of syms){
    if(wordMatch(String(key.description).toLowerCase(),lowProp) && !isNullish(obj[key])){
      return obj[key];
    }
  }
}


let obj={
  'cheeses':7
};

console.log(fuzzProp(obj,'cheese'));