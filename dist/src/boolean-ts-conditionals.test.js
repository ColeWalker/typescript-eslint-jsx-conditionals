// import { RuleTester } from "@typescript-eslint/experimental-utils;
import { RuleTester } from "eslint";
import typescriptEslint from "@typescript-eslint/parser";
import * as rule from "./boolean-jsx-conditionals";
const ruleTester = new RuleTester({
    parser: typescriptEslint,
    parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: 6,
        tsconfigRootDir: __dirname + "/..",
        ecmaFeatures: { jsx: true },
    },
});
ruleTester.run("boolean-jsx-conditionals", rule, {
    valid: [
        `
 const Component = ({check}) => (<div>{check && <p>Check</p>}</div>)
    `,
    ],
    invalid: [
        {
            code: "let x: string return <>{x.length && <div></div></>",
            errors: [
                {
                    messageId: "direct",
                },
            ],
            output: "true;",
        },
    ],
});
