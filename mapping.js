function errMap(arr, ...args) {
  arr = [...arr];
  const arr_length = arr.length;
  for (let i = 0; i !== arr_length; i++) {
    try {
      arr[i] = [arr[i]].map(...args);
    } catch (e) {
      arr[i] = e;
    }
  }
  return arr;
}

function tryMap(arr, ...args) {
  arr = [...arr];
  const arr_length = arr.length;
  for (let i = 0; i !== arr_length; i++) {
    try {
      arr[i] = [arr[i]].map(...args);
    } catch {
      continue;
    }
  }
  return arr;
}

