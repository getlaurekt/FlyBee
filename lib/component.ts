import { createSignal, createEffect } from "./reactivity";

type Props = Record<string, any>;
type CleanupFunction = () => void;

interface VNode {
  type: string;
  props?: Record<string, any>;
  children?: Array<VNode | string | (() => string)>;
}

function h(
  type: string,
  props: Record<string, any> = {},
  ...children: Array<VNode | string | (() => string)>
): VNode {
  // Evaluate functions in children immediately if they're not reactive
  const processedChildren = children.map((child) => {
    if (typeof child === "function") {
      return child;
    }
    return child;
  });
  return { type, props, children: processedChildren };
}

function renderVNode(
  node: VNode | string | (() => string | number)
): HTMLElement | Text {
  if (typeof node === "function") {
    const text = document.createTextNode("");
    createEffect(() => {
      const value = node();
      text.textContent = String(value);
    });
    return text;
  }
  if (typeof node === "string") {
    return document.createTextNode(node);
  }
  const el = document.createElement(node.type);
  if (node.props) {
    Object.entries(node.props).forEach(([key, value]) => {
      if (key.startsWith("on") && typeof value === "function") {
        const eventName = key.slice(2).toLowerCase();
        el.addEventListener(eventName, value);
      } else {
        el.setAttribute(key, String(value));
      }
    });
  }
  node.children?.forEach((child) => {
    el.appendChild(renderVNode(child));
  });
  return el;
}

interface ComponentInstance {
  mount: (target: HTMLElement) => void;
  unmount: () => void;
}

function createComponent<P extends Props>(render: (props: P) => VNode) {
  return (initialProps: P): ComponentInstance => {
    let element: HTMLElement | null = null;
    const [getProps] = createSignal(initialProps);
    let cleanup: CleanupFunction | undefined;
    let effects: Array<CleanupFunction> = [];

    const cleanupEffects = () => {
      effects.forEach((cleanup) => cleanup?.());
      effects = [];
    };

    const renderWithTracking = () => {
      cleanupEffects();
      const vnode = render(getProps());
      const newElement = renderVNode(vnode);
      return newElement;
    };

    return {
      mount: (target: HTMLElement) => {
        cleanup = createEffect(() => {
          if (element) {
            const parent = element.parentNode;
            const next = element.nextSibling;
            element.remove();
            const newElement = renderWithTracking();
            if (newElement instanceof HTMLElement) {
              element = newElement;
              if (next) {
                parent?.insertBefore(newElement, next);
              } else {
                parent?.appendChild(newElement);
              }
            }
          } else {
            const newElement = renderWithTracking();
            if (newElement instanceof HTMLElement) {
              element = newElement;
              target.appendChild(newElement);
            }
          }
        });
      },
      unmount: () => {
        cleanup?.();
        cleanupEffects();
        element?.remove();
        element = null;
      },
    };
  };
}

export { createComponent, h };
