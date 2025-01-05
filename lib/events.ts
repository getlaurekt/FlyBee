export const EVENT_PREFIX = "fly:";

export class ReactivityEvent {
  private namePrefix: typeof EVENT_PREFIX = "fly:";
  private event: CustomEvent;

  constructor(
    public eventId: string,
    private name = "reactive",
    private target = document
  ) {
    this.event = this.createEvent();
  }

  dispatch() {
    this.target.dispatchEvent(this.event);
  }

  private createEvent() {
    return new CustomEvent(this.namePrefix + this.name + ":" + this.eventId, {
      bubbles: true,
      cancelable: true,
    });
  }
}

// Less readable, for now gonna sit here
/* export const EVENT_PREFIX = "fly:";

interface EventConfig {
  name?: string;
  target?: Document;
}

const createEvent = (name: string): CustomEvent => {
  return new CustomEvent(`${EVENT_PREFIX}${name}`, {
    bubbles: true,
    cancelable: true,
  });
};

export const createReactiveEvent = ({
  name = "reactive",
  target = document,
}: EventConfig = {}) => {
  const event = createEvent(name);

  return {
    dispatch: () => target.dispatchEvent(event),
  };
}; */
