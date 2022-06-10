import { Monad, MonadHKT } from './Monad'

export interface OptionalHKT extends MonadHKT {
  output: Optional<this["input"]>
}

export class Optional<ValueT> extends Monad<ValueT> {
  constructor(public _success: boolean, public _value: ValueT | undefined | null) {
    super()
  }

  /**
   * Used to wrap a function that can potentially return null or undefined in a safe wrapper
   * ```ts
   * const safeQuerySelector = Optional.wrap(document.querySelector)
   * ```
   * @param fn
   */
  static wrap<FnT extends (...args: any[]) => any>(fn: FnT) {
    return (...args: Parameters<FnT>) => {
      const out = fn(...args)

      if (out === undefined || out === null) {
        return None<NonNullable<ReturnType<FnT>>>()
      } else {
        return Some<NonNullable<ReturnType<FnT>>>(out)
      }
    }
  }

  /**
   * If a value is held, this uses the mapping function to transform it, and returns Optional<New Value>
   *   otherwise, it returns None()
   * @param mapping
   */
  map<B>(mapping: (value: ValueT) => B): Optional<B> {
    if (this._success) {
      return Some(mapping(this._value as ValueT))
    } else {
      return None()
    }
  }

  amap<B>(mapping: Optional<(value: ValueT) => B>): Optional<B> {
    if (this._success) {
      if (mapping._success) {
        return Some(
          (mapping._value as (value: ValueT) => B)(this._value as ValueT)
        )
      }

      return None()
    }

    return None()
  }

  pure<B>(value: B): Optional<B> {
    return Some(value)
  }

  /**
   * If a value is held the mapping is preformed on it, otherwise None() is returned. If you want to just transform
   *  ValueT to a new Value, use `.map`
   * @param mapping
   */
  then<B>(mapping: (value: ValueT) => Optional<B>): Optional<B> {
    if (this._success) {
      return mapping(this._value as ValueT)
    }

    return None()
  }

  // Result specific methods

  /**
   * Returns the value is defined, otherwise it returns `defaultValue`
   * @param defaultValue
   */
  or<B>(defaultValue: B): ValueT | B {
    if (this._success) {
      return this._value as ValueT
    }

    return defaultValue
  }

  /**
   * If None() replace it with a value
   * @param mapping
   */
  catch<NewErrorT>(mapping: () => ValueT): Optional<ValueT> {
    if (this._success) {
      return Some(this._value as ValueT)
    }

    return Some(mapping())
  }

  /**
   * If None() replaces it with the result of the mapping
   * @param mapping
   */
  catchThen<NewErrorT>(mapping: () => Optional<ValueT>): Optional<ValueT> {
    if (this._success) {
      return Some(this._value as ValueT)
    }

    return mapping()
  }

  /**
   * Returns the value if Some(), otherwise it throws a reference error.
   * This is the nuclear option, `.or(default)` should be preferred.
   */
  unwrap(): ValueT {
    if (this._success) {
      return this._value as ValueT
    }

    // Kaboom, functional land just died :(
    throw new ReferenceError("When Optional<T> was unwrapped, no value was found")
  }
}


/**
 * Used to construct Some value, for example:
 *
 * @example
 * ```ts
 * // Gets all but the start of the string; IE "string" -> "tring"
 * function getStringTail(input: string): Optional<string> {
 *   if (input.length <= 1) {
 *     return None()
 *   } else {
 *     return Some(input.slice(1))
 *   }
 * }
 * ```
 * @param value
 */
export function Some<ValueT>(value: ValueT) {
  return new Optional<ValueT>(true, value)
}

/**
 * Used to construct Some value, for example:
 *
 * @example
 * ```ts
 * // Gets all but the start of the string; IE "string" -> "tring"
 * function getStringTail(input: string): Optional<string> {
 *   if (input.length <= 1) {
 *     return None()
 *   } else {
 *     return Some(input.slice(1))
 *   }
 * }
 * ```
 */
export function None<ValueT>() {
  return new Optional<ValueT>(false, null)
}

/**
 * Like Some() or None() but it doesn't mind if you give it a value or not.
 * @param value
 */
export function Maybe<ValueT>(value?: ValueT | undefined | null): Optional<NonNullable<ValueT>> {
  if (value) {
    return Some(value as NonNullable<ValueT>)
  } else {
    return None()
  }
}