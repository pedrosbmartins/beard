import { Expression, VariableAssignment } from './Expression'
import { Parser } from './Parser'
import { Scanner } from './Scanner'

export class BooleanExpression {
  private _variables: Set<string> = new Set()
  private parsedExpression: Expression | undefined

  constructor(private expression?: string) {
    if (expression) {
      this.parseCurrent()
    }
  }

  get variables() {
    return this._variables
  }

  public parse(expression: string) {
    if (expression !== this.expression) {
      this.expression = expression
      this.parseCurrent()
    }
    return this
  }

  public evaluate(assignment: string): boolean
  public evaluate(assignment: VariableAssignment): boolean
  public evaluate(assignment: string | VariableAssignment): boolean {
    if (!this.parsedExpression) throw new Error('No parsed expression to evaluate.')
    if (typeof assignment === 'string') {
      // assignment is of type '110010001...'
      const assignmentCount = assignment.length
      const variableCount = this._variables.size
      if (assignmentCount !== variableCount) {
        throw new Error(this.mismatchedVariableAssignmentMessage(assignmentCount, variableCount))
      }
      assignment = convertBinaryStringToVarAssignment(assignment, this.variables)
    }
    return this.parsedExpression.interpret(assignment)
  }

  public truthTable() {
    if (!this.parsedExpression) throw new Error('No parsed expression to evaluate.')
    const assignments = binaryPermutationStrings(this.variables.size)
    return new Map(assignments.map(assignment => [assignment, this.evaluate(assignment)]))
  }

  private parseCurrent() {
    if (!this.expression) throw new Error('No expression to parse.')
    const scanner = new Scanner(this.expression)
    const tokens = scanner.scanTokens()
    const parser = new Parser(tokens)
    this.parsedExpression = parser.parse()
    this._variables = scanner.variables
  }

  private mismatchedVariableAssignmentMessage(given: number, expected: number) {
    return `number of variables does not match (given ${given}, expected ${expected})`
  }
}

function convertBinaryStringToVarAssignment(
  value: string,
  variables: Set<string>
): VariableAssignment {
  const assignmentPairs = Array.from(variables).map((v, i) => [v, Number(value[i])])
  return Object.fromEntries(assignmentPairs)
}

function binaryPermutationStrings(n: number) {
  return [...new Array(2 ** n)].map((_, i) => i.toString(2).padStart(n, '0'))
}
