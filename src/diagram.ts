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

export function expressionToDiagramDot(state: State) {
  const theme = themes[state.theme]

  const { diagram, variables } = buildDiagram(state)

  let content = dotHeader(theme)

  diagram.nodesByLevel.forEach(nodes => {
    nodes.forEach(node => {
      if (node.isRootNode() || node.isInternalNode()) {
        content += printNode(node as RootNode | InternalNode, variables, theme)
      }
    })
  })

  content += '}'

  return content
}

function buildDiagram({ expression, variant }: State) {
  const truthTable = new Map()
  const { truthTable: table, variables } = parseExpression(expression)
  table.forEach(row => {
    truthTable.set(row.slice(0, variables.length).join(''), row[row.length - 1])
  })

  const bdd = createBddFromTruthTable(truthTable)

  if (variant !== 'full') bdd.minimize(false, variant === 'tree')

  return { diagram: bdd, variables }
}

function dotHeader(theme: DiagramTheme) {
  return `
    digraph G {
      splines=curved
      ordering="out"
      nodesep="0.2"
      ranksep="0.3"
      bgcolor="transparent"
      node [margin=0 shape=rect penwidth=0.5 style="rounded,filled" fontsize=12]
      edge [arrowsize=0.25 penwidth=0.75 color="${theme.edge.color}"]\n`
}

function printNode(node: RootNode | InternalNode, variables: string[], theme: DiagramTheme) {
  const branches = node.branches
  const nodeDef = printInternalNode(node.id, variables[node.level], theme)
  const negativeBranch = printBranch(node, branches.getBranch('0'), 'negative', theme)
  const positiveBranch = printBranch(node, branches.getBranch('1'), 'positive', theme)
  return nodeDef + negativeBranch + positiveBranch
}

function printBranch(
  origin: RootNode | InternalNode,
  node: InternalNode | LeafNode,
  branch: 'negative' | 'positive',
  theme: DiagramTheme
) {
  if (node.isInternalNode()) {
    return printEdge(origin.id, node.id, branch)
  } else {
    const nodeDef = printLeafNode(origin.id + node.id, node.asLeafNode().value.toString(), theme)
    const edgeDef = printEdge(origin.id, origin.id + node.id, branch)
    return nodeDef + edgeDef
  }
}

function printInternalNode(id: string, label: string, theme: DiagramTheme) {
  const { fillColor, fontColor } = theme.internalNode
  return `\t${id} [label="${label}", fillcolor="${fillColor}", fontcolor="${fontColor}, width=0.4, height=0.3"]\n`
}

function printLeafNode(id: string, label: string, theme: DiagramTheme) {
  const { fillColor, fontColor } = theme.leafNode
  return `\t${id} [label="${label}", shape=circle, fontsize=10, fillcolor="${fillColor}", fontcolor="${fontColor}", width=0.3, height=0.3]\n`
}

function printEdge(from: string, to: string, branch: 'negative' | 'positive') {
  const style = branch === 'negative' ? 'dashed' : 'solid'
  return `\t${from} -> ${to} [style=${style}]\n`
}
