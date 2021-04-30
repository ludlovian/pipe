import PSwitch from 'pswitch'

const EOF = {}

export default class PPipe {
  constructor () {
    this.queue = []
    this.open = true
    this.empty = new PSwitch(true)
  }

  push (item) {
    if (!this.open) throw new Error('Pipe is closed')
    this.queue.push(item)
    this.empty.set(false)
  }

  close () {
    if (!this.open) return
    this.push(EOF)
    this.open = false
  }

  async * read () {
    while (true) {
      await this.empty.when(false)
      const item = this.queue.shift()
      this.empty.set(!this.queue.length)
      if (item === EOF) return
      yield item
    }
  }
}
