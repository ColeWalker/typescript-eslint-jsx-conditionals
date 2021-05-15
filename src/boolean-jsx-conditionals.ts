import * as ts from "typescript";
import * as tsutils from "tsutils";
import {
  AST_NODE_TYPES,
  TSESTree,
  ESLintUtils,
  TSESLint,
} from "@typescript-eslint/experimental-utils";
import { ESLint } from "@typescript-eslint/experimental-utils/dist/ts-eslint";

module.exports = {
  meta: {
    docs: {
      description:
        "Ensure variables in JSX conditionals are always cast to booleans, to avoid unwanted side effects with other falsey values like empty strings etc.",
      category: "Possible Errors",
      recommended: true,
      url: "",
    },
    messages: {
      someId: "Logical expressions must be cast to booleans",
    },

    type: null,
    schema: [],
  },

  create(context: TSESLint.RuleContext<any, any>) {
    const parserServices = ESLintUtils.getParserServices(context);
    const typeChecker = parserServices.program.getTypeChecker();

    function isBooleanType(expressionType: ts.Type): boolean {
      return tsutils.isTypeFlagSet(
        expressionType,
        ts.TypeFlags.Boolean | ts.TypeFlags.BooleanLiteral
      );
    }
    return {
      JSXExpressionContainer: function (node: TSESTree.JSXExpressionContainer) {
        const exp = node.expression;
        if (exp.type === AST_NODE_TYPES.LogicalExpression) {
          if (
            exp.operator === "&&" &&
            exp.left.type !== AST_NODE_TYPES.UnaryExpression &&
            exp.left.type !== AST_NODE_TYPES.BinaryExpression &&
            !isBooleanType(
              typeChecker.getTypeAtLocation(
                parserServices.esTreeNodeToTSNodeMap.get(exp.left)
              )
            )
          ) {
            context.report({
              node,
              messageId: "someId",
            });
          }
        }
      },
    };
  },
};
