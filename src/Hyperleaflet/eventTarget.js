function makeEventTarget(object) {
  Object.assign(object, {
    eventListeners: {},
    addEventListener(type, listener) {
      if (!(type in this.eventListeners)) {
        this.eventListeners[type] = [];
      }
      this.eventListeners[type].push(listener);
    },
    removeEventListener(type, listener) {
      if (!(type in this.eventListeners)) {
        return;
      }
      const index = this.eventListeners[type].indexOf(listener);
      if (index !== -1) {
        this.eventListeners[type].splice(index, 1);
      }
    },
    dispatchEvent(event) {
      if (!(event.type in this.eventListeners)) {
        return true;
      }
      const listeners = this.eventListeners[event.type].slice();
      console.log(listeners);
      for (let listener of listeners) {
        listener.call(this, event);
      }
      return !event.defaultPrevented;
    },
  });
  // Make Hyperleaflet an EventTarget
  Object.setPrototypeOf(object, EventTarget.prototype);
}

export { makeEventTarget };
