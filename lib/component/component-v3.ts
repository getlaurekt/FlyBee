import { DIRECTIVE_LIST, DIRECTIVE_PREFIX } from "../directives/constants";
import type { Directives } from "../directives/types";
import { applyDirectives } from "../directives/directives";
import { createSignal } from "../reactivity";

type SignalTuple<T> = ReturnType<typeof createSignal<T>>;

type Component = {
  id: string;
  name?: string;
  reactiveData: Map<string, SignalTuple<any>>;
};

const componentRegistry = new Map<string, Component>();

const createComponent = (name?: string): Component => {
  const id = crypto.randomUUID();
  return {
    id,
    ...(name && { name }),
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

export const useReactiveData = <T>(
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

export const getMatchingDirectives = (element: HTMLElement): Directives[] => {
  const attributes = Array.from(element.attributes);

  return attributes
    .map((attr) => attr.name)
    .filter((name): name is Directives => {
      if (!name.startsWith(DIRECTIVE_PREFIX)) return false;

      const directiveName = name.slice(DIRECTIVE_PREFIX.length) as Directives;
      return DIRECTIVE_LIST.includes(directiveName);
    });
};

export const findMatchingDirectiveProperties = (
  element: HTMLElement,
  reactiveData: Record<string, any>
): Map<Directives, string[]> => {
  const matches = new Map<Directives, string[]>();
  const dataProperties = Object.keys(reactiveData);
  const directives = getMatchingDirectives(element);

  directives.forEach((directive) => {
    if (directive === `${DIRECTIVE_PREFIX}data`) return;

    const directiveValue = element.getAttribute(directive);
    if (!directiveValue) return;

    const matchingProps = dataProperties.filter((prop) =>
      directiveValue.includes(prop)
    );

    if (matchingProps.length > 0) {
      matches.set(directive, matchingProps);
    }
  });

  return matches;
};

const getReactiveValueName = (element: HTMLElement) => {
  return element.getAttribute("reactive");
};

const convertAndParseReactiveData = (data: string) => {
  const convertedReactiveData = new Function(`return ${data}`)();
  if (
    typeof convertedReactiveData !== "object" ||
    convertedReactiveData === null ||
    isEmptyObject(convertedReactiveData)
  ) {
    throw new Error(
      'Invalid data, please provide valid data, an example is fly-data="{counter: 5}", otherwise remove the directive'
    );
  }
  return convertedReactiveData;
};

const getReactiveData = (element: HTMLElement) => {
  const dataDirective = DIRECTIVE_PREFIX + "data";
  const reactiveData = element.getAttribute(dataDirective);
  return reactiveData ? convertAndParseReactiveData(reactiveData) : null;
};

export const initializeComponents = () => {
  document.querySelectorAll("[reactive]").forEach((element) => {
    if (!(element instanceof HTMLElement)) return;

    const component = createComponent(
      getReactiveValueName(element) ?? undefined
    );

    const hasDirectives = getMatchingDirectives(element).length > 0;
    const reactiveData = getReactiveData(element);

    if (hasDirectives && !reactiveData) {
      throw new Error(
        'Invalid data, please provide data in format fly-data="{prop: value}"'
      );
    }

    componentRegistry.set(component.id, component);
    element.setAttribute("data-reactive-id", component.id);

    if (reactiveData) {
      Object.entries(reactiveData).forEach(([key, value]) => {
        if (value != null) {
          component.reactiveData.set(key, createSignal(value));
        }
      });

      const directiveMatches = findMatchingDirectiveProperties(
        element,
        reactiveData
      );

      // TODO: Implement directive application using the matches
      directiveMatches.forEach((properties, directive) => {});
    }
    applyDirectives(element);
  });
};
