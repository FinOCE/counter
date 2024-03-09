import { ICache } from "./ICache"

export class MemoryCache<T> implements ICache<T> {
  private _history: Record<string, number> = {}
  private _cache: Record<string, T> = {}

  public constructor(public readonly lifetime: number) {}

  public get count() {
    return Object.keys(this._cache).length
  }

  public async get(key: string) {
    const item = this._cache[key]
    if (item) this._history[key] = Date.now()
    return item
  }

  public async set(key: string, value: T) {
    this._history[key] = Date.now()
    this._cache[key] = value
  }

  public async remove(key: string) {
    delete this._history[key]
    delete this._cache[key]
  }

  public async clear(hard: boolean = false) {
    if (hard) {
      const count = this.count

      this._history = {}
      this._cache = {}

      return count
    } else {
      const oldCount = this.count

      const now = Date.now()
      for (const key in this._history) if (now - this._history[key] > this.lifetime) this.remove(key)

      const newCount = this.count
      return oldCount - newCount
    }
  }
}
