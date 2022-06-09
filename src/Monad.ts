import { Applicative } from './Applicative'
import { constant } from './constant'

export abstract class Monad<A> extends Applicative<A> {
  abstract map<B>(mapping: (value: A) => B): Monad<B>

  abstract amap<B>(mapping: Monad<(value: A) => B>): Monad<B>

  abstract pure<B>(value: B): Monad<B>

  abstract then<B>(mapping: (value: A) => Monad<B>): Monad<B>
}