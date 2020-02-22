export function $$(selector, element = document) {
  return Array.from(element.querySelectorAll(selector));
}

export function $(selector, element = document) {
  return element.querySelector(selector);
}
