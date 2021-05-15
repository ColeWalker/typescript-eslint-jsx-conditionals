import * as ts from "typescript";
import * as tsutils from "tsutils";
import { AST_NODE_TYPES, ESLintUtils, } from "@typescript-eslint/experimental-utils";
module.exports = {
    meta: {
        docs: {
            description: "Ensure variables in JSX conditionals are always cast to booleans, to avoid unwanted side effects with other falsey values like empty strings etc.",
            category: "Possible Errors",
            recommended: true,
            url: "",
        },
        messages: "",
        type: null,
        schema: [],
    },
    create(context) {
        console.log(context);
        const parserServices = ESLintUtils.getParserServices(context);
        const typeChecker = parserServices.program.getTypeChecker();
        function isBooleanType(expressionType) {
            return tsutils.isTypeFlagSet(expressionType, ts.TypeFlags.Boolean | ts.TypeFlags.BooleanLiteral);
        }
        return {
            JSXExpressionContainer: function (node) {
                const exp = node.expression;
                if (exp.type === AST_NODE_TYPES.LogicalExpression) {
                    if (exp.operator === "&&" &&
                        exp.left.type !== AST_NODE_TYPES.UnaryExpression &&
                        exp.left.type !== AST_NODE_TYPES.BinaryExpression &&
                        !isBooleanType(typeChecker.getTypeAtLocation(parserServices.esTreeNodeToTSNodeMap.get(exp.left)))) {
                        context.report(exp.left, "Logical expressions must be cast to booleans");
                    }
                }
            },
        };
    },
};
