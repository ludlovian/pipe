import { test } from 'uvu'
import * as assert from 'uvu/assert'

import sleep from 'pixutil/sleep'
import isResolved from 'pixutil/is-resolved'

import Pipe from '../src/index.mjs'

test('basic write then read', async t => {
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
    w.write('foo')
    await sleep(100)
    w.write('bar')
  })()

  const it = r[Symbol.asyncIterator]()
  // first value
  let item = await it.next()
  assert.is(item.value, 'foo')
  assert.is(!!item.done, false)
  // second
  item = await it.next()
  assert.is(item.value, 'bar')
  assert.is(!!item.done, false)
  // done
  await written
  w.close()
  item = await it.next()
  assert.is(item.done, true)

  item = await it.next()
  assert.is(item.done, true)
})

test('error', async () => {
  const [r, w] = new Pipe()
  const it = r[Symbol.asyncIterator]()

  const err = new Error('oops')

  const pGet = it.next()
  assert.is(await isResolved(pGet), false)

  w.throw(err)

  await pGet.then(assert.unreachable).catch(e => assert.is(e, err))

  const item = await it.next()
  assert.is(item.done, true)
})

test('push after close', async () => {
  const [r, w] = new Pipe()
  const it = r[Symbol.asyncIterator]()
  w.close()

  let item = await it.next()
  assert.is(item.done, true)

  w.write('foo')

  item = await it.next()
  assert.is(item.done, true)
})

test('throw after close', async () => {
  const err = new Error('oops')
  const [r, w] = new Pipe()
  const it = r[Symbol.asyncIterator]()
  w.close()

  let item = await it.next()
  assert.is(item.done, true)

  w.throw(err)

  item = await it.next()
  assert.is(item.done, true)
})

test('close after close', async () => {
  const [, w] = new Pipe()
  w.close()
  assert.not.throws(() => w.close())
})

test.run()
