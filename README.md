# pipe
async pipe

## Purpose

A pipe is an aynsc interable that you can push data into, and consume as
a regular iterable.

## pipe
```
import createPipe from 'pipe'
const pipe = createPipe(maxsize))
```

Creates a new pipe. The maximum size can be set (default: Infinity)

Reading is as per normal
```
for await (const item of pipe) {...}
```

### #push
`await pipe.push(item)`

Pushes an item into pipe. Will resolve once pushed, but could block if the
maximum queue size has been reached

If you push an `Error` into it, then the iterable will throw it, and be
rejected

### #close
`pipe.close()`

Ends the iterable. Future pushes will reject.

## pipe/join
```
import joinPipes from 'pipe/join'
const joined = joinPipes(pipe1, pipe2, ...)
```

Joins existing async generators.

Yields a stream of `[index, value]` elements, where `index` shows which generator
produced the `value`.

If any generator throws, then this will throw.

When all the generators are ended, then this will end.
