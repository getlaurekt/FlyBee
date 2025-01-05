import { DIRECTIVE_PREFIX } from "./constants";

type DirectiveHandler = (
  element: HTMLElement,
  value: unknown
) => void | (() => void);

type DirectiveStore = Map<string, DirectiveHandler>;

const directives: DirectiveStore = new Map();

export function directive(name: string, handler: DirectiveHandler) {
  const directiveName = name.startsWith(DIRECTIVE_PREFIX)
    ? name
    : `${DIRECTIVE_PREFIX}${name}`;
  if (directives.has(directiveName)) {
    throw new Error(`Directive ${directiveName} already exists`);
  } else {
    directives.set(directiveName, handler);
  }
}

export function applyDirectives(element: HTMLElement) {
  const cleanupFns: (() => void)[] = [];

  const attributes = Array.from(element.attributes);
  attributes.forEach((attr) => {
    if (attr.name.startsWith(DIRECTIVE_PREFIX)) {
      const handler = directives.get(attr.name);
      if (handler) {
        const cleanup = handler(element, attr.value);
        if (cleanup) cleanupFns.push(cleanup);
      }
    }
  });

  Array.from(element.children).forEach((child) => {
    if (child instanceof HTMLElement) {
      applyDirectives(child);
    }
  });

  return () => cleanupFns.forEach((fn) => fn());
}

directive("text", (el, value) => {
  el.textContent = String(value);
});
