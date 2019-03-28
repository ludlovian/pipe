'use strict'

import PLock from 'plock'

export default class Postbox {
  constructor () {
    this._queue = []
    this._lock = new PLock()
    this._lock.lock()
  }

  post (item) {
    if (this._queue.push(item) === 1) this._lock.release()
  }

  async get ({ wait = false } = {}) {
    await this._lock.lock()
    const item = this._queue.shift()
    if (this._queue.length && !wait) this._lock.release()
    return item
  }

  release () {
    if (this._queue.length && this._lock.locks > 0) this._lock.release()
  }

  async * getAll () {
    while (true) {
      const item = await this.get()
      yield item
    }
  }

  get size () {
    return this._queue.length
  }
}
