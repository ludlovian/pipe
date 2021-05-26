import Chain from 'chain'

export default function Pipe () {
  const chain = new Chain({
    atEnd: () => new Promise(resolve => (chain.tail.resolve = resolve))
  })
  let curr = chain.tail
  return [
    { [Symbol.asyncIterator]: () => ({ next }) },
    {
      write: value => write({ value }),
      close: _ => write({ done: true }),
      throw: error => write({ error })
    }
  ]

  function write (item) {
    const prev = chain.tail
    if (prev.done) return
    item = chain.add(item, item.done)
    if (prev.resolve) prev.resolve(item)
  }

  async function next () {
    const { value, done, error } = (curr = await curr.next())
    if (error) {
      chain.add({ done: true }, true)
      curr = chain.tail
      throw error
    }
    return { value, done }
  }
}
