import { describe, expect, it, vi } from 'vitest';
import { createStore } from './createStore';

describe('createStore', () => {
  it('starts with the initial value', () => {
    expect(createStore([1]).get()).toEqual([1]);
  });

  it('tells every subscriber when the value changes', () => {
    const store = createStore(0);
    const first = vi.fn();
    const second = vi.fn();
    store.subscribe(first);
    store.subscribe(second);

    store.set(1);

    expect(store.get()).toBe(1);
    expect(first).toHaveBeenCalledOnce();
    expect(second).toHaveBeenCalledOnce();
  });

  it('stops telling a subscriber once it unsubscribes', () => {
    const store = createStore(0);
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    unsubscribe();
    store.set(1);

    expect(listener).not.toHaveBeenCalled();
  });
});
