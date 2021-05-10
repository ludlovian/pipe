import { test } from 'uvu'
import * as assert from 'uvu/assert'

import promiseGoodies from 'promise-goodies'
import sleep from 'pixutil/sleep'

import createPipe from '../src/index.mjs'

promiseGoodies()

test('basic write & read', async t => {
  const pipe = createPipe()
  pipe.push('foo')
  pipe.push('bar')
  pipe.close()
  const items = []
  for await (const item of pipe) {
    items.push(item)
  }
  assert.equal(items, ['foo', 'bar'])
})

test('async write', async t => {
  const pipe = createPipe()
  const pushed = (async () => {
    await sleep(100)
    await pipe.push('foo')
    await sleep(100)
    await pipe.push('bar')
  })()

  const it = pipe[Symbol.asyncIterator]()

  // first value
  let { done, value } = await it.next()
  assert.is(value, 'foo')
  assert.not.ok(done)
  // second
  ;({ done, value } = await it.next())
  assert.is(value, 'bar')
  assert.not.ok(done)
  // done
  await pushed
})

test('limited write', async () => {
  const pipe = createPipe(1)
  const it = pipe[Symbol.asyncIterator]()

  const pPut1 = pipe.push('foo')
  assert.ok(await pPut1.isResolved())

  const pPut2 = pipe.push('bar')
  assert.not.ok(await pPut2.isResolved())

  const { value: value1 } = await it.next()
  assert.is(value1, 'foo')
  assert.ok(await pPut2.isResolved(50))

  const { value: value2 } = await it.next()
  assert.is(value2, 'bar')

  const pGet3 = it.next()
  assert.is.not(await pGet3.isResolved())
})

test('error', async () => {
  const pipe = createPipe()
  const it = pipe[Symbol.asyncIterator]()

  const err = new Error('oops')

  const pGet = it.next()
  assert.is.not(await pGet.isResolved())

  pipe.throw(err)

  await pGet.then(assert.unreachable, e => assert.is(e, err))
})

test('push after close', async () => {
  const p = createPipe()
  await p.close()
  await p
    .push('foo')
    .then(assert.unreachable)
    .catch(err => assert.is(err.message, 'Pipe closed'))
})

test('throw after close', async () => {
  const err = new Error('oops')
  const p = createPipe()
  await p.close()
  await p
    .throw(err)
    .then(assert.unreachable, e => assert.is(e.message, 'Pipe closed'))
})

test('close after close', async () => {
  const p = createPipe()
  await p.close()
  await p.close().then(() => assert.ok(true), assert.unreachable)
})

test.run()
