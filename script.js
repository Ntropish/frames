import { virtualRender, thru } from './node_modules/v-can/index.js'

let canvas = document.getElementById('viewport')
const update = virtualRender({
  fn(ctx, tools) {
    // const { loop, xToPx, yToPx, xPxRange, yPxRange } = tools
    // ctx.fillStyle = `hsla(${hue}, 70%, 50%, 0.9)`
    // const width = thru.duration(xPxRange)
    // const height = thru.duration(yPxRange)
    // ctx.fillRect(0, 0, width, height)
    // ctx.lineWidth = 10
    // ctx.strokeStyle = 'hsla(0, 0%, 100%, 0.4)'
    // loop([[-1, 0], [10, 11], [21, 0], [10, -11], [-1, 0]])
    // loop([[0, 0], [10, 10], [20, 0], [10, -10], [0, 0]])
    // loop([[2, 0], [10, 8], [18, 0], [10, -8], [2, 0]])
    // ctx.fillStyle = `hsla(220, 30%, 70%, 0.7)`
    // ctx.fillRect(0, 0, width, height)
    // ctx.fillStyle = `hsla(0, 0%, 100%, 0.9)`
    // ctx.beginPath()
    // ctx.arc(xToPx(ballX), yToPx(0), 10, 0, 2 * Math.PI, false)
    // ctx.fill()
  },
  canvas,
})

// const start = Date.now()
// let viewport = [[-10, 30], [30, -30]]
// let hue = 0
// let ballX = 20
// async function run() {
//   canvas.width = canvas.scrollWidth
//   canvas.height = canvas.scrollHeight

//   while (true) {
//     const distance = Date.now() - start
//     const growAmount = Math.sin((distance / 1000) * Math.PI)
//     hue += Math.random() - 0.3 + growAmount / 10 + 1

//     ballX -= growAmount

//     viewport = viewport.map(thru.grow(growAmount, 0.5))

//     update(...viewport)
//     await new Promise(r => setTimeout(r, 30)) // one-liner for wait 30 ms
//   }
// }
run()
