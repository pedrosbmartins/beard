import { Graphviz } from '@hpcc-js/wasm/dist/graphviz.umd'
import svgPanZoom from 'svg-pan-zoom'
import { expressionToDiagramDot } from './diagram'
import { showExpressionContent } from './expression'
import { Theme } from './themes'
import { hideVariantSelector, selectVariant, Variant } from './variants'

import './info'
import { setState, State, state } from './state'
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
  if (params.expression === undefined || params.expression === '') {
    console.warn('expression is empty')
    return
  }
  setState(params)
  renderDiagramSvg(state)
  setupSvgControl()
  showExpressionContent(state.expression)
  selectVariant(state.variant)
  if (state.options.hideVariantSelector) {
    hideVariantSelector()
  }
}

function renderDiagramSvg(params: State) {
  const dot = expressionToDiagramDot(params)
  const svg = graphviz.dot(dot)
  const element = document.getElementById('graphviz')!
  element.innerHTML = svg
}

function setupSvgControl() {
  const svgControl = svgPanZoom('#graphviz svg', {
    zoomEnabled: true,
    controlIconsEnabled: false,
    zoomScaleSensitivity: 0.5,
    minZoom: 0.25
  })
  svgControl.zoom(0.85)
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
