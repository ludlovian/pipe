# Pipe
Promise based simplex pipe

## Pipe
`const [reader, writer] = new Pipe(size)`

Creates a new pipe, and returns the two ends as `[reader, writer]`.
The buffer size can be set, but defaults to 100 to stop runaway pipes eating memory.

## reader

The reader end is an async iterable which yields values.

## writer

The writer end has the following attributes & methods

### .write
`await writer.write(value)`

Writes a value into the pipe. May block if the buffer is full, so you should `await` it.

### .close
`await writer.close()`

Puts an end-of-pipe marker into the pipe. When the reader gets this, it will finish iteration.

### .throw
`await writer.throw(error)`

Writes an error into the pipe. When the reader gets this, it will throw. This also closes the pipe.

### .closed

Signifies if the pipe is closed (i.e. either an error or end-of-pipe message has been written).

Any further attempt to write/throw will result in a `Pipe closed` error.
