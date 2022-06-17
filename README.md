# Not-Me

> Easy and type-safe validation

## Features:

- Planned out to be used and shared **between backend and frontend**
- **Powerful type inference**: no need to write types manually. Even _Discriminated Union types_ are guessed from your schemas.
  - Example of a _Discriminated Union Type_:
  ```typescript
  type UnionType =
    | {
        discriminator: "has-a";
        a: string;
      }
    | {
        discriminator: "has-b";
        b: boolean;
      };
  ```
- Simple **DSL-like** API
- **No need for _try/catches_**: the final result will always be returned as the transformed input, or a tree of error messages. This way, there is no need to rearrange the flow to accomodate the _try/catch_, while reminding you to deal with validation errors
- **Easy to extend**. You can create a new schema just by extending the classes from the ones provided here
- **Implementation that is easy to read and change**. If you really need so, you can fork this library and change it without much hassle
- **API inspired** by `yup` and `joi`

## Quick links:

- [CONTRIBUTING](CONTRIBUTING.md)
- [LICENSE](LICENSE.md)

## Motivation behind this package

This package was built in order to fix some shortcomings (specially with _type safety_) that many validation libraries have. Most validation libraries try to do a lot, and their code starts getting confusing and with a lot of back and forths. As consequence, unsolved Github issues start pilling up, improving or extending the libraries ourselves becomes hard since there are too many flows with some history behind them, and a lot of broad types (like `any` or `object`) start surfacing and undermining the _type safety_ of a project.

Our take on validation with `not-me` is almost to provide you with enough boilerplate for you to build your own validations schemas. This way, it's easy to maintain and improve this package.

## How to use it

### Installing:

```
$ npm install not-me
```

### Imports:

> Most IDEs and Javascript text editors (like _Visual Studio Code_) import modules automatically just by starting to write the name of the value you want to use.

Keeping an app's code splitted into small lazy-loaded chunks is a priority in frontend development. Since legacy systems and some bundlers, like React Native's _Metro_, do not have tree-shaking, this package does not provide a single `index.js` import with all the code bundled in it. Instead, you are encouraged to import what you need from within the directories the package has. For example, the schemas are inside the `lib/schemas` directory, so if you want to import a schema for an object type, you need to import it like this `import { object } from 'not-me/lib/schemas/object/object-schema`

### Building schemas:

This library offers the following basic types for you to build more complex validation schemas:

- `array(elementsSchema)`
- `boolean()`
- `date()`
- `equals([...allowed values])`
  - use `as const` for when you want the types to be the exact value literals. Example: `equals([2, 'hello'])` validated value will be typed as `number | string` but `equals([2, 'hello'] as const)` validated value will be typed as `2 | 'hello'`
- `number()`
- `object({ property: schemaForTheProperty })`
- `objectOf(schemaForAllProperties)` - same as `object()` but for objects whose keys can be any string
- `string()`
- `or([...schemas])` - the value is filtered by multiple schemas till one matches. It's the equivalent to an _union type_

With these basic blocks, you can build more complex validations, by chaining...

- `test((v) => <condition> ? null : "Error message")` - will validate if your value matches a condition. If it does, return `null`. If it doesn't match the condition, return a `string` with the error message you want to return.
- `transform((v) => <transform input value into any other value>)` - will allow you to modify the input value
- `required()` - sets the schema to reject `undefined` and `null` values
- `defined()` - sets the schema to reject `undefined` values
- `notNull()` - sets the schema to reject `null` values

The methods above are all inherited from the `base()` schema. Other schemas might provide their own helpful methods, like `string()` provides `string().filled()`, a method that makes sure the field is filled not just with blank spaces.

Typescript will guide you in the recommended order by which you should chain validations.

If you follow what auto-complete presents to you, you will be fine.

### Error messages:

Most of these schemas and their methods (except `transform`) have a last parameter that allows you to set a customized error message for when the value fails to meet the conditions.

You can also customize the default error messages by using the `DefaultErrorMessagesManager` in `error-messages/default-messages/default-error-messages-manager`.

### Union typed schemas:

```typescript
/*
  schema will output
  { common: string } & ({ a: "a"; c: number } | { a: "b"; d: boolean })

  `as const` statements are needed to infer the literal value (like 'a' | 'b')
  instead of a generic value like `string`
*/
const schema = object({
  common: equals(["common"]).required(),
  a: equals(["a", "b"] as const).required(),
})
  .union((v) => {
    if (v.a === "a") {
      return {
        a: equals(["a"] as const).required(),
        c: equals([0]).required(),
      };
    } else {
      return {
        a: equals(["b"] as const).required(),
        d: equals([false]).required(),
      };
    }
  })
  .required();
```

### Type utilities (at `not-me/lib/schemas/schema`):

- **`InferType<typeof schema>`**: get the output type of a schema
- **`Schema<T>`**: dictates that a value is a schema that has an output type of `T`

### Validation options

- `abortEarly`: stop validation when the first invalid field is found.

### Creating a custom schema:

```typescript
import { number } from "not-me/lib/schemas/number/number-schema";

export function positiveInteger() {
  return number()
    .integer()
    .test((n) => {
      // Skip nullable values
      if (n == null) {
        return null;
      }

      if (n >= 0) {
        return null;
      } else {
        return "Not a positive number";
      }
    });
}
```

### How it works under the hood:

When you set up a schema, you're just pilling up filter functions that will test and transform your initial value. These are the types of filters that are called during validation, by this order:

- **Type filter** will validate if your input is in a specific type (example: a number, an object, an array, etc...)
- **Shape filters** will validate the fields in your value. This only applies to object and array values
- **Test and Transform filters** will run basic _true_ or _false_ checks on your value, or transform your value.

## Library development

### Changing the supported Node version

- Files to be changed
  - .nvmrc
  - Dockerfile.dev
  - package.json
    - `engine` field
    - `@types/node` version
  - tsconfig.json
  - .github/workflows/main.yml and other CI config files
- delete all `node_modules` directories and `package-lock.json` files
- run `npm run install`
