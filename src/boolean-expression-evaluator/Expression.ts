import { Token, TokenType } from './Token'

export type VariableAssignment = { [name: string]: any }

export abstract class Expression {
  abstract interpret(assignment: VariableAssignment): boolean
  abstract print(): string
}

export class BooleanLiteral extends Expression {
  constructor(public value: boolean) {
    super()
  }

  interpret(assignment: VariableAssignment) {
    return this.value
  }

  print() {
    return this.value.toString()
  }
}

export class Variable extends Expression {
  constructor(public name: string) {
    super()
  }

  interpret(assignment: VariableAssignment) {
    return Boolean(assignment[this.name])
  }

  print() {
    return this.name
  }
}

export class Unary extends Expression {
  constructor(public operator: Token, public right: Expression) {
    super()
  }

  interpret(assignment: VariableAssignment) {
    const right = this.right.interpret(assignment)

    switch (this.operator.type) {
      case TokenType.OPERATOR_NOT: {
        return !right
      }
      default: {
        // @todo: handle runtime errors
        throw new Error('could not interpret unary expression')
      }
    }
  }

  print() {
    return `(${this.operator.lexeme}${this.right.print()})`
  }
}

export class Binary extends Expression {
  constructor(public left: Expression, public operator: Token, public right: Expression) {
    super()
  }

  interpret(assignment: VariableAssignment): boolean {
    const left = this.left.interpret(assignment)
    const right = this.right.interpret(assignment)

    switch (this.operator.type) {
      case TokenType.OPERATOR_AND:
        return left && right
      case TokenType.OPERATOR_OR:
        return left || right
      case TokenType.OPERATOR_XOR:
        return (!left && right) || (left && !right)
      default: {
        // @todo: handle runtime errors
        throw new Error('could not interpret binary expression')
      }
    }
  }

  print() {
    return `(${this.left.print()} ${this.operator.lexeme} ${this.right.print()})`
  }
}

export class Grouping extends Expression {
  constructor(public expression: Expression) {
    super()
  }

  interpret(assignment: VariableAssignment) {
    return this.expression.interpret(assignment)
  }

  print() {
    return `(group ${this.expression.print()})`
  }
}
