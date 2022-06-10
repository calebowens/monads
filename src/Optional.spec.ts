import { describe } from 'mocha'
import { Err, Ok, Result, ResultHKT } from './Result'
import { expect } from 'chai'
import { None, OptionalHKT, Some } from './Optional'

describe('Optional', () => {
  describe('#map', () => {
    it('Should replace transform the result\'s value if it exists', () => {
      const a = Some(4)
      const b = a.map((value) => value + 1)

      expect(b._value).to.eq(5)
    })

    it('Should propagate None otherwise', () => {
      const a = None<number>()
      const b = a.map((value) => value + 1)

      expect(b._value).to.eq(null)
    })
  })

  describe('#amap', () => {
    it('Should perform mapping if all Some', () => {
      const a = Some<number>(4)
      const fn = Some<(value: number) => number>((value) => value + 1)

      const b = a.amap(fn)

      expect(b._value).to.eq(5)
    })

    it('Should return None if None', () => {
      const a = None<number>()
      const fn = Some<(value: number) => number>((value) => value + 1)

      const b = a.amap(fn)

      expect(b._value).to.eq(null)
    })

    it('Should return None if fn None', () => {
      const a = Some<number>(4)
      const fn = None<(value: number) => number>()

      const b = a.amap(fn)

      expect(b._value).to.eq(null)
    })

    it('Should return None if both None', () => {
      const a = None<number>()
      const fn = None<(value: number) => number>()

      const b = a.amap(fn)

      expect(b._value).to.eq(null)
    })
  })

  describe('#pure', () => {
    it('Should create a new Some() with new value', () => {
      const a = Some(3)

      const b = a.pure(4)

      expect(b._value).to.eq(4)
    })

    it('Should replace a None', () => {
      const a = None()

      const b = a.pure(4)

      expect(b._value).to.eq(4)
    })
  })

  describe('#then', () => {
    it('Should transform Some(value) if it exists', () => {
      const a = Some(4)
      const b = a.then((value) => Some(value + 1))

      expect(b._value).to.eq(5)
    })

    it('Should propagate None if value None', () => {
      const a = None<number>()
      const b = a.then((value) => Some(value + 1))

      expect(b._value).to.eq(null)
    })

    it('Should return None if ampping None', () => {
      const a = Some(4)
      const b = a.then(() => None())

      expect(b._value).to.eq(null)
    })

    it('If both None, return None', () => {
      const a = None()
      const b = a.then(() => None())

      expect(b._value).to.eq(null)
    })
  })

  describe('#and', () => {
    it('Should form Some([a, b]) from Some(a) and Some(b)', () => {
      const a = Some(2)
      const b = Some(3)

      const c = a.and<number, OptionalHKT>(b)

      expect(c._value).to.deep.eq([2, 3])
    })

    it('Should None if Left is None', () => {
      const a = None()
      const b = Some(3)

      const c = a.and<number, OptionalHKT>(b)

      expect(c._value).to.eq(null)
    })

    it('Should None if Right is None', () => {
      const a = Some(2)
      const b = None<number>()

      const c = a.and<number, OptionalHKT>(b)

      expect(c._value).to.eq(null)
    })

    it('Should None if Left if both are None', () => {
      const a = None()
      const b = None()

      const c = a.and<unknown, OptionalHKT>(b)

      expect(c._value).to.eq(null)
    })
  })

  describe('#andIgnoreRight', () => {
    it('Should form Some(a) from Some(a) and Some(b)', () => {
      const a = Some(2)
      const b = Some(3)

      const c = a.andIgnoreRight<number, OptionalHKT>(b)

      expect(c._value).to.eq(2)
    })

    it('Should None if Left is None', () => {
      const a = None()
      const b = Some(3)

      const c = a.andIgnoreRight<number, OptionalHKT>(b)

      expect(c._value).to.eq(null)
    })

    it('Should None if Right is None', () => {
      const a = Some(2)
      const b = None<number>()

      const c = a.andIgnoreRight<number, OptionalHKT>(b)

      expect(c._value).to.eq(null)
    })

    it('Should None if Left if both are None', () => {
      const a = None()
      const b = None()

      const c = a.andIgnoreRight<unknown, OptionalHKT>(b)

      expect(c._value).to.eq(null)
    })
  })


  describe('#andIgnoreLeft', () => {
    it('Should form Some(b) from Some(a) and Some(b)', () => {
      const a = Some(2)
      const b = Some(3)

      const c = a.andIgnoreLeft<number, OptionalHKT>(b)

      expect(c._value).to.eq(3)
    })

    it('Should None if Left is None', () => {
      const a = None()
      const b = Some(3)

      const c = a.andIgnoreLeft<number, OptionalHKT>(b)

      expect(c._value).to.eq(null)
    })

    it('Should None if Right is None', () => {
      const a = Some(2)
      const b = None<number>()

      const c = a.andIgnoreLeft<number, OptionalHKT>(b)

      expect(c._value).to.eq(null)
    })

    it('Should None if Left if both are None', () => {
      const a = None()
      const b = None()

      const c = a.andIgnoreLeft<unknown, OptionalHKT>(b)

      expect(c._value).to.eq(null)
    })
  })


  describe('#catch', () => {
    it('Should do nothing if LHS Some', () => {
      const a = Some<number>(2)

      const b = a.catch(() => 3)

      expect(b._value).to.eq(2)
    })

    it('Should map if LHS None', () => {
      const a = None()

      const b = a.catch(() => 3)

      expect(b._value).to.eq(3)
    })
  })

  describe('#catchThen', () => {
    it('Should do nothing if LHS Some', () => {
      const a = Some<number>(2)

      const b = a.catchThen(() => Some(3))

      expect(b._value).to.eq(2)
    })

    it('Should return Ok if mapping Ok if LHS Err', () => {
      const a = None()

      const b = a.catchThen(() => Some(1))

      expect(b._value).to.eq(1)
    })

    it('Should return Err if mapping Err if LHS Err', () => {
      const a = None()

      const b = a.catchThen(() => None())

      expect(b._value).to.eq(null)
    })
  })
})
