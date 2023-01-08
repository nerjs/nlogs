// import { PassThrough } from 'stream'
// import { setTimeout as sleep } from 'timers/promises'
// import { format } from 'util'
// import { StaticLogger } from './utils/static.logger'
// // import debug from 'debug'
// import { Meta } from './message/meta'
// import { Mod } from './helpers/mod'
// import { Parser } from './utils/parser'
// import { StringFormatter } from './utils/string.formatter'

// // const stream = new PassThrough({ objectMode: true })

// // ;(async () => {
// //   for await (const _data of stream) {
// //   }
// // })()
// //   .catch(console.error)
// //   .finally(() => {
// //     console.log('End!!')
// //     console.timeEnd('stream')
// //   })

// const fcount = 10
// const scount = 100_000

// const messages = [
//   'string',
//   123,
//   123n,
//   Symbol(),
//   null,
//   true,
//   false,
//   process.env,
//   new Date(),
//   [1, 2, 3],
//   StaticLogger.category('category'),
//   StaticLogger.time(123),
//   StaticLogger.timeRange(123, 1234),
//   new Error('Tratata'),
//   StaticLogger.highlight('text'),
//   StaticLogger.noConsole({ a: 1 }),
//   StaticLogger.depth(10),
// ]

// const meta = new Meta('project', 'service', 'category', 'level', 'traceId', new Date(), 'module')
// const mod = new Mod('module', 'moduleName', '1.2.3', '/path/name')
// const parser = new Parser(
//   {
//     canSingleErrorInDetails: true,
//     canSingleTimeInDetails: true,
//     canSingleTraceInDetails: true,
//   },
//   meta,
// )
// const formatter = new StringFormatter()

// const logg = debug('test:x')

// ;(async () => {
//   console.time('stream')
//   for (let f = 0; f < fcount; f++) {
//     // const log = logg.extend(`${f}`)
//     for (let s = 0; s < scount; s++) {
//       const info = parser.parse(messages, mod)
//       stream.write(formatter.format(info, mod))
//     }
//     await sleep(0)
//   }

//   stream.end()
//   // console.timeEnd('stream')
// })().catch(err => stream.emit('error', err))

// console.log('==================================')
// ;(async () => {
//   for (let f = 0; f < fcount; f++) {
//     const name = `check #${f}`
//     console.time(name)
//     for (let s = 0; s < scount; s++) {
//       const info = parser.parse(messages, mod)
//       formatter.format(info, mod)
//     }
//     console.timeEnd(name)
//   }
// })()
//   .catch(console.error)
//   .finally(() => console.log('=================================='))

/*
empty debug 5:51.501 (m:ss.mmm)
not empty debug 17:35.996 (m:ss.mmm)
debug string 15:45.790 (m:ss.mmm)
formatter 21:38.611 (m:ss.mmm)
parser 34:06.761 (m:ss.mmm)

console.log 13:44.223 (m:ss.mmm)
console.log string 17:14.621 (m:ss.mmm)
formatter 9:34.878 (m:ss.mmm)
parser 15:02.291 (m:ss.mmm)

stdout 12:21.923 (m:ss.mmm)
stdout string 14:15.480 (m:ss.mmm)
formatter 13:41.215 (m:ss.mmm)
parser 24:13.096 (m:ss.mmm)

stream 9:32.031 (m:ss.mmm)
stream string 902.634ms
formatter 6:09.608 (m:ss.mmm)
parser 15:09.642 (m:ss.mmm)



*/
