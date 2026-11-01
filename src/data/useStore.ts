import { useSyncExternalStore } from 'react'
import type { Store } from './store'
export function useStore(store: Store) {
  useSyncExternalStore(store.subscribe.bind(store), () => store.state)
  return store
}
