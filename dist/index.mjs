import plock from 'plock';

function postbox () {
  const q = [];
  const lock = plock();
  lock.lock();
  return {
    post,
    get,
    release,
    getAll,
    get size () {
      return q.length
    }
  }
  function post (item) {
    if (q.push(item) === 1) lock.release();
  }
  async function get ({ wait = false } = {}) {
    await lock.lock();
    const item = q.shift();
    if (q.length && !wait) lock.release();
    return item
  }
  function release () {
    if (q.length && lock.locks > 0) lock.release();
  }
  async function * getAll () {
    while (true) {
      const item = await get();
      yield item;
    }
  }
}

export default postbox;
