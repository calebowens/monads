# Caleb's Monads
Error handling monadic patterns and abstract classes for monads

API Docs: [HERE!](https://calebowens.github.io/monads/)

Git Repo: [HERE!](https://github.com/calebowens/monads)

NPM Listing: [HERE!](https://www.npmjs.com/package/monads-co)

## Uhh, what is a monad? 

Clearly, a monad is a monoid in the category of endofunctors...

For those of us who don't have a PhD in category theory, it will suffice to say that it's something that implements our `Monad<T>` class. In the real world, they provide a powerful interface for mapping and manipulating data.

You probably already work with a monad in your day-to-day life with JavaScript's Promises, they encapsulate a value and let you manipulate it with a "mapping" function, namely `.then`.

The JS Promise could be considered not a "true" monad, but the analogy will suffice for basing your understanding off of.

I think examples are a very powerful tool for coming to understand the behaviour of an abstraction, so I hope the following examples can shed some light for you.

## Examples

The most simple example is the `Optional<T>` type in this library which enables a function to either return a value, or not. This is not a particularly useful abstraction in JS/TS when you can return `T | undefined` as the type, but is fantastic for illustrative purposes.

### Wrapping a function

For my example function I'm going to use document.querySelector() as it will return `Element | null` and we would like to deal only with the `Element` it returns.

```ts
import { Optional } from './Optional'

const safeQuerySelect = Optional.wrap(document.querySelector)
```

This sets the `safeQuerySelect` constant, to a function that takes in the same arguments as `document.querySelector()`, but instead returns `Optional<Element>`.

### Doing something with the function's return

I think it's not too unlikely a scenario that you would want to get an input element and want to get it's held value. So this is what the current snippet does, while also providing a default value.

```ts
const content = safeQuerySelect('#my-input')
  .map((element: HTMLInputElement) => element.value)
  .or('default input')
```

- `safeQuerySelect('#my-input')` This returns Optional\<Element\>.
- `.map((element: HTMLInputElement) => element.value)` If there is in fact an element that has been found, it preforms the function `(element: HTMLInputElement) => element.value` on it. This returns now `Optional<string>`.
- `.or('default input')` This method lets you provide a default value, if it happens to be that no element was found.

So what is the final value of `content`? Well, if an element is found, it will return its value, otherwise it will set `content` to the string `"default value"`.

### Making the example safer

Some of you might have noticed that I cast `element` to `HTMLInputElement` which is an "unsafe" operation as in reality, if someone made a html div element, and gave it the tag `#my-input`, it would not have a .value property.

What we would really like to do is to have our map return `Optional<string>` so our default could be used if there is no `.value` property. We've actually got the `.then()` function which lets us return an Optional<string> and it flattens out so we don't end up with an `Optional<Optional<string>>` like you would expect with `.map()`, rather you're left with just `Optional<string>`.

```ts
const content = safeQuerySelect('#my-input')
  .then((element) => Maybe<string>(element.getAttribute('value')))
  .or('default input')
```

- `safeQuerySelect('#my-input')` Returns `Optional<Element>`
- `.then((element) => Maybe<string>(element.getAttribute(value)))`
  - `element.getAttribute("value")` Fetches value attribute returning `string | null`.
  - `Maybe<string>(...)` Converts the `string | null` to `Optional<string>`.
  - `.then((element) => ...)` performs the mapping, but returns only `Optional<string>` similar to a flatMap.
- `.or('default input')` Then will return either our element's value, or the default string.

### Error handling

Its basically the same as Rust's... TODO: Write docs form Result\<ValueT, ErrorT\>