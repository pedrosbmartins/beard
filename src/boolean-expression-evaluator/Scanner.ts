import { Token, TokenType } from './Token'

export class Scanner {
  public variables: Set<string> = new Set()

  private tokens: Token[] = []
  private start: number = 0
  private current: number = 0

  private static keywords: Map<string, TokenType> = new Map([
    ['and', TokenType.OPERATOR_AND],
    ['or', TokenType.OPERATOR_OR],
    ['xor', TokenType.OPERATOR_XOR],
    ['not', TokenType.OPERATOR_NOT],
    ['true', TokenType.BOOLEAN_TRUE],
    ['false', TokenType.BOOLEAN_FALSE]
  ])

  constructor(private source: string) {}

  public scanTokens() {
    while (!this.isAtEnd()) {
      this.start = this.current
      this.scanToken()
    }

    this.tokens.push(new Token(TokenType.EOF, ''))
    return this.tokens
  }

  private scanToken() {
    const c = this.advance()
    switch (c) {
      case '(':
        this.addToken(TokenType.LEFT_PAREN)
        break
      case ')':
        this.addToken(TokenType.RIGHT_PAREN)
        break
      case '+':
        this.addToken(TokenType.OPERATOR_OR)
        break
      case '*':
      case '·':
        this.addToken(TokenType.OPERATOR_AND)
        break
      case '¬':
      case '!':
        this.addToken(TokenType.OPERATOR_NOT)
        break
      case '⊕':
        this.addToken(TokenType.OPERATOR_XOR)
        break
      case '1':
        this.addToken(TokenType.BOOLEAN_TRUE)
        break
      case '0':
        this.addToken(TokenType.BOOLEAN_FALSE)
        break
      case ' ':
      case '\r':
      case '\t':
      case '\n':
        // Ignore whitespace.
        break
      default:
        if (this.isAlpha(c)) {
          this.identifier()
        } else {
          throw new Error(`Unexpected character at ${this.current}.`)
        }
    }
  }

  private isAtEnd() {
    return this.current >= this.source.length
  }

  private advance() {
    return this.source.charAt(this.current++)
  }

  private peek() {
    if (this.isAtEnd()) return '\0'
    return this.source.charAt(this.current)
  }

  private addToken(type: TokenType) {
    const text = this.source.substring(this.start, this.current)
    this.tokens.push(new Token(type, text))
  }

  private isAlpha(c: string) {
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_'
  }

  private isDigit(c: string) {
    return c >= '0' && c <= '9'
  }

  private isAlphaNumeric(c: string) {
    return this.isAlpha(c) || this.isDigit(c)
  }

  private identifier() {
    while (this.isAlphaNumeric(this.peek())) this.advance()
    const text = this.source.substring(this.start, this.current)
    let type = Scanner.keywords.get(text.toLowerCase())
    if (type === undefined) {
      type = TokenType.VARIABLE
      this.variables.add(text)
    }
    this.addToken(type)
  }
}
