import { CallHKT, HKT } from './HKT'

export interface FunctorHKT extends HKT {
  output: Functor<this["input"]>
}

export abstract class Functor<A> {
  abstract map<B, Fun extends FunctorHKT>(mapping: (value: A) => B): CallHKT<Fun, B>

  replaceA<B>(value: B) {
    return this.map(() => value)
  }
}