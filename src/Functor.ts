export abstract class Functor<A> {
  abstract map<B>(mapping: (value: A) => B): Functor<B>

  replaceA<B>(value: B) {
    return this.map(() => value)
  }
}