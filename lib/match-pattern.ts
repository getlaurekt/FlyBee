type Pattern<T, R> = {
  when: (
    predicate: (value: T) => boolean,
    handler: (value: T) => R
  ) => Pattern<T, R>;
  with: <V extends T>(value: V, handler: (value: V) => R) => Pattern<T, R>;
  otherwise: (handler: (value: T) => R) => R;
};

export function match<T, R>(value: T): Pattern<T, R> {
  const conditions: Array<[(value: T) => boolean, (value: T) => R]> = [];

  return {
    when(predicate, handler) {
      conditions.push([predicate, handler]);
      return this;
    },

    with<V extends T>(matchValue: V, handler: (value: V) => R) {
      conditions.push([
        (value) => value === matchValue,
        (value: T) => handler(value as V),
      ]);
      return this;
    },

    otherwise(handler) {
      for (const [predicate, resultHandler] of conditions) {
        if (predicate(value)) {
          return resultHandler(value);
        }
      }
      return handler(value);
    },
  };
}

// Example usage:
/*
const result = match<number, string>(5)
  .with(0, () => "zero")
  .when(n => n > 0, n => `positive: ${n}`)
  .when(n => n < 0, n => `negative: ${n}`)
  .otherwise(n => `other: ${n}`);
*/
