import { virtualRender, thru } from './node_modules/v-can/index.js'
WebFont.load({
  google: {
    families: ['Droid Sans', 'Droid Serif', 'Rajdhani:600'],
  },
})
let canvas = document.getElementById('viewport')
canvas.width = canvas.scrollWidth
canvas.height = canvas.scrollHeight
const update = virtualRender({
  fn(ctx, tools) {
    const { xy, xToPx, yToPx, xRange, yRange } = tools
    function drawNode(id) {
      const node = nodes.get(id)

      if (
        thru.containsRange(node.range.x, xRange) &&
        thru.containsRange(node.range.y, yRange)
      ) {
        const nodeXRange = node.range.x.map(xToPx)
        const nodeYRange = node.range.y.map(yToPx)
        ctx.fillStyle = `hsla(${node.hue}, ${node.saturation}%, 50%, 0.8)`
        ctx.shadowColor = `hsla(${node.hue}, 20%, 30%, 0.5)`
        ctx.shadowOffsetY = 10
        ctx.shadowBlur = 40
        ctx.fillRect(
          nodeXRange[0],
          nodeYRange[0],
          thru.duration(nodeXRange),
          thru.duration(nodeYRange),
        )

        ctx.font = '50px Rajdhani'
        ctx.textBaseline = 'bottom'
        ctx.fillText(
          node.name || '',
          nodeXRange[0],
          nodeYRange[0],
          thru.duration(nodeXRange),
        )

        node.children.forEach(drawNode)
      }
    }
    drawNode(rootId)
  },
  canvas,
})

let viewport = [[-6, 6], [-6, 6]]

let rootId = 0
let nodeCount = 4
let nodes = new Map()

nodes.set(0, {
  name: 'root',
  hue: 50,
  saturation: 80,
  range: {
    x: [-5, 5],
    y: [-5, 5],
  },
  parent: null,
  children: [1],
})
nodes.set(1, {
  name: 'yellow',
  hue: 100,
  saturation: 60,
  range: {
    x: [-3, 3],
    y: [-4, 3],
  },
  parent: 0,
  children: [2, 3],
})

nodes.set(2, {
  hue: 200,
  saturation: 20,
  range: {
    x: [-2, -1],
    y: [-3, 2],
  },
  parent: 1,
  children: [],
})
nodes.set(3, {
  hue: 280,
  name: 'purp',
  saturation: 30,
  range: {
    x: [0, 2],
    y: [-3, 0],
  },
  parent: 1,
  children: [],
})

function scanNode(id, coordinate) {
  const node = nodes.get(id)

  if (
    thru.contains(node.range.x, coordinate[0]) &
    thru.contains(node.range.y, coordinate[1])
  ) {
    // coordinate is in range!
    // give kids a chance to intercept
    return node.children.reduce((p, c) => {
      return scanNode(c, coordinate) || p
    }, id)
  }
}

const pxToX = px => thru.line([0, canvas.width], viewport[0], px)
const pxToY = px => thru.line([0, canvas.height], viewport[1], px)

function scrollHandler(e) {
  const amount = (thru.duration(viewport[0]) * 0.05 * e.deltaY) / 100
  viewport[0] = thru.grow(
    amount,
    thru.from([0, canvas.width], e.clientX),
    viewport[0],
  )
  viewport[1] = thru.grow(
    amount,
    thru.from([0, canvas.height], e.clientY),
    viewport[1],
  )
  update(...viewport)
}

let dragTarget = null
let dragStart = null
function downHandler(e) {
  dragStart = [pxToX(e.clientX), pxToY(e.clientY)]
  const targetNode = scanNode(rootId, dragStart)
  if (targetNode !== undefined) {
    dragTarget = {
      type: 'node',
      id: targetNode,
      originalRange: { ...nodes.get(targetNode).range },
    }
    canvas.addEventListener('mousemove', moveHandler)
    canvas.addEventListener('mouseup', clear)
    document.addEventListener('blur', clear)
  } else {
    // put this back and just do nothing
    dragStart = null
  }
}
function moveHandler(e) {
  const node = nodes.get(dragTarget.id)
  const dragEnd = [pxToX(e.clientX), pxToY(e.clientY)]
  const change = thru.sub(dragEnd, dragStart)
  node.range.x = thru.add(dragTarget.originalRange.x, [change[0], change[0]])
  node.range.y = thru.add(dragTarget.originalRange.y, [change[1], change[1]])
  update(...viewport)
  // console.log('movin', dragTarget)s
}
function clear(e) {
  canvas.removeEventListener('mousemove', moveHandler)
  canvas.removeEventListener('mouseup', clear)
  document.removeEventListener('blur', clear)
  dragStart = null
  dragTarget = null
}

update(...viewport)

canvas.addEventListener('mousewheel', scrollHandler)
canvas.addEventListener('pointerdown', downHandler)

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
