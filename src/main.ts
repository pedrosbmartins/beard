import { Graphviz } from '@hpcc-js/wasm/dist/graphviz.umd'
import svgPanZoom from 'svg-pan-zoom'
import { expressionToDiagramDot } from './diagram'
import { toggleExpressionDisplay } from './expression'
import { Theme } from './themes'
import { selectVariant, Variant } from './variants'

import { setState, state } from './state'
import './themes'

let graphviz: any = undefined
Graphviz.load().then((instance: any) => {
  graphviz = instance
  render('A XOR B XOR C', 'diagram', 'light')
})

export function render(expression: string, variant: Variant, theme: Theme = 'dark') {
  if (!graphviz) {
    console.warn('graphviz not loaded')
    return
  }
  if (expression === '') {
    console.warn('expression is empty')
    return
  }
  setState({ expression, variant, theme })
  const dot = expressionToDiagramDot(expression, variant, theme)
  const svg = graphviz.dot(dot)
  const element = document.getElementById('graphviz')!
  element.innerHTML = svg
  initializeSvgControl()
  toggleExpressionDisplay(false, state.expression)
  if (variant) {
    selectVariant(variant)
  }
}

function initializeSvgControl() {
  const svgControl = svgPanZoom('#graphviz svg', {
    zoomEnabled: true,
    controlIconsEnabled: false,
    zoomScaleSensitivity: 0.5,
    minZoom: 0.25
  })
  svgControl.zoom(0.85)
}

export function onExpressionChange(expression: string) {
  render(expression, state.variant, state.theme)
}

export function onSelectVariant(variant: Variant) {
  render(state.expression, variant, state.theme)
}

export function onThemeChange(theme: Theme) {
  render(state.expression, state.variant, theme)
}
