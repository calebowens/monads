import { Functor, FunctorHKT } from './Functor'
import { constant } from './constant'
import { CallHKT } from './HKT'

export interface ApplicativeHKT extends FunctorHKT {
  output: Applicative<this["input"]>
}

export abstract class Applicative<A> extends Functor<A> {
  abstract amap<B, App extends ApplicativeHKT>(mapping: CallHKT<App, (value: A) => B>): CallHKT<App, B>

  abstract pure<B, App extends ApplicativeHKT>(value: B): CallHKT<App, B>

  static liftToApplicative<A, B, C, App extends ApplicativeHKT>(fn: (value: A) => (value: B) => C):
    (a: CallHKT<App, A>) => (b: CallHKT<App, B>) => CallHKT<App, C> {
    return (a: CallHKT<App, A>) => (b: CallHKT<App, B>) => b.amap<CallHKT<App, (value: B) => C>, App>(a.map<(value: B) => C, App>(
      // @ts-ignore
      fn
    ))
  }

  andIgnoreRight<B, App extends ApplicativeHKT>(b: CallHKT<App, B>): CallHKT<App, A> {
    return Applicative.liftToApplicative<A, B, A, App>((a) => (b) => constant(a)(b))(this)(b)
  }

  andIgnoreLeft<B, App extends ApplicativeHKT>(b: CallHKT<App, B>): CallHKT<App, B> {
    return Applicative.liftToApplicative<A, B, B, App>((a) => (b) => constant(b)(a))(this)(b)
  }

  and<B, App extends ApplicativeHKT>(b: CallHKT<App, B>): CallHKT<App, [A, B]> {
    return Applicative.liftToApplicative<A, B, [A, B], App>((a) => (b) => constant([a, b])(undefined) as [A, B])(this)(b)
  }
}