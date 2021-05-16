import { test } from 'uvu'
import * as assert from 'uvu/assert'

import promiseGoodies from 'promise-goodies'
import sleep from 'pixutil/sleep'

import Pipe from '../src/index.mjs'

promiseGoodies()

test('basic write & read', async t => {
  const [r, w] = new Pipe()
  await w.write('foo')
  await w.write('bar')
  await w.close()

  const arr = []
  for await (const v of r) arr.push(v)

  assert.equal(arr, ['foo', 'bar'])
})

test('async write', async t => {
  const [r, w] = new Pipe()
  const written = (async () => {
    await sleep(100)
    await w.write('foo')
    await sleep(100)
    await w.write('bar')
  })()

  const it = r[Symbol.asyncIterator]()
  // first value
  let { done, value } = await it.next()
  assert.is(value, 'foo')
  assert.not.ok(done)
  // second
  ;({ done, value } = await it.next())
  assert.is(value, 'bar')
  assert.not.ok(done)
  // done
  await written
  await w.close()
  ;({ done, value } = await it.next())
  assert.ok(done)
})

test('limited write', async () => {
  const [r, w] = new Pipe(1)
  const it = r[Symbol.asyncIterator]()

  const pPut1 = w.write('foo')
  assert.ok(await pPut1.isResolved(), 'write #1 resolves')

  const pPut2 = w.write('bar')
  assert.not.ok(await pPut2.isResolved(), 'write #2 is pending')

  const { value: value1 } = await it.next()
  assert.is(value1, 'foo', 'write #1 is read ok')
  assert.ok(await pPut2.isResolved(50), 'write #2 resolves')

  const { value: value2 } = await it.next()
  assert.is(value2, 'bar')

  const pGet3 = it.next()
  assert.is.not(await pGet3.isResolved())
})

test('error', async () => {
  const [r, w] = new Pipe()
  const it = r[Symbol.asyncIterator]()

  const err = new Error('oops')

  const pGet = it.next()
  assert.is.not(await pGet.isResolved())

  await w.throw(err)

  await pGet.then(assert.unreachable, e => assert.is(e, err))
})

test('push after close', async () => {
  const [, w] = new Pipe()
  await w.close()
  await w
    .write('foo')
    .then(assert.unreachable)
    .catch(err => assert.instance(err, Pipe.PipeClosed))
})

test('throw after close', async () => {
  const err = new Error('oops')
  const [, w] = new Pipe()
  await w.close()
  await w
    .throw(err)
    .then(assert.unreachable)
    .catch(err => assert.instance(err, Pipe.PipeClosed))
})

test('close after close', async () => {
  const [, w] = new Pipe()
  await w.close()
  await w
    .close()
    .then(() => assert.ok(true))
    .catch(assert.unreachable)
})

test.run()
