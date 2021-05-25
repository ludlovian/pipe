# Pipe
Promise based simplex pipe

## Pipe
`const [reader, writer] = new Pipe(size)`

Creates a new pipe, and returns the two ends as `[reader, writer]`.

## reader

The reader end is an async iterable which yields values.

## writer

The writer end has the following attributes & methods

### .write
`writer.write(value)`

Writes a value into the pipe.

### .close
`writer.close()`

Puts an end-of-pipe marker into the pipe. When the reader gets this,
it will finish iteration. Any subsequent writes or throws will be ignored.

### .throw
`writer.throw(error)`

Writes an error into the pipe. When the reader gets this, it will throw.
This will also close the pipe.
