import Lock from 'plock'

export default function createPipe (size = Infinity) {
  const queue = []
  const queueGate = new Lock()
  const dataGate = new Lock()
  dataGate.lock()
  let closed
  return Object.assign(
    (async function * () {
      while (true) {
        await dataGate.lock()
        const item = queue.shift()
        if ('error' in item) throw item.error
        if (item.done) return
        if (queue.length < size) queueGate.unlock()
        if (queue.length) dataGate.unlock()
        yield item.value
      }
    })(),
    {
      async push (value) {
        if (closed) throw new Error('Pipe closed')
        await _push({ value })
      },
      async close () {
        if (closed) return
        await _push({ done: true })
        closed = true
      },
      async throw (error) {
        if (closed) throw new Error('Pipe closed')
        await _push({ error })
        closed = true
      }
    }
  )

  async function _push (item) {
    await queueGate.lock()
    queue.push(item)
    if (queue.length < size) queueGate.unlock()
    dataGate.unlock()
  }
}
