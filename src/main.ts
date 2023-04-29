import Viz from 'viz.js'
import { Module, render } from 'viz.js/full.render.js'

import { createBddFromTruthTable } from './binary-decision-diagram/create-bdd-from-truth-table'
import { InternalNode } from './binary-decision-diagram/internal-node'
import { LeafNode } from './binary-decision-diagram/leaf-node'
import { RootNode } from './binary-decision-diagram/root-node'

import svgPanZoom from 'svg-pan-zoom'
import { parseExpression } from './boolcalc'

export function generateDiagram(expression: string, variant: Variant) {
  const truthTable = new Map()
  const { truthTable: table, variables } = parseExpression(expression)
  table.forEach(row => {
    truthTable.set(row.slice(0, variables.length).join(''), row[row.length - 1])
  })

  const bdd = createBddFromTruthTable(truthTable)

  if (variant === 'tree') {
    bdd.minimize({ skipInternalNodeEliminationRule: true })
  } else if (variant === 'diagram') {
    bdd.minimize()
  }

  let content = `digraph G {
  splines=curved
  ordering="out"
  nodesep="0.1"
  ranksep="0.3"
  fontname="Courier"
  node [margin=0 shape=rect penwidth=0 fillcolor="#373749" style="rounded,filled" fontcolor="#ffffff"]
  edge [arrowsize=0.5 penwidth=0.75 color="#494966"]
  bgcolor="transparent"\n`

  const colors = ['#29B2CC', '#178EFC', '#F17C10', '#EC0C55']
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
      )}", width=0.6, height=0.4]\n`
    }
    if (node.isInternalNode()) {
      content += `\t${node.id} [label="${variables[node.level]}", fillcolor="${color(
        node.level
      )}", width=0.6, height=0.4]\n`
      content += `\t${origin.id} -> ${node.id} [style=${branch === 'left' ? 'dashed' : 'solid'}]\n`
    } else {
      content += `\t${origin.id + node.id} [label="${
        node.asLeafNode().value
      }", shape=circle, fontsize=10, fontcolor="#999999", width=0.3, height=0.3]\n`
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

let viz = new Viz({ Module, render })
let svgControl: SvgPanZoom.Instance | undefined

type Variant = 'full' | 'tree' | 'diagram'

let currentExpression: string = '(A*B) XOR (C*D)'
let currentVariant: Variant = 'diagram'

export function renderViz(expression: string, variant: Variant) {
  currentExpression = expression
  currentVariant = variant

  viz
    .renderString(generateDiagram(expression, variant))
    .then(result => {
      const element = document.getElementById('graphviz')
      if (element) {
        element.innerHTML = result
        svgControl = svgPanZoom('#graphviz svg', {
          zoomEnabled: true,
          controlIconsEnabled: false,
          zoomScaleSensitivity: 0.5,
          minZoom: 0.25
        })
        svgControl.zoom(0.75)
      }
      toggleExpressionDisplay(false, exprInput.value)
      if (variant) {
        selectVariation(variant)
      }
    })
    .catch(error => {
      viz = new Viz({ Module, render })
      console.error(error)
    })
}

renderViz(currentExpression, currentVariant)

function onExpressionChange(this: HTMLInputElement, event: Event) {
  const expression = (event.target as HTMLInputElement).value
  renderViz(expression, currentVariant)
}

const exprText = document.querySelector<HTMLSpanElement>('#expression span')!
exprText.addEventListener('click', () => toggleExpressionDisplay(true))

const exprInput = document.querySelector<HTMLInputElement>('#expression input')!
exprInput.addEventListener('focusout', () => toggleExpressionDisplay(false, exprInput.value))
exprInput.addEventListener('change', onExpressionChange)

function toggleExpressionDisplay(editing: boolean, content?: string) {
  if (editing) {
    exprText.classList.add('hide')
    exprInput.classList.remove('hide')
    exprInput.focus()
  } else {
    if (content) exprText.innerText = content
    exprText.classList.remove('hide')
    exprInput.classList.add('hide')
  }
}

const variants: { [k in Variant]: HTMLElement } = {
  full: document.querySelector<HTMLElement>('#variant-selector div[data-variant="full"]')!,
  tree: document.querySelector<HTMLElement>('#variant-selector div[data-variant="tree"]')!,
  diagram: document.querySelector<HTMLElement>('#variant-selector div[data-variant="diagram"]')!
}

Object.entries(variants).forEach(([variant, element]) => {
  element.addEventListener('click', () => renderViz(currentExpression || '', variant as Variant))
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
