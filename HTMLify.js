function HTMLify(obj) {
  let x;

  try {
    x = String(JSON.stringify(obj));
  } catch {
    x = String(JSON.stringify(Object(obj)));
  }

  x = x
    .replace(
      /["]([^"]+)["][:]["]([^"]+)["][,]/g,
      "<$1><$2></$2></$1>",
    )

    .replace(/["]([^"]+)["][,]/g, "<$1></$1>")
    .replace(/["]([^"]+)["]/g, "<$1>")
    .replace(/[\[\]:\{\}",]/g, "");
  const json = document.createElement("json");

  json.innerHTML = x;

  return json;
}
