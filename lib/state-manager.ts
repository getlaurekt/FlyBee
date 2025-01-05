import { Observer, type WatcherCallback } from "./observer";

export class StateManager {
  private state: Record<string, any> = {};
  private observer: Observer;

  constructor() {
    this.observer = new Observer();
  }

  createState(key: string, initialValue: any) {
    if (!this.state.hasOwnProperty(key)) {
      this.state[key] = initialValue;
    } else {
      console.warn(`State key "${key}" already exists.`);
    }
  }

  getState(key: string) {
    return this.state[key];
  }

  setState(key: string, value: any) {
    if (this.state.hasOwnProperty(key)) {
      const oldValue = this.state[key];
      this.state[key] = value;
      this.observer.notifySubscribers(key, value, oldValue);
    } else {
      console.warn(`State key "${key}" does not exist.`);
    }
  }

  persistState(key: string, storage: Storage = localStorage) {
    const value = this.getState(key);
    if (value !== undefined) {
      storage.setItem(key, JSON.stringify(value));
    }
  }

  syncState(key: string, storage: Storage = localStorage) {
    const storedValue = storage.getItem(key);
    if (storedValue !== null) {
      const parsedValue = JSON.parse(storedValue);
      this.setState(key, parsedValue);
    }
  }

  subscribeToState(key: string, callback: WatcherCallback) {
    this.observer.subscribe(key, callback);
  }
}
