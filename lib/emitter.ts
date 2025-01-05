export class Emitter {
  private events: Record<string, Function[]> = {};

  on(event: string, callback: Function) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (!this.events[event]) {
      return;
    }
    this.events[event] = this.events[event].filter((cb) => cb !== callback);
  }

  emit(event: string, ...args: any[]) {
    if (!this.events[event]) {
      return;
    }
    this.events[event].forEach((cb) => cb(...args));
  }
}

// This functional syntax isn't as readable as the class-based one, so for now it stays commented out
/* export const createEmitter = () => {
  const events: Record<string, Function[]> = {};

  const on = (event: string, callback: Function) => {
    if (!events[event]) {
      events[event] = [];
    }
    events[event].push(callback);
  };

  const off = (event: string, callback: Function) => {
    if (!events[event]) {
      return;
    }
    events[event] = events[event].filter((cb) => cb !== callback);
  };

  const emit = (event: string, ...args: any[]) => {
    if (!events[event]) {
      return;
    }
    events[event].forEach((cb) => cb(...args));
  };

  return { on, off, emit };
};
 */
