import { Graphviz } from '@hpcc-js/wasm/dist/graphviz.umd'

import { createBddFromTruthTable } from './binary-decision-diagram/create-bdd-from-truth-table.js'
import { InternalNode } from './binary-decision-diagram/internal-node.js'
import { LeafNode } from './binary-decision-diagram/leaf-node.js'
import { RootNode } from './binary-decision-diagram/root-node.js'

import svgPanZoom from 'svg-pan-zoom'
import { parseExpression } from './boolcalc/index.js'

export function generateDiagram(expression: string, variant: Variant) {
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
  node [margin=0 shape=rect penwidth=0.5 fillcolor="#ffffff" style="rounded,filled" fontcolor="#222222" fontsize=12]
  edge [arrowsize=0.25 penwidth=0.75 color="#222222"]
  bgcolor="transparent"\n`

  const colors = ['#ffffff', '#ffffff', '#ffffff', '#ffffff']
  // const colors = ['#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff', '#a0c4ff', '#bdb2ff']
  const colorCount = colors.length

  function color(index: number) {
    return colors[index % colorCount]
  }

  function printNode(node: RootNode | InternalNode) {
    const branches = node.branches
    const left = branches.getBranch('0')
    const right = branches.getBranch('1')
    printBranch(node, left, 'left')
    printBranch(node, right, 'right')
  }

  function printBranch(
    origin: RootNode | InternalNode,
    node: InternalNode | LeafNode,
    branch: 'left' | 'right'
  ) {
    if (origin.isRootNode()) {
      content += `\t${origin.id} [label="${variables[origin.level]}", fillcolor="${color(
        origin.level
      )}", width=0.4, height=0.3]\n`
    }
    if (node.isInternalNode()) {
      content += `\t${node.id} [label="${variables[node.level]}", fillcolor="${color(
        node.level
      )}", width=0.4, height=0.3]\n`
      content += `\t${origin.id} -> ${node.id} [style=${branch === 'left' ? 'dashed' : 'solid'}]\n`
    } else {
      content += `\t${origin.id + node.id} [label="${
        node.asLeafNode().value
      }", shape=circle, fontsize=10, fillcolor="#dddddd", fontcolor="#222222", width=0.3, height=0.3]\n`
      content += `\t${origin.id} -> ${origin.id + node.id} [style=${
        branch === 'left' ? 'dashed' : 'solid'
      }]\n`
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
  render(currentExpression, currentVariant)
})

let svgControl: SvgPanZoom.Instance | undefined

let currentExpression: string = 'A XOR B XOR C'
let currentVariant: Variant = 'diagram'

export function render(expression: string, variant: any) {
  if (!graphviz) {
    console.warn('graphviz not loaded')
    return
  }
  if (expression === '') {
    console.warn('expression is empty')
    return
  }
  currentExpression = expression
  const dot = generateDiagram(expression, variant)
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
