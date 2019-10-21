'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var PLock = _interopDefault(require('plock'));
var PSwitch = _interopDefault(require('pswitch'));

class Postbox {
  constructor (width = 1) {
    this._queue = [];
    this._open = true;
    this._closeValue = undefined;
    this._lock = new PLock(width);
    this._hasItems = new PSwitch(false);
  }
  post (item) {
    if (!this.open) throw new Error('Postbox is closed')
    this._queue.push(item);
    this._hasItems.set(true);
  }
  close (value) {
    if (!this.open) return
    this._closeValue = value;
    this._queue.splice(0);
    this._open = false;
    while (this.active) this.release();
    this._hasItems.set(true);
  }
  async get ({ wait = false } = {}) {
    while (true) {
      if (!this.open) return this._closeValue
      await this._hasItems.when(true);
      await this._lock.lock();
      if (this._queue.length) break
      this._lock.release();
    }
    const item = this._queue.shift();
    if (!wait) this.release();
    return item
  }
  release () {
    this._lock.release();
    if (this._queue.length === 0) this._hasItems.set(false);
  }
  async * getAll () {
    while (this.open) {
      const item = await this.get();
      yield item;
    }
  }
  get open () {
    return this._open
  }
  get size () {
    return this._queue.length
  }
  get active () {
    return this._lock.locks
  }
  get idle () {
    return this._hasItems.when(false)
  }
  get busy () {
    return this._hasItems.when(true)
  }
}

module.exports = Postbox;
