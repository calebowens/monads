/**
 * This is a wild one. So, currently typescript has no ability to define a function that returns some generic structure
 *  with the generic applied as one of the function parameters. To get around this we use a "Higher Kinded Type Encoding"
 *  and this structure is the base template for that.
 *
 *  If you are implementing a type that extends Applicative, you will want to define a companion HKT Encoding so the
 *  `.and()` methods chaining behaviour works correctly
 *
 *  @example
 *  ```ts
 *  export interface ResultHKT<ErrorT> extends MonadHKT {
 *    output: Result<this["input"], ErrorT>
 *  }
 *  ```
 */
export interface HKT {
  input: unknown,
  output: unknown
}

/**
 * This type function lets you apply a type to a HKT.
 *
 * @example
 * ```ts
 * declare function <A, B, C extends HKT>map(self: CallHKT<C, A>, mapping: (value: A) => B): CallHKT<C, B>
 * ```
 */
export type CallHKT<F extends HKT, I> =
  (F & { input: I })["output"]
