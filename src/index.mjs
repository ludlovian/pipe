export default function Pipe () {
  let head = {}
  let tail = head

  const reader = {
    next,
    [Symbol.asyncIterator]: () => reader
  }
  const writer = {
    write: value => write({ value }),
    close: _ => write({ done: true }),
    throw: error => write({ error })
  }
  return [reader, writer]

  function write (item) {
    if (tail.done) return undefined
    if (item.done) item.next = Promise.resolve(item)
    if (tail.resolve) tail.resolve(item)
    else tail.next = Promise.resolve(item)
    tail = item
  }

  async function next () {
    if (!head.next) {
      head.next = new Promise(resolve => (head.resolve = resolve))
    }
    head = await head.next
    const { value, done, error } = head
    if (error) {
      tail = { done: true }
      tail.next = head.next = Promise.resolve(tail)
      throw error
    }
    return { value, done }
  }
}
