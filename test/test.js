'use strict'

import test from 'ava'
import Postbox from '../src'

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const isResolved = (p, ms = 20) =>
  new Promise(resolve => {
    p.then(() => resolve(true))
    setTimeout(() => resolve(false), ms)
  })

test('post and get', async t => {
  const pb = new Postbox()
  pb.post('foo')
  t.is(pb.size, 1)
  t.true(await isResolved(pb.busy))
  t.false(await isResolved(pb.idle))
  const item = await pb.get()
  t.is(item, 'foo')
  t.is(pb.size, 0)
  t.false(await isResolved(pb.busy))
  t.true(await isResolved(pb.idle))
})

test('post multiple', async t => {
  const pb = new Postbox()
  pb.post('foo')
  pb.post('bar')

  let item
  item = await pb.get()
  t.is(item, 'foo')

  item = await pb.get()
  t.is(item, 'bar')
})

test('getAll', async t => {
  const pb = new Postbox()
  pb.post('foo')
  pb.post('bar')
  pb.post('baz')
  const res = []

  for await (const item of pb.getAll()) {
    res.push(item)
    if (item === 'baz') break
  }

  t.deepEqual(res, ['foo', 'bar', 'baz'])
})

test('get with wait', async t => {
  const pb = new Postbox()
  pb.post('foo')
  pb.post('bar')

  let item
  item = await pb.get({ wait: true })
  t.is(item, 'foo')

  let called = false
  const p = pb.get({ wait: true }).then(item => {
    called = true
    t.is(item, 'bar')
  })

  await delay(20)
  t.is(called, false)

  pb.release()
  await p
  t.is(called, true)

  pb.release()
  pb.release()
})

test('postbox with width', async t => {
  const pb = new Postbox(2)
  const p1 = pb.get()
  const p2 = pb.get()

  pb.post('foo')
  t.true(await isResolved(p1))
  t.false(await isResolved(p2))

  pb.post('bar')
  t.true(await isResolved(p2))
  t.is(pb.size, 0)

  pb.post('foo1')
  pb.post('foo2')
  pb.post('foo3')

  t.is(pb.size, 3)

  t.is(await pb.get({ wait: true }), 'foo1')
  t.is(await pb.get({ wait: true }), 'foo2')
  t.is(pb.active, 2)
  t.is(pb.size, 1)

  const p3 = pb.get()
  t.false(await isResolved(p3))

  pb.release()
  t.true(await isResolved(p3))
  t.is(pb.active, 1)
  t.is(pb.size, 0)
  t.is(await p3, 'foo3')

  pb.release()
  t.is(pb.active, 0)
  t.is(pb.size, 0)
})
