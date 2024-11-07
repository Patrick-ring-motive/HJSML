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


