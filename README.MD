# TypeScript ESLint JSX Conditionals

TypeScript ESLint rule to remove unsafe conditionals in JSX.

`npm install --save-dev eslint-plugin-typescript-eslint-jsx-conditionals`
`yarn add -D eslint-plugin-typescript-eslint-jsx-conditionals`

## .eslintrc.js example:

```js
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'typescript-eslint-jsx-conditionals'],
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    'typescript-eslint-jsx-conditionals/strict-jsx-conditionals': 'error',
  },
}
```

## Valid:

```ts
const Component = ({ check }: { check: boolean }) => {
  return <div>{check && <p>Check</p>}</div>
}
```

```ts
const HelloWorld = () => {
  const someCondition = true
  return <div>{someCondition && <p>Check</p>}</div>
}
```

## Invalid:

Check might be undefined.

```ts
const Component = ({ check }: { check?: boolean }) => {
  return <div>{check && <p>Check</p>}</div>
}
```

message.length is a number

```ts
const HelloWorld = () => {
  const message = 'hello world'

  return <div>{message.length && <p>Check</p>}</div>
}
```

Check might not be a boolean

```ts
const Component = ({ check }: { check: boolean | string | null }) => {
  return <div>{check && <p>Check</p>}</div>
}
```

## Options

| Name          | Type    | Default Value | Description                                                                                             |
| ------------- | ------- | ------------- | ------------------------------------------------------------------------------------------------------- |
| preferBoolean | boolean | false         | When using auto-fix, use Boolean() cast instead of !!                                                   |
| normalize     | boolean | false         | ensure that your whole codebase uses the same type of casting - HIGHLY EXPERIMENTAL and NOT recommended |
