export type WatcherCallback = (newValue: any, oldValue: any) => void;

export class Observer {
  private watchers: Record<string, Set<WatcherCallback>> = {};

  constructor() {}

  subscribe(key: string, callback: WatcherCallback) {
    if (!this.watchers[key]) {
      this.watchers[key] = new Set();
    }
    this.watchers[key].add(callback);
  }

  notifySubscribers(key: string, newValue: any, oldValue: any) {
    if (this.watchers[key]) {
      this.watchers[key].forEach((callback) => {
        callback(newValue, oldValue);
      });
    }
  }
}
