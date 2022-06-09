export interface HKT {
  input: unknown,
  output: unknown
}

export type CallHKT<F extends HKT, I> =
  (F & { input: I })["output"]
