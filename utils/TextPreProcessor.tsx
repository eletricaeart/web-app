export function processTextToHtml(text: string) {
  if (!text) return "";
  let lines = text.split("\n");
  let inTagC = false;
  let inUl = false;
  let htmlResult: string[] = [];

  lines.forEach((line) => {
    const tl = line.trim();

    if (tl.startsWith("> ")) {
      if (inUl) {
        htmlResult.push(`</ul>`);
        inUl = false;
      }
      if (!inTagC) {
        htmlResult.push(`<div class="tagc">`);
        inTagC = true;
      }
      htmlResult.push(`<div>${line.substring(2)}</div>`);
    } else if (tl.startsWith("- ") || tl.startsWith("* ")) {
      if (inTagC) {
        htmlResult.push(`</div>`);
        inTagC = false;
      }
      if (!inUl) {
        htmlResult.push(`<ul>`);
        inUl = true;
      }
      htmlResult.push(`<li>${line.substring(2)}</li>`);
    } else {
      if (inTagC) {
        htmlResult.push(`</div>`);
        inTagC = false;
      }
      if (inUl) {
        htmlResult.push(`</ul>`);
        inUl = false;
      }

      if (tl.startsWith("# ")) {
        htmlResult.push(`<div class="editor-h3">${line.substring(2)}</div>`);
      } else if (tl === "---") {
        htmlResult.push(`<hr class="editor-hr">`);
      } else {
        htmlResult.push(`<div>${line || "&nbsp;"}</div>`);
      }
    }
  });

  if (inTagC) htmlResult.push(`</div>`);
  if (inUl) htmlResult.push(`</ul>`);

  return htmlResult.join("");
}
