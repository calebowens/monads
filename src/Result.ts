import { Monad, MonadHKT } from './Monad'
import { None, Optional, Some } from './Optional'
import { constant } from './constant'
import { Functor } from './Functor'
import { ApplicativeHKT } from './Applicative'


export interface ResultHKT<ErrorT> extends MonadHKT {
  output: Result<this["input"], ErrorT>
}

export class Result<ValueT, ErrorT> extends Monad<ValueT> {

  constructor(public _success: boolean, public _value: ValueT | ErrorT) {
    super()
  }

  /**
   * Used to wrap a potential error throwing function into a safe Result wrapped function. Usage looks like:
   * ```ts
   * const safeJsonParse = Result.wrap<typeof JSON.parse, SyntaxError>(JSON.parse)
   * ```
   * @param fn
   */
  static wrap<FnT extends (...args: any[]) => any, ErrorT>(fn: FnT) {
    return (...args: Parameters<FnT>) => {
      try {
        return Ok<ReturnType<FnT>, ErrorT>(fn(...args))
      } catch (e) {
        return Err<ReturnType<FnT>, ErrorT>(e as ErrorT)
      }
    }
  }

  /**
   * If Ok, this uses the mapping function to transform Value to a new Value, and returns Result<New Value, ErrorT>
   *   otherwise it propagates the ErrorT.
   * @param mapping
   */
  map<B>(mapping: (value: ValueT) => B): Result<B, ErrorT> {
    if (this._success) {
      return Ok<B, ErrorT>(mapping(this._value as ValueT))
    } else {
      return Err<B, ErrorT>(this._value as ErrorT)
    }
  }

  amap<B>(mapping: Result<(value: ValueT) => B, ErrorT>): Result<B, ErrorT> {
    if (this._success) {
      if (mapping._success) {
        return Ok(
          (mapping._value as (value: ValueT) => B)(this._value as ValueT)
        )
      }

      return Err(mapping._value as ErrorT)
    }

    return Err(this._value as ErrorT)
  }

  pure<B>(value: B): Result<B, ValueT> {
    return Ok(value)
  }

  /**
   * If Ok, the mapping of ValueT to a Result is run, otherwise the Error is propagated. If you want to just transform
   * ValueT to a new Value, use `.map`
   * @param mapping
   */
  then<B>(mapping: (value: ValueT) => Result<B, ErrorT>): Result<B, ErrorT> {
    if (this._success) {
      return mapping(this._value as ValueT)
    }

    return Err(this._value as ErrorT)
  }

  // Result specific methods

  /**
   * Returns the ValueT if Ok, otherwise it returns `defaultValue`
   * @param defaultValue
   */
  or<B>(defaultValue: B): ValueT | B {
    if (this._success) {
      return this._value as ValueT
    }

    return defaultValue
  }

  /**
   * If Err this runs the mapping from ErrorT => ValueT, otherwise it returns a new Result containing ValueT
   * @param mapping
   */
  catch<NewErrorT>(mapping: (value: ErrorT) => ValueT): Result<ValueT, NewErrorT> {
    if (this._success) {
      return Ok(this._value as ValueT)
    }

    return Ok(mapping(this._value as ErrorT))
  }

  /**
   * If Err this runs the mapping from ErrorT => Result<ValueT, NewErrorT>, otherwise it returns a new Result containing
   * ValueT
   * @param mapping
   */
  catchThen<NewErrorT>(mapping: (value: ErrorT) => Result<ValueT, NewErrorT>): Result<ValueT, NewErrorT> {
    if (this._success) {
      return Ok(this._value as ValueT)
    }

    return mapping(this._value as ErrorT)
  }

  /**
   * Returns the ValueT if Ok, otherwise it throws ErrorT. This is the nuclear option, `.or(default)` should be preferred.
   */
  unwrap(): ValueT {
    if (this._success) {
      return this._value as ValueT
    }

    // Kaboom, functional land just died :(
    throw this._value
  }

  /**
   * Converts a Result<ValueT, ErrorT> to an Optional<ValueT>
   */
  toOptional(): Optional<ValueT> {
    if (this._success) {
      return Some(this._value as ValueT)
    } else {
      return None()
    }
  }
}


/**
 * Used to construct an Ok value, for example:
 *
 * @example
 * ```ts
 * type ErrorMessage = string
 *
 * function safeDivide(a: number, b: number): Result<number, ErrorMessage> {
 *   if (b === 0) {
 *     return Err("Can't divide by zero")
 *   } else {
 *     return Ok(a / b)
 *   }
 * }
 * ```
 * @param value
 */
export function Ok<ValueT, ErrorT>(value: ValueT) {
  return new Result<ValueT, ErrorT>(true, value)
}

/**
 * Used to construct an Err value, for example:
 *
 * @example
 * ```ts
 * type ErrorMessage = string
 *
 * function safeDivide(a: number, b: number): Result<number, ErrorMessage> {
 *   if (b === 0) {
 *     return Err("Can't divide by zero")
 *   } else {
 *     return Ok(a / b)
 *   }
 * }
 * ```
 * @param value
 */
export function Err<ValueT, ErrorT>(value: ErrorT) {
  return new Result<ValueT, ErrorT>(false, value)
}