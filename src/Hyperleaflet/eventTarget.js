function makeEventTarget(object) {
  const eventListeners = {};

  Object.assign(object, {
    addEventListener(type, listener) {
      if (!(type in eventListeners)) {
        eventListeners[type] = [];
      }
      eventListeners[type].push(listener);
    },
    removeEventListener(type, listener) {
      if (!(type in eventListeners)) {
        return;
      }
      const index = eventListeners[type].indexOf(listener);
      if (index !== -1) {
        eventListeners[type].splice(index, 1);
      }
    },
    dispatchEvent(event) {
      if (!(event.type in eventListeners)) {
        return true;
      }
      const listeners = eventListeners[event.type].slice();
      for (const listener of listeners) {
        listener.call(object, event);
      }
      return !event.defaultPrevented;
    },
  });
}

export { makeEventTarget };
