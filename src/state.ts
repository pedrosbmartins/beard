import { Theme } from './themes'
import { Variant } from './variants'

interface Options {
  hideVariantSelector: boolean
}

export interface State {
  expression: string
  variant: Variant
  theme: Theme
  options: Partial<Options>
}

export let state: State = {
  expression: '',
  variant: 'diagram',
  theme: 'light',
  options: {}
}

export function setState(data: Partial<State>) {
  state = { ...state, ...data }
}
