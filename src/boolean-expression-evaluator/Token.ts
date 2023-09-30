export enum TokenType {
  LEFT_PAREN,
  RIGHT_PAREN,

  BOOLEAN_TRUE,
  BOOLEAN_FALSE,
  VARIABLE,

  OPERATOR_AND,
  OPERATOR_OR,
  OPERATOR_XOR,
  OPERATOR_NOT,

  EOF
}

export class Token {
  public type: TokenType
  public lexeme: string

  constructor(type: TokenType, lexeme: string) {
    this.type = type
    this.lexeme = lexeme
  }

  public toString() {
    const lexeme = this.lexeme === '' ? '--' : this.lexeme
    return `${TokenType[this.type]} ${lexeme}`
  }
}
