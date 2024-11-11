if (!globalThis.window && !globalThis.JSDOM) {
  if (globalThis.XMLHttpRequest) {
    let request = new XMLHttpRequest();
    request.open(
      "GET",
      "https://cdn.jsdelivr.net/npm/pako@2.1.0/dist/pako.min.js",
      false,
    );
    request.send(null);
    eval?.(request.responseText);
    request = new XMLHttpRequest();
    request.responseType = "arraybuffer";
    request.open(
      "GET",
      "https://raw.githubusercontent.com/Patrick-ring-motive/jsdom-bundle/refs/heads/main/bundles/kid-index.js.gz",
      false,
    );
    request.send(null);
    eval?.(pako.inflate(request.response, { to: "string" }));
  } else {
    globalThis.jsdom = require("jsdom");
  }
  globalThis.JSDOM = jsdom.JSDOM;
}

function isBlank(key) {
  return /^(|undefined|null)$/.test(String(key).trim());
}

function jsonToTxt(json) {
  return htmlToJson(jsonToHtml(json));
}

function jsonToHtml(json) {
  let jsml = json
    .replaceAll("{", "<curly>")
    .replaceAll("}", "</curly>")
    .replaceAll("[", "<square>")
    .replaceAll("]", "</square>")
    .replaceAll("(", "<square>")
    .replaceAll(")", "</square>");
  if (!globalThis.window) {
    const dom = new JSDOM(`<json>${jsml}</json>`);
    const window = dom.window;
    const document = window.document;
    const jsonDom = document.querySelector("json");
    jsonDom.innerHTML = `<curly>${jsonDom.innerHTML}</curly>`;
    return jsonDom;
  }
  const jsonDom = document.createElement("json");
  jsonDom.innerHTML = jsml;
  jsonDom.innerHTML = `<curly>${jsonDom.innerHTML}</curly>`;
  return jsonDom;
}

function htmlToJson(html) {
  return html.innerHTML
    .toString()
    .replaceAll("<curly>", "{")
    .replaceAll("</curly>", "}")
    .replaceAll("<square>", "[")
    .replaceAll("</square>", "]");
}

let json = `{
  "name":"nodejs",
  "version":"1.0.0
  `;


function jsonRecover(jsonString) {
  let j = jsonToHtml(
    jsonString
      .replace(/[:]+/g, ":")
      .replace(/[=]+/g, "=")
      .replaceAll("=>", "=")
      .replaceAll(">=", "=")
      .replaceAll("<=", "=")
      .replaceAll("+=", "=")
      .replaceAll("-=", "=")
      .replaceAll(":=", "=")
      .replaceAll("->", "="),
  );
  let curls = [...j.querySelectorAll("curly")];
  for (let i = 0; i < curls.length; i++) {
    let childNodes = [...curls[i].childNodes];
    for (let x = 0; x < childNodes.length; x++) {
      if (childNodes[x].nodeName == "#text") {
        const vals = childNodes[x].nodeValue.split(",");
        for (let y = 0; y < vals.length; y++) {
          let pair = vals[y].split(":");
          if (!/[:]/.test(vals[y]) && /[=]/.test(vals[y])) {
            pair = vals[y].split("=");
          }
          const key = pair
            .shift()
            .trim()
            .replace(/^["'\s]*/g, "")
            .replace(/["'\s]*$/g, "");
          const value = pair
            .join(":")
            .trim()
            .replace(/^["'\s:]*/g, "")
            .replace(/["'\s:]*$/g, "");
          vals[y] = { key: key, value: value };
        }
        childNodes[x] = vals.filter(
          (x) => !(isBlank(x?.key) && isBlank(x?.value)),
        );
      }
    }
    for (let x = 0; x < childNodes.length; x++) {
      if (!childNodes[x].nodeName) {
        const last = childNodes[x][childNodes[x].length - 1];
        if (!isBlank(last?.key) && isBlank(last?.value)) {
          if (childNodes[x + 1]?.nodeName) {
            last.value = childNodes[x + 1];
            childNodes[x + 1].nodeKey = last.key;
          }
        }
      }
    }
    curls[i].jsonList = childNodes.filter((x) => !x.nodeKey).flat();
    childNodes = [...curls[i].jsonList];
    for (let x = 0; x < childNodes.length; x++) {
      if (childNodes[x].tagName) {
        let akey = String(childNodes[x - 1]?.value?.trim?.());
        if (/\s/.test(akey)) {
          childNodes[x] = {
            key: [...akey.split(/\s/)].pop(),
            value: childNodes[x],
          };
        }
      }
    }
    for (let x = 0; x < childNodes.length; x++) {
      if (!childNodes[x].tagName) {
        if (
          childNodes[x - 1] &&
          isBlank(childNodes[x - 1]?.value) &&
          !isBlank(childNodes[x]?.value) &&
          isBlank(childNodes[x]?.key)
        ) {
          childNodes[x - 1].value = childNodes[x].value;
          childNodes[x].value = null;
          childNodes[x].removeMe = true;
        }
      }
    }
    curls[i].jsonList = childNodes
      .filter((x) => !x.nodeKey)
      .filter((x) => !x.removeMe);
  }

  let squares = [...j.querySelectorAll("square")];
  for (let i = 0; i < squares.length; i++) {
    let childNodes = [...squares[i].childNodes];
    for (let x = 0; x < childNodes.length; x++) {
      if (childNodes[x].nodeName == "#text") {
        const vals = childNodes[x].nodeValue.split(",");
        for (let y = 0; y < vals.length; y++) {
          vals[y] = vals[y].replace(/^["'\s]*/g, "").replace(/["'\s]*$/g, "");
        }
        childNodes[x] = vals;
      }
    }
    squares[i].jsonList = childNodes.flat();
    childNodes = [...squares[i].jsonList];
    if (childNodes.length == 1 && !childNodes[0]?.tagName) {
      if (/[;]/.test(String(childNodes[0]))) {
        squares[i].jsonList = childNodes[0].split(";").map((x) => x.trim());
      } else if (/[\n]/.test(String(childNodes[0]))) {
        squares[i].jsonList = childNodes[0].split("\n").map((x) => x.trim());
      } else if (/[\s]/.test(String(childNodes[0]))) {
        squares[i].jsonList = childNodes[0].split(/\n/).map((x) => x.trim());
      }
    }
  }
  let tally = [];
  const root = j.firstElementChild;
  function traverse(node) {
    if (tally.includes(node)) {
      return;
    }
    tally.push(node);
    if (node?.nodeName?.toLowerCase?.() == "square") {
      return node.jsonList
        .map((x) => (x?.jsonList ? traverse(x) : x))
        .filter((x) => x !== "");
    }
    const obj = {};
    for (let i = 0; i < node.jsonList?.length; i++) {
      const key = node.jsonList[i].key;
      const value = node.jsonList[i].value;
      if (key) {
        obj[key] = value.jsonList ? traverse(value) : value;
      } else if (node.jsonList[i].tagName) {
        obj[node.jsonList[i].tagName + i] = traverse(node.jsonList[i]);
      }
    }
    return obj;
  }
  let jsonObj = traverse(root);
  jsonObj = jsonObj?.CURLY0 ?? jsonObj;
  return jsonObj;
}

function isString(str) {
  return typeof str === "string" || str instanceof String;
}

function deepenJSON(json) {
  for (const key in json) {
    if (json[key] instanceof Array) {
      if (json[key].length == 1 && isString(json[key][0])) {
        if (json[key][0].includes(",")) {
          json[key] = json[key].split(",");
          json[key] = deepenJSON(json[key]);
        } else if (json[key][0].includes(";")) {
          json[key] = json[key].split(";");
          json[key] = deepenJSON(json[key]);
        } else if (json[key][0].includes("\n")) {
          json[key] = json[key].split("\n");
          json[key] = deepenJSON(json[key]);
        }
      }
    }
    if (isString(json[key])) {
      if (json[key].includes(",")) {
        json[key] = json[key].split(",");
        json[key] = deepenJSON(json[key]);
      } else if (json[key].includes(";")) {
        json[key] = json[key].split(";");
        json[key] = deepenJSON(json[key]);
      } else if (json[key].includes("\n")) {
        json[key] = json[key].split("\n");
        json[key] = deepenJSON(json[key]);
      } else if (json[key].includes(":=")) {
        const splits = json[key].split(":=");
        const obj = {};
        obj[splits.shift().trim()] = splits.join(":=").trim();
        json[key] = deepenJSON(json[key]);
        json[key] = deepenJSON(json[key]);
      } else if (json[key].includes(":")) {
        const splits = json[key].split(":");
        const obj = {};
        obj[splits.shift().trim()] = splits.join(":").trim();
        json[key] = obj;
        json[key] = deepenJSON(json[key]);
      } else if (json[key].includes("=>")) {
        const splits = json[key].split("=>");
        const obj = {};
        obj[splits.shift().trim()] = splits.join("=>").trim();
        json[key] = obj;
        json[key] = deepenJSON(json[key]);
      } else if (json[key].includes("=")) {
        const splits = json[key].split("=");
        const obj = {};
        obj[splits.shift().trim()] = splits.join("=").trim();
        json[key] = obj;
        json[key] = deepenJSON(json[key]);
      }
    }
    if (typeof json[key] === "object") {
      json[key] = deepenJSON(json[key]);
    }
  }
  return json;
}

function lightenJSON(ljson) {
  const track = [];
  function lighten(json) {
    let last = null;
    for (let key in json) {
      if (json[key] instanceof Array) {
        if (json[key].length === 2 && isString(json[key][0])) {
          const obj = {};
          obj[json[key][0]] = json[key][1];
          json[key] = obj;
        }
        if (json[key].length === 1) {
          json[key] = json[key][0];
        }
      } else if (typeof json[key] === "object") {
        const test = Object.entries(json[key]);
        if (test.length === 1 && /^SQUARE[0-9]+$/.test(test[0][0])) {
          json[key] = test[0][1];
        }
        if (test.length === 1 && /^CURLY[0-9]+$/.test(key)) {
          json[test[0][0]] = test[0][1];
          delete json[key];
          key = test[0][0];
          lighten(json);
        } else if (/^CURLY[0-9]+$/.test(key)) {
          if (isString(json[last])) {
            const obk = {};
            obk[json[last]] = json[key];
            json[last] = obk;
            delete json[key];
            key = last;
          }
        }
      }
      last = key;
      if (track.includes(json[key])) {
        continue;
      }
      track.push(json[key]);
      lighten(json[key]);
    }
    return json;
  }

  ljson = lighten([ljson]);
  return ljson[0];
}

function JSONEval(jsonstring, deepen = 1) {
  try {
    return JSON.parse(jsonstring);
  } catch {
    let json = jsonRecover(jsonstring);
    deepen = Math.min(Math.max(deepen, 0) || 0, 100) || 0;
    for (let i = 0; i !== deepen; i++) {
      json = deepenJSON(json);
    }
    return lightenJSON(json);
  }
}

function JSONPrettier(obj) {
  return JSON.stringify(obj, null, 2);
}
/*let h = new Map();
h.set("Content-Type", "application/json");
console.log(
  require("util").inspect(h),
  JSONPrettier(JSONEval(require("util").inspect(process))),
);
*/