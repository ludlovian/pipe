import PSwitch from 'pswitch'

const EOF = {}

export default class PPipe {
  constructor () {
    this._queue = []
    this._open = true
    this._hasItems = new PSwitch(false)
  }

  push (item) {
    if (!this._open) throw new Error('Pipe is closed')
    this._queue.push(item)
    this._hasItems.set(true)
  }

  close () {
    this.push(EOF)
    this._open = false
  }

  async * read () {
    while (true) {
      await this._hasItems.when(true)
      const item = this._queue.shift()
      this._hasItems.set(!!this._queue.length)
      if (item === EOF) return
      yield item
    }
  }
}
