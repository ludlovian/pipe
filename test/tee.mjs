import { test } from 'uvu'
import * as assert from 'uvu/assert'

import createPipe from '../src/index.mjs'

import tee from '../src/tee.mjs'

test('simple tee', async () => {
  const p1 = createPipe()
  const [p2, p3] = tee(p1)

  p1.push('foo')
  p1.push('bar')
  p1.close()

  const r2 = []
  for await (const item of p2) {
    r2.push(item)
  }
  assert.equal(r2, ['foo', 'bar'])

  const r3 = []
  for await (const item of p3) {
    r3.push(item)
  }
  assert.equal(r3, ['foo', 'bar'])
})

test('tee with more copies', async () => {
  const p1 = createPipe()
  const [p2, p3, p4] = tee(p1, 3)
  assert.ok(p2 && p3 && p4)

  p1.push('foo')
  p1.push('bar')
  p1.close()

  const r3 = []
  for await (const item of p3) {
    r3.push(item)
  }
  assert.equal(r3, ['foo', 'bar'])
})

test('error', async () => {
  const p1 = createPipe()
  const [p2, p3] = tee(p1)
  const err = new Error('oops')

  await p1.push('foo')
  await p1.throw(err)

  let count = 0
  try {
    for await (const item of p3) {
      assert.is(item, 'foo')
      count++
    }
    assert.unreachable()
  } catch (e) {
    count++
    assert.is(e, err)
  }
  assert.is(count, 2)

  count = 0
  try {
    for await (const item of p2) {
      assert.is(item, 'foo')
      count++
    }
    assert.unreachable()
  } catch (e) {
    count++
    assert.is(e, err)
  }
  assert.is(count, 2)
})

test.run()
