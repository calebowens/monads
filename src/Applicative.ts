import { Functor } from './Functor'
import { constant } from './constant'

export abstract class Applicative<A> extends Functor<A> {
  abstract map<B>(mapping: (value: A) => B): Applicative<B>

  abstract amap<B>(mapping: Applicative<(value: A) => B>): Applicative<B>

  abstract pure<B>(value: B): Applicative<B>

  liftToApplicative<A, B, C>(fn: (value: A) => (value: B) => C):
    (a: Applicative<A>) => (b: Applicative<B>) => Applicative<C> {
    return (a) => (b) => b.amap(a.map(fn))
  }

  andLeft<B>(b: Applicative<B>) {
    return this.liftToApplicative<A, B, A>((a) => (b) => constant(a)(b))(this)(b)
  }

  andRight<B>(b: Applicative<B>) {
    return this.liftToApplicative<A, B, B>((a) => (b) => constant(b)(a))(this)(b)
  }

  and<B>(b: Applicative<B>) {
    return this.liftToApplicative<A, B, [A, B]>((a) => (b) => constant([a, b])(undefined) as [A, B])(this)(b)
  }
}