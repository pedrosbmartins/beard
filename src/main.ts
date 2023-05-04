import { Graphviz } from '@hpcc-js/wasm/dist/graphviz.umd'
import { expressionToDiagramDot } from './diagram'
import { showExpressionContent } from './expression'
import { Theme } from './themes'
import { hideVariantSelector, selectVariant, Variant } from './variants'

import './info'
import { setState, State, state } from './state'
import { setupSVGControl } from './svgcontrol'
import './themes'

let graphviz: any = undefined
Graphviz.load().then((instance: any) => {
  graphviz = instance
  window.parent.postMessage({
    name: 'graphvizloaded',
    frameId: window.frameElement && window.frameElement.id
  })
})

export function render(params: Partial<State>) {
  if (!graphviz) {
    console.warn('graphviz not loaded')
    return
  }
  if (params.expression === '') {
    console.warn('expression is empty')
    return
  }
  setState(params)
  renderDiagramSVG(state)
  setupSVGControl()
  showExpressionContent(state.expression)
  selectVariant(state.variant)
  if (state.options.hideVariantSelector) {
    hideVariantSelector()
  }
}

function renderDiagramSVG(params: State) {
  const dot = expressionToDiagramDot(params)
  const svg = graphviz.dot(dot)
  const element = document.getElementById('graphviz')!
  element.innerHTML = svg
}

export function onExpressionChanged(expression: string) {
  render({ ...state, expression })
}

export function onVariantSelect(variant: Variant) {
  render({ ...state, variant })
}

export function onThemeChanged(theme: Theme) {
  render({ ...state, theme })
}
