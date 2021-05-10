import createPipe from './index.mjs'

export default function (source, copies = 2) {
  const pipes = new Array(copies).fill().map(createPipe)
  feed(source, pipes)
  return pipes
}

async function feed (source, pipes) {
  try {
    for await (const item of source) {
      pipes.forEach(pipe => pipe.push(item))
    }
    pipes.forEach(pipe => pipe.close())
  } catch (err) {
    pipes.forEach(pipe => pipe.throw(err))
  }
}
