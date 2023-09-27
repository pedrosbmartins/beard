import repl from 'repl'
import { BooleanExpression } from './BooleanExpression'
import { Expression } from './Expression'
import { Parser } from './Parser'
import { Scanner } from './Scanner'
import { Token } from './Token'

const server = repl.start()
server.setupHistory('../tmp', () => {})
server.context['BooleanExpression'] = BooleanExpression
server.context['Expression'] = Expression
server.context['Parser'] = Parser
server.context['Scanner'] = Scanner
server.context['Token'] = Token
