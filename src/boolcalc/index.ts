import { BooleanParser } from './parser/boolean.js'

/**
 * Pad a string with '0' characters until it is a specified length
 * Returns the string unaltered if the string is not less than the specified length
 * @param {string} text String to alter
 * @param {number} size Desired string length
 * @returns {string} text altered so it is at least the specified length
 */
function pad(text: string, size: number) {
  while (text.length < size) {
    text = '0' + text
  }

  return text
}

/**
 * Generates a truth table
 * @param {Array} vars Array of VariableNodes
 * @param {Array} nodes Tree to use for evaluation
 * @returns {Array} Computed table
 */
function truthTable(vars: any[], nodes: any[]) {
  let table = []

  if (vars.length < 1) {
    let row = []

    for (let node of nodes) {
      row.push(node.evalValue() ? '1' : '0')
    }

    table.push(row)
    return table
  }

  // The number of tests will be 2^(number of vars)
  let num_tests = Math.pow(2, vars.length)

  for (let test = 0; test < num_tests; ++test) {
    // Construct a list of inputs by converting the test number to binary
    let inputs = pad(test.toString(2), vars.length).split('')

    // Set each variable value based on the digits of the binary string
    for (let i = 0; i < inputs.length; ++i) {
      vars[i].value = inputs[i] === '1'
    }

    // For each node, evaluate it with the new variable inputs
    for (let node of nodes) {
      inputs.push(node.evalValue() ? '1' : '0')
    }

    // Add the row to the table
    table.push(inputs)
  }

  return table
}

export function parseExpression(exp: string) {
  // Create a new instance of the parser for the expression
  const parser = new BooleanParser(exp)

  // Parse the expression and store the node tree
  const tree = parser.parse()

  // Traverse the tree and construct a list of nodes
  let nodes = new Set()
  BooleanParser.traverse_tree(tree, nodes)

  // Reverse the nodes before passing them to the template
  const node_list = Array.from(nodes)
  node_list.reverse()

  // Construct the truth table
  let vars = parser.get_vars()
  return { truthTable: truthTable(vars, node_list), variables: vars.map(v => v.label) }
}
