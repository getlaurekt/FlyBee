type Subscriber = () => void;
type Cleanup = () => void;

let currentEffect: Subscriber | null = null;
const pendingEffects = new Set<Subscriber>();
let isScheduled = false;

const createSignal = <T>(initialValue: T) => {
  let value = initialValue;
  const subscribers = new Set<Subscriber>();

  const read = () => {
    if (currentEffect) {
      subscribers.add(currentEffect);
    }
    return value;
  };

  const write = (newValue: T) => {
    if (typeof newValue === "object" && newValue !== null) {
      const updated = {
        ...(typeof value === "object" ? value : {}),
        ...newValue,
      };
      if (!Object.is(value, updated)) {
        value = updated as T;
        scheduleBatch(() => {
          subscribers.forEach((sub) => pendingEffects.add(sub));
        });
      }
    } else if (value !== newValue) {
      value = newValue;
      scheduleBatch(() => {
        subscribers.forEach((sub) => pendingEffects.add(sub));
      });
    }
  };

  const update = (updater: (prev: T) => T) => {
    write(updater(value));
  };

  return [read, write, update] as const;
};

const scheduleBatch = (fn: () => void) => {
  fn();

  if (!isScheduled) {
    isScheduled = true;
    queueMicrotask(flush);
  }
};

const flush = () => {
  try {
    for (const effect of pendingEffects) {
      effect();
    }
  } finally {
    pendingEffects.clear();
    isScheduled = false;
  }
};

const createEffect = (fn: () => void): Cleanup => {
  const execute = () => {
    currentEffect = execute;
    fn();
    currentEffect = null;
  };

  scheduleBatch(execute);
  return () => pendingEffects.delete(execute);
};

const createComputed = <T>(fn: () => T) => {
  const [value, setValue] = createSignal<T>(fn());

  createEffect(() => setValue(fn()));

  return value;
};

const derive = <T, U>(source: () => T, transform: (value: T) => U) => {
  return createComputed(() => transform(source()));
};

const createMemo = <T>(
  fn: () => T,
  equals: boolean | ((prev: T, next: T) => boolean) = true
) => {
  const [value, setValue] = createSignal<T>(fn());
  let prevValue = value();

  createEffect(() => {
    const nextValue = fn();

    if (equals === true) {
      if (prevValue !== nextValue) {
        setValue(nextValue);
        prevValue = nextValue;
      }
    } else if (equals === false) {
      setValue(nextValue);
      prevValue = nextValue;
    } else if (!equals(prevValue, nextValue)) {
      setValue(nextValue);
      prevValue = nextValue;
    }
  });

  return value;
};

export { createSignal, createEffect, createComputed, derive, createMemo };
