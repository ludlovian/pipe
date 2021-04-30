# ppipe
async pipe

## Purpose

A PPipe is a promise based pipe, like a Unix pipe. Items can be added at one end, and read as an async generator at the other.

## API

### PPipe
```
import PPipe from 'ppipe'
const pipe = new PPipe()
```

Creates a new pipe read for writing & reading.

### push
`pipe.push(item)`

Pushes an item into the writing end of the pipe.

### close
`pipe.close()`

Closes a pipe, signifying no more items will be pushed. Attempts to write will now throw errors.

### read
`for await (const item = await pipe.read()) {...}`

Reads the items out of the readable end of the pipe until the pipe is closed.
