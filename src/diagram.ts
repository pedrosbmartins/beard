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

export class GraphvizDiagram {
  public dot: string

  private theme: DiagramTheme
  private diagram: RootNode
  private variables: string[]

  constructor(private params: State) {
    this.theme = themes[params.theme]

    const { diagram, variables } = this.build()
    this.diagram = diagram
    this.variables = variables

    this.dot = this.toDOT()
  }

  private build() {
    const { expression, variant } = this.params

    const truthTable = new Map()
    const { truthTable: table, variables } = parseExpression(expression)
    table.forEach(row => {
      truthTable.set(row.slice(0, variables.length).join(''), row[row.length - 1])
    })

    const diagram = createBddFromTruthTable(truthTable)
    if (variant !== 'full') diagram.minimize(false, variant === 'tree')

    return { diagram, variables }
  }

  private toDOT() {
    let content = this.dotHeader()

    this.diagram.nodesByLevel.forEach(nodes => {
      nodes.forEach(node => {
        if (node.isRootNode() || node.isInternalNode()) {
          content += this.dotNode(node as RootNode | InternalNode)
        }
      })
    })

    content += '}'

    return content
  }

  private dotHeader() {
    const { edge, internalNode } = this.theme
    return `
      digraph G {
        splines=curved
        ordering="out"
        nodesep="0.2"
        ranksep="0.3"
        bgcolor="transparent"
        node [shape=rect penwidth=0.5 style="rounded,filled" fontsize=12 margin=0.05 fillcolor="${internalNode.fillColor}" fontcolor="${internalNode.fontColor}"]
        edge [arrowsize=0.25 penwidth=0.75 color="${edge.color}"]\n`
  }

  private dotNode(node: RootNode | InternalNode) {
    const branches = node.branches
    const nodeDef = this.dotInternalNode(node.id, this.variables[node.level])
    const negativeBranch = this.dotBranch(node, branches.getBranch('0'), 'negative')
    const positiveBranch = this.dotBranch(node, branches.getBranch('1'), 'positive')
    return nodeDef + negativeBranch + positiveBranch
  }

  private dotInternalNode(id: string, label: string) {
    return `\t${id} [label="${label}"]\n`
  }

  private dotBranch(
    origin: RootNode | InternalNode,
    node: InternalNode | LeafNode,
    branch: 'negative' | 'positive'
  ) {
    if (node.isInternalNode()) {
      return this.dotEdge(origin.id, node.id, branch)
    } else {
      const id = origin.id + node.id
      const label = node.asLeafNode().value.toString()
      const nodeDef = this.dotLeafNode(id, label)
      const edgeDef = this.dotEdge(origin.id, id, branch)
      return nodeDef + edgeDef
    }
  }

  private dotLeafNode(id: string, label: string) {
    const { fillColor, fontColor } = this.theme.leafNode
    return `\t${id} [label="${label}", shape=circle, fontsize=10, fillcolor="${fillColor}", fontcolor="${fontColor}", width=0.3, height=0.3, margin=0]\n`
  }

  private dotEdge(from: string, to: string, branch: 'negative' | 'positive') {
    const style = branch === 'negative' ? 'dashed' : 'solid'
    return `\t${from} -> ${to} [style=${style}]\n`
  }
}
