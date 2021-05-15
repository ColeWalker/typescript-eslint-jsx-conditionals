import { RuleTester } from '@typescript-eslint/experimental-utils/dist/ts-eslint/RuleTester'
import * as rule from './strict-jsx-conditionals'

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2018,
    tsconfigRootDir: __dirname,
    ecmaFeatures: { jsx: true },
    project: './tsconfig.json',
  },
})

ruleTester.run('boolean-jsx-conditionals', rule as any, {
  valid: [
    `
 const Component = ({check}: {check: boolean}) => (<div>{check && <p>Check</p>}</div>)
    `,
    `
 const Component = ({check}: {check: string}) => (<div>{check.length ? <p>Check</p>: <p>Check</p>}</div>)
    `,
    `
 const Component = ({check}: {check: string}) => (<div>{!!check.length && <p>Check</p>}</div>)
    `,
    `
 const Component = ({check}: {check: string}) => (<div>{Boolean(check.length) && <p>Check</p>}</div>)
    `,
  ],

  invalid: [
    {
      code: `const Component = ({check}: {check: string}) => (<div>{check && <p>Check</p>}</div>)`,
      output: `const Component = ({check}: {check: string}) => (<div>{!!check && <p>Check</p>}</div>)`,
      errors: [{ messageId: 'someId' }],
    },
    {
      code: `const Component = ({check}: {check?: boolean}) => (<div>{check && <p>Check</p>}</div>)`,
      output: `const Component = ({check}: {check?: boolean}) => (<div>{!!check && <p>Check</p>}</div>)`,
      errors: [{ messageId: 'someId' }],
    },
    {
      code: `const Component = ({check}: {check: boolean | string }) => (<div>{check && <p>Check</p>}</div>)`,
      output: `const Component = ({check}: {check: boolean | string }) => (<div>{!!check && <p>Check</p>}</div>)`,
      errors: [{ messageId: 'someId' }],
    },
    {
      code: `const Component = ({check}: {check: boolean | null }) => (<div>{check && <p>Check</p>}</div>)`,
      output: `const Component = ({check}: {check: boolean | null }) => (<div>{!!check && <p>Check</p>}</div>)`,
      errors: [
        {
          messageId: 'someId',
        },
      ],
    },
    {
      code: `const Component = ({check}: {check: boolean | null }) => (<div>{check && <p>Check</p>}</div>)`,
      output: `const Component = ({check}: {check: boolean | null }) => (<div>{Boolean(check) && <p>Check</p>}</div>)`,
      errors: [
        {
          messageId: 'someId',
        },
      ],
      options: [{ preferBoolean: true }],
    },
  ],
})
