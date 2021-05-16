import SyncEvent from 'syncevent'

export default function Pipe (length = 100) {
  const queue = []
  const hasData = new SyncEvent()
  const hasRoom = new SyncEvent()
  hasRoom.set()

  const reader = (async function * () {
    while (true) {
      await hasData.wait()
      const { value, done, error } = queue.shift()
      if (error) throw error
      if (done) return
      setEvents()
      yield value
    }
  })()

  const writer = {
    async write (value) {
      if (writer.closed) throw new PipeClosed()
      await _write({ value })
    },

    async throw (error) {
      if (writer.closed) throw new PipeClosed()
      writer.closed = true
      await _write({ error })
    },

    async close () {
      if (writer.closed) return
      writer.closed = true
      await _write({ done: true })
    }
  }

  async function _write (item) {
    await hasRoom.wait()
    queue.push(item)
    setEvents()
  }

  function setEvents () {
    if (queue.length && !hasData.isSet) hasData.set()
    if (queue.length < length && !hasRoom.isSet) hasRoom.set()
  }

  return [reader, writer]
}

class PipeClosed extends Error {
  constructor () {
    super('Pipe closed')
  }
}

Pipe.PipeClosed = PipeClosed
