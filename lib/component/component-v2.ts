import { DIRECTIVE_PREFIX } from "../directives/constants";
import { applyDirectives } from "../directives/directives";
import { ReactivityEvent } from "../events";
import { createSignal } from "../reactivity";

type SignalTuple<T> = ReturnType<typeof createSignal<T>>;

type Component = {
  id: string;
  name?: string;
  reactiveEvent: ReactivityEvent;
  reactiveData: Map<string, SignalTuple<any>>;
};

const componentRegistry = new Map<string, Component>();

const createComponent = (name?: string): Component => {
  const id = crypto.randomUUID();
  return {
    id,
    ...(name && { name }),
    reactiveEvent: new ReactivityEvent(id),
    reactiveData: new Map(),
  };
};

export const getComponentById = (id: string): Component => {
  const component = componentRegistry.get(id);
  if (!component) {
    throw new Error(`Component with id ${id} not found`);
  }
  return component;
};

export const getReactiveData = <T>(
  component: Component,
  key: string
): SignalTuple<T> => {
  const signal = component.reactiveData.get(key);
  if (!signal) {
    throw new Error(
      `Reactive data "${key}" not found in component ${component.id}`
    );
  }
  return signal as SignalTuple<T>;
};

export const getComponentsByName = (name: string): Component[] => {
  const components: Component[] = [];
  componentRegistry.forEach((component) => {
    if (component.name === name) {
      components.push(component);
    }
  });
  return components;
};

const isEmptyObject = (obj: object): boolean => {
  return Object.keys(obj).length === 0;
};

export const initializeComponents = (): void => {
  document.querySelectorAll("[reactive]").forEach((element) => {
    if (!(element instanceof HTMLElement)) return;

    const component = createComponent(
      element.getAttribute("reactive") ?? undefined
    );

    if (element.hasAttribute(DIRECTIVE_PREFIX + "data")) {
      const dataAttr = element.getAttribute(DIRECTIVE_PREFIX + "data");
      if (!dataAttr) {
        throw new Error(
          'Invalid data, please provide data in format fly-data="{prop: value}"'
        );
      }

      try {
        const data = new Function(`return ${dataAttr}`)();
        if (typeof data === "object" && data !== null && !isEmptyObject(data)) {
          Object.entries(data).forEach(([key, value]) => {
            if (value != null) {
              component.reactiveData.set(key, createSignal(value));
            }
          });
        } else {
          console.warn(
            "Invalid or empty object provided in fly-data attribute"
          );
          return;
        }
      } catch (error) {
        console.error(`Error parsing data attribute: ${dataAttr}`, error);
        return;
      }
    }

    componentRegistry.set(component.id, component);
    element.setAttribute("data-reactive-id", component.id);
    applyDirectives(element);
  });
};
