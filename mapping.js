function errMap(arr, mapper, ...args) {
  arr = [...arr];
  return arr.map((item, index, array) => {
    try {
      return mapper(item, index, array, ...args);
    } catch (e) {
      return e;
    }
  });
}

function tryMap(arr, mapper, ...args) {
  arr = [...arr];
  return arr.map((item, index, array) => {
    try {
      return mapper(item, index, array, ...args);
    } catch {
      return item;
    }
  });
}

function objoin(obj={},delim1=',',delim2=delim1){
   return Object.entries(obj).map(x=>x.join(delim1)).join(delim2);
}
