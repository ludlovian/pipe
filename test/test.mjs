import { test } from 'uvu'
import * as assert from 'uvu/assert'

import PPipe from '../src/index.mjs'

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

test('basic write & read', async t => {
  const pipe = new PPipe()
  pipe.push('foo')
  pipe.push('bar')
  pipe.close()
  const items = []
  for await (const item of pipe.read()) {
    items.push(item)
  }
  assert.equal(items, ['foo', 'bar'])
})

test('async write & read', async t => {
  const pipe = new PPipe()
  Promise.resolve()
    .then(() => delay(100))
    .then(() => pipe.push('foo'))
    .then(() => delay(100))
    .then(() => pipe.push('bar'))
    .then(() => delay(100))
    .then(() => pipe.close())

  const items = []
  for await (const item of pipe.read()) {
    items.push(item)
  }
  assert.equal(items, ['foo', 'bar'])
})

test('push after close', async t => {
  const pipe = new PPipe()
  pipe.push('foo')
  pipe.close()
  assert.throws(() => pipe.push('bar'), /Pipe is closed/)
})

test('multiple close', async t => {
  const pipe = new PPipe()
  pipe.push('foo')
  pipe.close()
  assert.not.throws(() => pipe.close())
})

test.run()
