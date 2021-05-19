import {
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
  ESLintUtils,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils'
import * as tsutils from 'tsutils'
import * as ts from 'typescript'

interface Options {
  preferBoolean?: boolean
  normalize?: boolean
}
module.exports = {
  meta: {
    fixable: 'code',
    docs: {
      description:
        'Ensure variables in JSX conditionals are always cast to booleans, to avoid unwanted side effects with other falsey values like empty strings etc.',
      category: 'Possible Errors',
      recommended: true,
      url: '',
    },
    messages: {
      someId: 'Logical expressions must be cast to booleans',
    },
    schema: [
      {
        type: 'object',
        properties: {
          preferBoolean: {
            type: 'boolean',
          },
          normalize: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [
    {
      preferBoolean: false,
      normalize: false,
    },
  ],
  create(context: TSESLint.RuleContext<'someId', Options[]>) {
    const options = context?.options?.[0]
    const parserServices = ESLintUtils.getParserServices(context)
    const typeChecker = parserServices.program.getTypeChecker()
    const sourceCode = context.getSourceCode()
    function isBooleanType(expressionType: ts.Type): boolean {
      return tsutils.isTypeFlagSet(
        expressionType,
        ts.TypeFlags.Boolean | ts.TypeFlags.BooleanLiteral
      )
    }
    interface MakeFixFunctionParams {
      token: TSESTree.Token | null
      preferBoolean?: boolean
    }
    interface MakeFixFunctionArrayParams {
      tokens: TSESTree.Token[] | null
      preferBoolean?: boolean
      callExpression?: boolean
    }

    type MakeFixFunctionReturnType =
      | ((fixer: TSESLint.RuleFixer) => TSESLint.RuleFix)
      | null

    type MakeFixFunctionArrayReturnType =
      | ((fixer: TSESLint.RuleFixer) => TSESLint.RuleFix[])
      | null

    const makeFixFunctionArray = ({
      tokens,
      preferBoolean,
      callExpression,
    }: MakeFixFunctionArrayParams): MakeFixFunctionArrayReturnType => {
      if (!tokens) {
        return null
      }

      if (preferBoolean) {
        return (fixer: TSESLint.RuleFixer): TSESLint.RuleFix[] => {
          const rest = tokens
            .filter((t, i) => !(i < 2 && t.value === '!'))
            .map(x => x.value)
            .join('')
          const lastToken = tokens.pop()
          const newText = `Boolean(${rest})`
          if (!lastToken) {
            throw new Error('Error occurred during auto-fix')
          }
          return [
            ...tokens.map(t => fixer.remove(t)),
            fixer.replaceText(lastToken, newText),
          ]
        }
      } else {
        return (fixer: TSESLint.RuleFixer): TSESLint.RuleFix[] => {
          return tokens
            .map(token => {
              if (
                token.type === AST_TOKEN_TYPES.Identifier &&
                token.value !== 'Boolean'
              ) {
                return fixer.insertTextBefore(token, '!!')
              }
            })
            .filter((x): x is TSESLint.RuleFix => !!x)
        }
      }
    }
    const makeFixFunction = ({
      token,
      preferBoolean,
    }: MakeFixFunctionParams): MakeFixFunctionReturnType => {
      if (!token) {
        return null
      }

      return (fixer: TSESLint.RuleFixer): TSESLint.RuleFix => {
        if (preferBoolean) {
          return fixer.replaceText(token, `Boolean(${token.value})`)
        }
        return fixer.insertTextBefore(token, '!!')
      }
    }
    return {
      JSXExpressionContainer: function (node: TSESTree.JSXExpressionContainer) {
        const exp = node.expression

        if (exp.type === AST_NODE_TYPES.LogicalExpression) {
          if (
            exp.operator === '&&' &&
            exp.left.type !== AST_NODE_TYPES.UnaryExpression &&
            exp.left.type !== AST_NODE_TYPES.BinaryExpression &&
            !isBooleanType(
              typeChecker.getTypeAtLocation(
                parserServices.esTreeNodeToTSNodeMap.get(exp.left)
              )
            )
          ) {
            const token = sourceCode.getFirstToken(exp.left)
            let tokens: TSESTree.Token[] | null = null
            if (exp.left.type === AST_NODE_TYPES.CallExpression) {
              tokens = sourceCode.getTokens(exp.left)
            }
            context.report({
              node,
              loc: {
                start: {
                  line: exp.left.loc.start.line,
                  column: exp.left.loc.start.column,
                },
                end: {
                  line: exp.left.loc.end.line,
                  column: exp.left.loc.end.column,
                },
              },
              messageId: 'someId',
              fix: tokens
                ? makeFixFunctionArray({
                    tokens,
                    preferBoolean: options?.preferBoolean,
                    callExpression: true,
                  })
                : makeFixFunction({
                    token,
                    preferBoolean: options?.preferBoolean,
                  }),
            })
          }

          if (options?.normalize) {
            if (
              options?.preferBoolean &&
              exp.operator === '&&' &&
              exp.left.type === AST_NODE_TYPES.UnaryExpression &&
              sourceCode
                .getTokens(exp)
                .map(x => x.value)
                .join('')
                .startsWith('!!')
            ) {
              const tokens = sourceCode.getTokens(exp.left)
              context.report({
                node,
                loc: {
                  start: {
                    line: exp.left.loc.start.line,
                    column: exp.left.loc.start.column,
                  },
                  end: {
                    line: exp.left.loc.end.line,
                    column: exp.left.loc.end.column,
                  },
                },
                messageId: 'someId',
                fix: makeFixFunctionArray({
                  tokens,
                  preferBoolean: options?.preferBoolean,
                }),
              })
            } else if (
              exp.operator === '&&' &&
              exp.left.type === AST_NODE_TYPES.CallExpression
            ) {
              const tokens = sourceCode.getTokens(exp.left)

              context.report({
                node,
                loc: {
                  start: {
                    line: exp.left.loc.start.line,
                    column: exp.left.loc.start.column,
                  },
                  end: {
                    line: exp.left.loc.end.line,
                    column: exp.left.loc.end.column,
                  },
                },
                messageId: 'someId',
                fix: makeFixFunctionArray({
                  tokens,
                }),
              })
            }
          }
        }
      },
    }
  },
}
