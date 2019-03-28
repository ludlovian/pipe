import PLock from 'plock';
import PSwitch from 'pswitch';

class Postbox {
  constructor (width = 1) {
    this._queue = [];
    this._lock = new PLock(width);
    this._busy = new PSwitch(false);
  }
  post (item) {
    this._queue.push(item);
    this._busy.set(true);
  }
  async get ({ wait = false } = {}) {
    while (true) {
      await this._busy.whenOn;
      await this._lock.lock();
      if (this._queue.length) break
      this._lock.release();
    }
    const item = this._queue.shift();
    if (!this._queue.length) this._busy.set(false);
    if (!wait) this._lock.release();
    return item
  }
  release () {
    this._lock.release();
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
  get idle () {
    return this._busy.whenOff
  }
  get busy () {
    return this._busy.whenOn
  }
}

export default Postbox;
