const actionQueue: (() => void)[] = [];

export function queueAction(action: () => void) {
  actionQueue.push(action);
}

export function runQueuedActions() {
  while (actionQueue.length > 0) {
    const action = actionQueue.shift();
    if (action) action();
  }
}
