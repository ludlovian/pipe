'use strict'

import PLock from 'plock'
import PSwitch from 'pswitch'

export default class Postbox {
  constructor (width = 1) {
    this._queue = []
    this._lock = new PLock(width)
    this._hasItems = new PSwitch(false)
  }

  post (item) {
    this._queue.push(item)
    this._hasItems.set(true)
  }

  async get ({ wait = false } = {}) {
    // to get an item of post, we must first wait until the postbox
    // has some items, and then try to get the lock
    //
    // It is possible that there are more readers than post items (e.g.
    // a 2-wide postbox with 2 active readers but one item of post.
    // They will both get locks, but only the first will find any post.
    // So we have to check for empty, and go around again if there is
    // nothing there.
    //
    while (true) {
      await this._hasItems.whenOn
      await this._lock.lock()
      if (this._queue.length) break
      // release the lock and try again
      this._lock.release()
    }
    // finally got an item of post
    const item = this._queue.shift()
    if (!wait) this.release()
    return item
  }

  release () {
    this._lock.release()
    // if this is the last item, then reset switch
    if (this._queue.length === 0) this._hasItems.set(false)
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

  get active () {
    return this._lock.locks
  }

  get idle () {
    return this._hasItems.whenOff
  }

  get busy () {
    return this._hasItems.whenOn
  }
}
