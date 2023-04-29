import { Graphviz } from '@hpcc-js/wasm/dist/graphviz.umd'

import { createBddFromTruthTable } from './binary-decision-diagram/create-bdd-from-truth-table.js'
import { InternalNode } from './binary-decision-diagram/internal-node.js'
import { LeafNode } from './binary-decision-diagram/leaf-node.js'
import { RootNode } from './binary-decision-diagram/root-node.js'

import svgPanZoom from 'svg-pan-zoom'
import { parseExpression } from './boolcalc/index.js'

type Theme = 'dark' | 'light'
interface DiagramTheme {
  internalNode: { fillColor: string; fontColor: string }
  leafNode: { fillColor: string; fontColor: string }
  edge: { color: string }
}
const themes: { [key in Theme]: DiagramTheme } = {
  light: {
    internalNode: { fillColor: '#ffffff', fontColor: '#222222' },
    leafNode: { fillColor: '#dddddd', fontColor: '#222222' },
    edge: { color: '#222222' }
  },
  dark: {
    internalNode: { fillColor: '#222222', fontColor: '#cccccc' },
    leafNode: { fillColor: '#111111', fontColor: '#555555' },
    edge: { color: '#111111' }
  }
}

export function generateDiagram(
  expression: string,
  variant: Variant,
  theme: DiagramTheme = themes.light
) {
  const truthTable = new Map()
  const { truthTable: table, variables } = parseExpression(expression)
  table.forEach(row => {
    truthTable.set(row.slice(0, variables.length).join(''), row[row.length - 1])
  })

  const bdd = createBddFromTruthTable(truthTable)

  if (variant !== 'full') bdd.minimize(false, variant === 'tree')

  let content = `digraph G {
  splines=curved
  ordering="out"
  nodesep="0.1"
  ranksep="0.3"
  fontname="Courier"
  node [margin=0 shape=rect penwidth=0.5 style="rounded,filled" fontsize=12]
  edge [arrowsize=0.25 penwidth=0.75 color="${theme.edge.color}"]
  bgcolor="transparent"\n`

  function printNode(node: RootNode | InternalNode) {
    const branches = node.branches
    const left = branches.getBranch('0')
    const right = branches.getBranch('1')
    printBranch(node, left, 'left')
    printBranch(node, right, 'right')
  }

  function printInternalNode(id: string, label: string) {
    const { fillColor, fontColor } = theme.internalNode
    return `\t${id} [label="${label}", fillcolor="${fillColor}", fontcolor="${fontColor}, width=0.4, height=0.3"]\n`
  }

  function printLeafNode(id: string, label: string) {
    const { fillColor, fontColor } = theme.leafNode
    return `\t${id} [label="${label}", shape=circle, fontsize=10, fillcolor="${fillColor}", fontcolor="${fontColor}", width=0.3, height=0.3]\n`
  }

  function printEdge(from: string, to: string, branch: 'left' | 'right') {
    const style = branch === 'left' ? 'dashed' : 'solid'
    return `\t${from} -> ${to} [style=${style}]\n`
  }

  function printBranch(
    origin: RootNode | InternalNode,
    node: InternalNode | LeafNode,
    branch: 'left' | 'right'
  ) {
    if (origin.isRootNode()) {
      content += printInternalNode(origin.id, variables[origin.level])
    }
    if (node.isInternalNode()) {
      content += printInternalNode(node.id, variables[node.level])
      content += printEdge(origin.id, node.id, branch)
    } else {
      content += printLeafNode(origin.id + node.id, node.asLeafNode().value.toString())
      content += printEdge(origin.id, origin.id + node.id, branch)
    }
  }

  bdd.nodesByLevel.forEach(nodes => {
    nodes.forEach(node => {
      if (node.isRootNode() || node.isInternalNode()) {
        printNode(node as RootNode | InternalNode)
      }
    })
  })

  content += '}'

  return content
}

type Variant = 'full' | 'tree' | 'diagram'

let graphviz: any = undefined
Graphviz.load().then((instance: any) => {
  graphviz = instance
  initialize('A XOR B XOR C', 'diagram', 'light')
})

let svgControl: SvgPanZoom.Instance | undefined

let currentExpression: string = ''
let currentVariant: Variant = 'diagram'

export function render(expression: string, variant: Variant, theme: Theme = 'dark') {
  if (!graphviz) {
    console.warn('graphviz not loaded')
    return
  }
  if (expression === '') {
    console.warn('expression is empty')
    return
  }
  currentExpression = expression
  const dot = generateDiagram(expression, variant, themes[theme])
  const svg = graphviz.dot(dot)
  const element = document.getElementById('graphviz')
  if (element) {
    element.innerHTML = svg
    svgControl = svgPanZoom('#graphviz svg', {
      zoomEnabled: true,
      controlIconsEnabled: false,
      zoomScaleSensitivity: 0.5,
      minZoom: 0.25
    })
    svgControl.zoom(0.85)
  }
  toggleExpressionDisplay(false, currentExpression)
  if (variant) {
    selectVariation(variant)
  }
}

;(window as any).render = render

function onExpressionChange(this: HTMLInputElement, event: Event) {
  const expression = (event.target as HTMLInputElement).value
  render(expression, currentVariant)
}

const exprContent = document.querySelector<HTMLSpanElement>('#expression .content')!
const exprContentText = document.querySelector<HTMLSpanElement>('#expression .content span')!
exprContent.addEventListener('click', () => toggleExpressionDisplay(true))

const exprInput = document.querySelector<HTMLInputElement>('#expression input')!
exprInput.addEventListener('focusout', () => toggleExpressionDisplay(false, exprInput.value))
exprInput.addEventListener('change', onExpressionChange)

function toggleExpressionDisplay(editing: boolean, content?: string) {
  if (editing) {
    exprContent.classList.add('hide')
    exprInput.classList.remove('hide')
    exprInput.focus()
  } else {
    if (content) exprContentText.innerText = content
    exprContent.classList.remove('hide')
    exprInput.classList.add('hide')
  }
}

const variants: { [k in Variant]: HTMLElement } = {
  full: document.querySelector<HTMLElement>('#variant-selector div[data-variant="full"]')!,
  tree: document.querySelector<HTMLElement>('#variant-selector div[data-variant="tree"]')!,
  diagram: document.querySelector<HTMLElement>('#variant-selector div[data-variant="diagram"]')!
}

Object.entries(variants).forEach(([variant, element]) => {
  element.addEventListener('click', () => render(currentExpression || '', variant as Variant))
})

function selectVariation(current: Variant) {
  Object.keys(variants).forEach(key => {
    if (key === current) {
      variants[key].classList.add('active')
    } else {
      variants[key as Variant].classList.remove('active')
    }
  })
}

const appRoot = document.getElementById('app')!

const themeSelector = document.getElementById('theme-selector')!
themeSelector.addEventListener('click', () => {
  if (appRoot.classList.contains('theme-light')) {
    setTheme('dark')
  } else {
    setTheme('light')
  }
})

function setTheme(theme: Theme) {
  if (theme === 'dark') {
    appRoot.classList.remove('theme-light')
    appRoot.classList.add('theme-dark')
    render(currentExpression, currentVariant, 'dark')
  } else {
    appRoot.classList.remove('theme-dark')
    appRoot.classList.add('theme-light')
    render(currentExpression, currentVariant, 'light')
  }
}

export function initialize(expression: string, variant: Variant, theme: Theme) {
  setTheme(theme)
  render(expression, variant, theme)
}
