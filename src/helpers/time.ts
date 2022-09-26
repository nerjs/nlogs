export const sleep = (time: number) => new Promise<void>(resolve => setTimeout(resolve, time))

export const waitImmediate = () => new Promise(resolve => setImmediate(resolve))

const nextTick = process.nextTick || setImmediate
export const waitTick = () => new Promise(resolve => nextTick(resolve))
