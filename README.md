# ppipe
async pipe

## Purpose

A ppipe is a promise based pipe, like a Unix pipe. Items can be added at one end, and read as an async generator at the other.

## API

### Ppipe
```
import Ppipe from 'ppipe'
const pipe = new Ppipe()
```

Creates a new empty Ppipe read for writing & reading.

### push
`pipe.push(item)`

Pushes an item into the pipe

### close
`pipe.close`

Closes a pipe, signifying no more items will be pushed.

### read
`for await (const item = await pb.read()) {...}`

Reads the readable end of the pipe as an async generator. Until `.close` has been called.
