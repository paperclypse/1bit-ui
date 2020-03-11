function $$(selector, element = document) {
  return Array.from(element.querySelectorAll(selector));
}

function $(selector, element = document) {
  return element.querySelector(selector);
}

class TableOfContentsElement extends HTMLElement {
  connectedCallback() {
    this.classList.add("bit-card", "site-toc");
    for (const h2 of $$("h2")) {
      const a = document.createElement("a");
      a.href = `#${h2.id}`;
      a.textContent = h2.textContent;
      a.className = "bit-link";
      this.appendChild(a);
      h2.innerHTML = `<a href="#${h2.id}" class="site-link-header">${h2.innerHTML}</a>`;
    }
  }
}

customElements.define("table-of-contents", TableOfContentsElement);

function htmlToCode(code) {
  const lines = code
    .replace(/^\n*/, "")
    .replace(/\s+$/, "")
    .split("\n");
  const match = lines[0].match(/^[ ]*/);
  if (match) {
    // TODO: This is dangerous; we should only remove an equivalent amount
    // of trailing whitespace, not just any arbitrary chunk of `length`
    // characters...
    const length = match[0].length;
    for (const [index, value] of lines.entries()) {
      lines[index] = value.slice(length);
    }
  }
  return lines.join("\n");
}

function cleanCSSPropertyValue(value) {
  return value.trim();
}

const bitRoot = $(".bit-root");
const baseCustomProperties = {};
const bitRootStyle = getComputedStyle(bitRoot);

for (const value of Object.values(bitRootStyle)) {
  if (value.startsWith("--bit-")) {
    baseCustomProperties[value] = cleanCSSPropertyValue(
      bitRootStyle.getPropertyValue(value) || ""
    );
  }
}

function getCustomProperties(element) {
  return (
    element.dataset.injectExampleProperties ||
    element.dataset.customProperties ||
    element.getAttribute("properties") ||
    ""
  )
    .trim()
    .split(/\s+/)
    .filter(x => x);
}

function initializeCustomPropertyEditor(properties, propertyEditor) {
  propertyEditor.className = "bit-card site-property-editor";
  const title = document.createElement("h3");
  title.className = "site-property-editor-title";
  title.textContent = "CSS Custom Properties";
  propertyEditor.appendChild(title);
  const grid = document.createElement("div");
  grid.className = "site-property-editor-grid";
  propertyEditor.appendChild(grid);
  for (const prop of properties) {
    const label = document.createElement("label");
    label.textContent = prop;
    const input = document.createElement("input");
    input.className = "bit-input";
    input.placeholder = baseCustomProperties[prop];
    input.addEventListener(
      "input",
      event => {
        bitRoot.style.setProperty(prop, event.target.value);
      },
      false
    );
    grid.appendChild(label);
    grid.appendChild(input);
  }
  return propertyEditor;
}

class InjectExampleElement extends HTMLElement {
  connectedCallback() {
    this.classList.add("site-example");
    const name = this.dataset.injectExample || this.getAttribute("example");
    const template = document.getElementById(`template-${name}`);
    const div = document.createElement("div");
    div.dataset.exampleName = name;
    div.dataset.exampleType = "result";
    div.appendChild(template.content.cloneNode(true));
    const divH3 = document.createElement("h3");
    divH3.textContent = "Example";
    const pre = document.createElement("pre");
    pre.className = "bit-pre";
    pre.textContent = htmlToCode(template.innerHTML);
    pre.dataset.exampleName = name;
    pre.dataset.exampleType = "html";
    const preH3 = document.createElement("h3");
    preH3.textContent = "Code";
    const properties = getCustomProperties(this);
    if (properties.length > 0) {
      const propertyEditor = document.createElement("div");
      initializeCustomPropertyEditor(properties, propertyEditor);
      this.insertAdjacentElement("beforeend", propertyEditor);
    }
    this.insertAdjacentElement("beforeend", divH3);
    this.insertAdjacentElement("beforeend", div);
    this.insertAdjacentElement("beforeend", preH3);
    this.insertAdjacentElement("beforeend", pre);
  }
}

customElements.define("inject-example", InjectExampleElement);

class CustomPropertiesEditorElement extends HTMLElement {
  connectedCallback() {
    initializeCustomPropertyEditor(getCustomProperties(this), this);
  }
}

customElements.define(
  "custom-properties-editor",
  CustomPropertiesEditorElement
);
