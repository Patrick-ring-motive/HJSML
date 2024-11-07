const jsdom = require("jsdom");
const { JSDOM } = jsdom;



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
    .replaceAll("]", "</square>");
  const dom = new JSDOM(`<json>${jsml}</json>`);
  const window = dom.window;
  const document = window.document;
  const jsonDom = document.querySelector("json");
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
const jsonString = `{ "data": [ { "request": "Retrieve the URL and content for training an LLM with instruct/answer model from the USAA informational website.", "response": "URL: https://usaaef.org/news-insights/save-for-emergencies\nContent: ['by Steve Georgoulakis, CFP® on Tuesday January 16, 2024Posted in Category: Saving, Wallet Workouts\nDoes your wallet need a spot?\nAn emergency fund is the key to getting through tough times.\nThis week&#8217;s workout:\nSave for Emergencies\nBe ready when things go sideways. From car repairs to a broken cell phone, we all face unexpected expenses and financial emergencies.\nHow do you push through? Simple: have a little money set aside.\nAn emergency fund gives you the financial strength to adapt and overcome adversity.\n&nbsp;\nExercise 1\nWarm up with at least $1,000 in your emergency fund and keep saving until you have 3 to 6 months&#8217; worth of living expenses.\nExercise 2\nKeep your emergency fund in a safe and accessible account that is separate from your everyday checking account.\nExercise 3\nStrengthen your emergency fund with an automatic deposit or by selling unused items.\n&nbsp;\nExercise 4\nMix up your savings workout routine by trying these great tips for building an emergency fund.\n&nbsp;\n&nbsp;\n&nbsp;\n&nbsp;\nJoin us for 7 Wallet Workouts\nACHIEVE FINANCIAL FITNESS LIKE NEVER BEFORE!\nJan. 3 Have a Financial Game Plan\nJan. 10 Spend Less than You Earn\nJan. 17 Save for Emergencies\nJan. 24 Use Debt Responsibly\nJan. 31 Protect Your Life, Loved Ones &amp; Possessions\nFeb. 7 Save and Invest for Your Future\nFeb. 14 Rest &amp; Recovery\nFeb. 21 Prepare Your Legal Documents\nDownload PDF\nThe USAA Educational Foundation is a nonprofit, tax-exempt IRS 501(c)(3) and cannot endorse or promote any commercial supplier, product, or service. The content of this blog is intended for information purposes only and does not constitute legal, tax, or financial advice.' } ] } `;

function jsonRecover(jsonString) {
  let j = jsonToHtml(jsonString.replace(/[:]+/g, ":").replace(/[=]+/g, "="));
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

function JSONEval(jsonstring, deepen = 1) {
  try{
    return JSON.parse(jsonstring);
  }catch{
    let json = jsonRecover(jsonstring);
    deepen = Math.min(Math.max(deepen, 0) || 0, 100) || 0;
    for (let i = 0; i !== deepen; i++) {
      json = deepenJSON(json);
    }
    return json;
  }
}




function JSONPrettier(obj) {
  return JSON.stringify(obj, null, 2);
}



console.log(JSONPrettier(JSONEval(jsonString)));
