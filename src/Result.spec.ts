import { describe } from 'mocha'
import { Err, Ok, Result, ResultHKT } from './Result'
import { expect } from 'chai'

describe('Result', () => {
  describe('#map', () => {
    it('Should replace transform the result\'s value if it exists', () => {
      const a = Ok<number, unknown>(4)
      const b = a.map((value) => value + 1)

      expect(b._value).to.eq(5)
    })

    it('Should propagate the error otherwise', () => {
      const a = Err<number, string>('failure occurred')
      const b = a.map((value) => value + 1)

      expect(b._value).to.eq('failure occurred')
    })
  })

  describe('#amap', () => {
    it('Should perform mapping if all Ok', () => {
      const a = Ok<number, string>(4)
      const fn = Ok<(value: number) => number, string>((value) => value + 1)

      const b = a.amap(fn)

      expect(b._value).to.eq(5)
    })

    it('Should return value error if Err', () => {
      const a = Err<number, string>('a')
      const fn = Ok<(value: number) => number, string>((value) => value + 1)

      const b = a.amap(fn)

      expect(b._value).to.eq('a')
    })

    it('Should return fn error if Err', () => {
      const a = Ok<number, string>(4)
      const fn = Err<(value: number) => number, string>('b')

      const b = a.amap(fn)

      expect(b._value).to.eq('b')
    })

    it('Should return mapping error if both are Err', () => {
      const a = Err<number, string>('a')
      const fn = Err<(value: number) => number, string>('b')

      const b = a.amap(fn)

      expect(b._value).to.eq('b')
    })
  })

  describe('#pure', () => {
    it('Should create a new result with new value', () => {
      const a = Ok(3)

      const b = a.pure(4)

      expect(b._value).to.eq(4)
    })

    it('Should replace an error', () => {
      const a = Err<number, string>('a')

      const b = a.pure(4)

      expect(b._value).to.eq(4)
    })
  })

  describe('#then', () => {
    it('Should transform the result\'s value if it exists', () => {
      const a = Ok(4)
      const b = a.then((value) => Ok(value + 1))

      expect(b._value).to.eq(5)
    })

    it('Should propagate error if value Err', () => {
      const a = Err<number, string>('a')
      const b = a.then((value) => Ok(value + 1))

      expect(b._value).to.eq('a')
    })

    it('Should return mapping error if its an Err', () => {
      const a = Ok(4)
      const b = a.then(() => Err('b'))

      expect(b._value).to.eq('b')
    })

    it('Should prefer original Err', () => {
      const a = Err('a')
      const b = a.then(() => Err('b'))

      expect(b._value).to.eq('a')
    })
  })

  describe('#and', () => {
    it('Should form Ok([a, b]) from Ok(a) and Ok(b)', () => {
      const a = Ok(2)
      const b = Ok(3)

      const c = a.and<number, ResultHKT<unknown>>(b)

      expect(c._value).to.deep.eq([2, 3])
    })

    it('Should Err if Left is Err', () => {
      const a = Err('a')
      const b = Ok<number, string>(3)

      const c = a.and<number, ResultHKT<string>>(b)

      expect(c._value).to.eq('a')
    })

    it('Should Err if Right is Err', () => {
      const a = Ok(2)
      const b = Err<number, string>('b')

      const c = a.and<number, ResultHKT<string>>(b)

      expect(c._value).to.eq('b')
    })

    it('Should Err if Left if both are Err', () => {
      const a = Err('a')
      const b = Err('b')

      const c = a.and<unknown, ResultHKT<string>>(b)

      expect(c._value).to.eq('a')
    })
  })

  describe('#andIgnoreRight', () => {

    it('Should form Ok(a) from Ok(a) and Ok(b)', () => {
      const a = Ok(2)
      const b = Ok(3)

      const c = a.andIgnoreRight<number, ResultHKT<unknown>>(b)

      expect(c._value).to.eq(2)
    })

    it('Should Err if Left is Err', () => {
      const a = Err('a')
      const b = Ok<number, string>(3)

      const c = a.andIgnoreRight<number, ResultHKT<string>>(b)

      expect(c._value).to.eq('a')
    })

    it('Should Err if Right is Err', () => {
      const a = Ok(2)
      const b = Err<number, string>('b')

      const c = a.andIgnoreRight<number, ResultHKT<string>>(b)

      expect(c._value).to.eq('b')
    })

    it('Should Err if Left if both are Err', () => {
      const a = Err('a')
      const b = Err('b')

      const c = a.andIgnoreRight<unknown, ResultHKT<string>>(b)

      expect(c._value).to.eq('a')
    })
  })


  describe('#andIgnoreLeft', () => {

    it('Should form Ok(b) from Ok(a) and Ok(b)', () => {
      const a = Ok(2)
      const b = Ok(3)

      const c = a.andIgnoreLeft<number, ResultHKT<unknown>>(b)

      expect(c._value).to.eq(3)
    })

    it('Should Err if Left is Err', () => {
      const a = Err('a')
      const b = Ok<number, string>(3)

      const c = a.andIgnoreLeft<number, ResultHKT<string>>(b)

      expect(c._value).to.eq('a')
    })

    it('Should Err if Right is Err', () => {
      const a = Ok(2)
      const b = Err<number, string>('b')

      const c = a.andIgnoreLeft<number, ResultHKT<string>>(b)

      expect(c._value).to.eq('b')
    })

    it('Should Err if Left if both are Err', () => {
      const a = Err('a')
      const b = Err('b')

      const c = a.andIgnoreLeft<unknown, ResultHKT<string>>(b)

      expect(c._value).to.eq('a')
    })
  })

  describe('#catch', () => {
    it('Should do nothing if LHS Ok', () => {
      const a = Ok<number, string>(2)

      const b = a.catch(() => 3)

      expect(b._value).to.eq(2)
    })

    it('Should map error if LHS Err', () => {
      const a = Err<number, string>('a')

      const b = a.catch((error) => error === 'a' ? 1 : 2)

      expect(b._value).to.eq(1)
    })
  })

  describe('#catchThen', () => {
    it('Should do nothing if LHS Ok', () => {
      const a = Ok<number, string>(2)

      const b = a.catchThen(() => Ok(3))

      expect(b._value).to.eq(2)
    })

    it('Should return Ok if mapping Ok if LHS Err', () => {
      const a = Err<number, string>('a')

      const b = a.catchThen((error) => Ok(error === 'a' ? 1 : 2))

      expect(b._value).to.eq(1)
    })

    it('Should return Err if mapping Err if LHS Err', () => {
      const a = Err<number, string>('a')

      const b = a.catchThen((error) => Err('b'))

      expect(b._value).to.eq('b')
    })
  })

  describe('#toOptional', () => {
    it('Should return Some(T) for Ok(T)', () => {
      const a = Ok<number, string>(2)

      const b = a.toOptional()

      expect(b._value).to.eq(2)
    })

    it('Should return None for Err', () => {
      const a = Err<number, string>('b')

      const b = a.toOptional()

      expect(b._value).to.eq(null)
    })
  })
})