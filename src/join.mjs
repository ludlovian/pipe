export default function join (...sources) {
  return pipe()
  async function * pipe () {
    const iterators = sources.map(createIterator)
    const nexts = iterators.map(createNext)
    while (nexts.some(Boolean)) {
      const item = await Promise.race(nexts.filter(Boolean))
      const { index, value, done, error } = item
      if (error) throw Object.assign(error, { index })
      if (done) {
        nexts[index] = undefined
      } else {
        yield [index, value]
        nexts[index] = createNext(iterators[index], index)
      }
    }
  }
}

function createIterator (source) {
  return source[Symbol.asyncIterator]()
}

function createNext (it, index) {
  return it.next().then(
    ({ done, value }) => ({ value, done, index }),
    error => ({ error, index })
  )
}
