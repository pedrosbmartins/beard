import { Theme } from './themes'
import { Variant } from './variants'

export interface State {
  expression: string
  variant: Variant
  theme: Theme
}

export let state: State = {
  expression: '',
  variant: 'diagram',
  theme: 'light'
}

export function setState(data: Partial<State>) {
  state = { ...state, ...data }
}
