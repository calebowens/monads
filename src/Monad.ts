import { Applicative, ApplicativeHKT } from './Applicative'
import { CallHKT } from './HKT'

export interface MonadHKT extends ApplicativeHKT {
  output: Monad<this["input"]>
}

export abstract class Monad<A> extends Applicative<A> {
  abstract then<B, Mon extends MonadHKT>(mapping: (value: A) => CallHKT<Mon, B>): CallHKT<Mon, B>
}