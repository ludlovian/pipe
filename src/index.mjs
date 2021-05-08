import Lock from 'plock'

const EOD = {}

export default function createPipe (size = Infinity) {
  const queue = []
  const queueGate = new Lock()
  const dataGate = new Lock()
  dataGate.lock()

  const pipe = makePipe()

  return Object.assign(pipe, { push, close })

  async function * makePipe () {
    while (true) {
      await dataGate.lock()
      const item = queue.shift()
      if (item instanceof Error) throw item
      if (item === EOD) return
      if (queue.length < size) queueGate.unlock()
      yield item
      if (queue.length) dataGate.unlock()
    }
  }

  async function push (item) {
    await queueGate.lock()
    queue.push(item)
    if (queue.length < size) queueGate.unlock()
    dataGate.unlock()
  }

  function close () {
    pipe.push = () => Promise.reject(new Error('Pipe closed'))
    return push(EOD)
  }
}
