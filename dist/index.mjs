import PLock from 'plock';
import PSwitch from 'pswitch';

class Postbox {
  constructor (width = 1) {
    this._queue = [];
    this._lock = new PLock(width);
    this._hasItems = new PSwitch(false);
  }
  post (item) {
    this._queue.push(item);
    this._hasItems.set(true);
  }
  async get ({ wait = false } = {}) {
    while (true) {
      await this._hasItems.whenOn;
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
    while (true) {
      const item = await this.get();
      yield item;
    }
  }
  get size () {
    return this._queue.length
  }
  get active () {
    return this._lock.locks
  }
  get idle () {
    return this._hasItems.whenOff
  }
  get busy () {
    return this._hasItems.whenOn
  }
}

export default Postbox;
