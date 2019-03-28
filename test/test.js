'use strict'

import test from 'ava'
import Postbox from '../src'

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

test('post and get', async t => {
  const pb = new Postbox()
  pb.post('foo')
  t.is(pb.size, 1)
  const item = await pb.get()
  t.is(item, 'foo')
  t.is(pb.size, 0)
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
