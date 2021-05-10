import { test } from 'uvu'
import * as assert from 'uvu/assert'

import createPipe from '../src/index.mjs'
import joinPipes from '../src/join.mjs'

test('basic write & read', async t => {
  const pipe1 = createPipe()
  const pipe2 = createPipe()
  const r = joinPipes(pipe1, pipe2)
  const it = r[Symbol.asyncIterator]()

  pipe1.push('foo')
  const get1 = await read(it)
  assert.equal(get1, { value: 'foo', index: 0 })

  pipe1.push('bar')
  const get2 = await read(it)
  assert.equal(get2, { value: 'bar', index: 0 })

  pipe2.push('baz')
  const get3 = await read(it)
  assert.equal(get3, { value: 'baz', index: 1 })
})

test('closing one', async () => {
  const pipe1 = createPipe()
  const pipe2 = createPipe()
  const r = joinPipes(pipe1, pipe2)
  const it = r[Symbol.asyncIterator]()

  pipe1.push('foo')
  const get1 = await read(it)
  assert.equal(get1, { value: 'foo', index: 0 })

  pipe1.close()
  pipe2.push('bar')
  const get2 = await read(it)
  assert.equal(get2, { value: 'bar', index: 1 })
})

test('closing all', async () => {
  const pipe1 = createPipe()
  const pipe2 = createPipe()
  const r = joinPipes(pipe1, pipe2)
  const it = r[Symbol.asyncIterator]()

  pipe1.push('foo')
  const get1 = await read(it)
  assert.equal(get1, { value: 'foo', index: 0 })

  pipe1.close()
  pipe2.close()

  const { done } = await it.next()
  assert.is(done, true)
})

test('multi-way join', async () => {
  const pipe1 = createPipe()
  const pipe2 = createPipe()
  const pipe3 = createPipe()
  const r = joinPipes(pipe1, pipe2, pipe3)
  const it = r[Symbol.asyncIterator]()

  pipe3.push('foo')
  const get = await read(it)
  assert.equal(get, { value: 'foo', index: 2 })
})

test('error', async () => {
  const err = new Error('oops')
  const pipe1 = createPipe()
  const pipe2 = createPipe()
  const r = joinPipes(pipe1, pipe2)
  const it = r[Symbol.asyncIterator]()

  pipe2.throw(err)
  await it.next().then(assert.unreachable, error => {
    assert.is(error, err)
    assert.is(error.index, 1)
  })
})

async function read (it) {
  const { value, done } = await it.next()
  if (done) return { done }
  return { index: value[0], value: value[1] }
}

test.run()
