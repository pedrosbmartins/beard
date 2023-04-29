import { Graphviz } from '@hpcc-js/wasm/dist/graphviz.umd'
import svgPanZoom from 'svg-pan-zoom'
import { expressionToDiagramDot } from './diagram'
import { toggleExpressionDisplay } from './expression'
import { Theme } from './themes'
import { selectVariant, Variant } from './variants'

import { setState, State, state } from './state'
import './themes'

let graphviz: any = undefined
Graphviz.load().then((instance: any) => {
  graphviz = instance
  render({ expression: 'A XOR B XOR C', variant: 'diagram', theme: 'light' })
})

export function render(state: State) {
  if (!graphviz) {
    console.warn('graphviz not loaded')
    return
  }
  if (state.expression === '') {
    console.warn('expression is empty')
    return
  }
  setState(state)
  renderDiagramSvg(state)
  setupSvgControl()
  toggleExpressionDisplay(false, state.expression)
  selectVariant(state.variant)
}

function renderDiagramSvg(state: State) {
  const dot = expressionToDiagramDot(state)
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
