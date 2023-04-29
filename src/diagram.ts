import { createBddFromTruthTable } from './binary-decision-diagram/create-bdd-from-truth-table'
import { InternalNode } from './binary-decision-diagram/internal-node'
import { LeafNode } from './binary-decision-diagram/leaf-node'
import { RootNode } from './binary-decision-diagram/root-node'

import { parseExpression } from './boolcalc/index'
import { State } from './state'
import { Theme } from './themes'

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

export function expressionToDiagramDot({ expression, variant, theme: themeName }: State) {
  const theme = themes[themeName]

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
  nodesep="0.2"
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
