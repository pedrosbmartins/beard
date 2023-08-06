import * as expr from './Expression'
import { Token, TokenType } from "./Token"

// expression     → term ;
// term           → factor ( ( "+" ) factor )* ;
// factor         → unary ( ( "*" ) unary )* ;
// unary          → ( "¬" ) unary | primary ;
// primary        → TRUE | FALSE | VARIABLE | "(" expression ")" ;

class ParseError extends Error {}

export class Parser {
  private current: number = 0

  constructor(private tokens: Token[]) {}

  public parse() {
    return this.expression()
  }

  private expression(): expr.Expression {
    return this.term()
  }

  private term(): expr.Expression {
    let expression = this.factor()

    while (this.match(TokenType.OPERATOR_OR)) {
      const operator = this.previous()
      const right = this.factor()
      expression = new expr.Binary(expression, operator, right)
    }

    return expression
  }

  private factor(): expr.Expression {
    let expression = this.unary()

    while (this.match(TokenType.OPERATOR_AND, TokenType.OPERATOR_XOR)) {
      const operator = this.previous()
      const right = this.unary()
      expression = new expr.Binary(expression, operator, right)
    }

    return expression
  }

  private unary(): expr.Expression {
    if (this.match(TokenType.OPERATOR_NOT)) {
      const operator = this.previous()
      const right = this.unary()
      return new expr.Unary(operator, right)
    }

    return this.primary()
  }

  private primary(): expr.Expression {
    if (this.match(TokenType.BOOLEAN_TRUE)) {
      return new expr.BooleanLiteral(true)
    }
    if (this.match(TokenType.BOOLEAN_FALSE)) {
      return new expr.BooleanLiteral(false)
    }

    if (this.match(TokenType.VARIABLE)) {
      const variable = this.previous()
      return new expr.Variable(variable.lexeme)
    }

    if (this.match(TokenType.LEFT_PAREN)) {
      const expression = this.expression()
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.")
      return new expr.Grouping(expression)
    }

    throw this.error(this.peek(), 'Expect expression.')
  }

  private match(...types: TokenType[]) {
    for (const type of types) {
      if (this.check(type)) {
        this.advance()
        return true
      }
    }
    return false
  }

  private check(type: TokenType) {
    if (this.isAtEnd()) return false
    return this.peek().type === type
  }

  private advance() {
    if (!this.isAtEnd()) this.current++
    return this.previous()
  }

  private isAtEnd() {
    return this.peek().type === TokenType.EOF
  }

  private peek() {
    return this.tokens[this.current]
  }

  private previous() {
    return this.tokens[this.current - 1]
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance()

    throw this.error(this.peek(), message)
  }

  private error(token: Token, message: string) {
    // @todo handle error(token, message)
    return new ParseError(`At ${token.toString()}. ${message}`)
  }
}