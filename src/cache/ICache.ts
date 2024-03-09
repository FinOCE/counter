export interface ICache<T> {
  readonly count: number
  readonly lifetime: number

  get(key: string): Promise<T | null>

  set(key: string, value: T): Promise<void>

  remove(key: string): Promise<void>

  clear(hard?: boolean): Promise<number>
}
