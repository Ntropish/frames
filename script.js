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
      const nodeXRange = node.range[0].map(xToPx)
      const nodeYRange = node.range[1].map(yToPx)
      if (
        thru.containsRange(node.range[0], xRange) &&
        thru.containsRange(node.range[1], yRange)
      ) {
        ctx.font = '50px Rajdhani'
        ctx.textBaseline = 'top'
        const nodeNameWidth = ctx.measureText(node.name || '').width
        const nodeWidth = thru.duration(nodeXRange)

        const collapsed = nodeNameWidth + 4 + 50 > nodeWidth
        node.collapsed = collapsed
        if (!collapsed) {
          ctx.fillStyle = `hsla(${node.hue}, ${node.saturation}%, 50%, 0.8)`
          ctx.shadowColor = `hsla(${node.hue}, 20%, 30%, 0.5)`
          ctx.shadowOffsetY = 10
          ctx.shadowBlur = 40

          ctx.fillText(
            node.name || '',
            nodeXRange[0],
            nodeYRange[0],
            thru.duration(nodeXRange),
          )

          ctx.beginPath(nodeXRange[0], nodeYRange[0] + 50)
          ctx.lineTo(nodeXRange[0] + nodeNameWidth + 4, nodeYRange[0] + 50)
          ctx.lineTo(nodeXRange[0] + nodeNameWidth + 4, nodeYRange[0])
          ctx.lineTo(nodeXRange[1], nodeYRange[0])
          ctx.lineTo(nodeXRange[1], nodeYRange[1])
          ctx.lineTo(nodeXRange[0], nodeYRange[1])
          ctx.lineTo(nodeXRange[0], nodeYRange[0] + 50)
          ctx.closePath()
          ctx.fill()

          node.children.forEach(drawNode)
        } else {
          // collapsed:
          const nodeXRange = node.range[0].map(xToPx)
          const nodeYRange = node.range[1].map(yToPx)
          ctx.fillStyle = `hsla(${node.hue}, ${node.saturation}%, 50%, 0.8)`
          ctx.strokeStyle = `hsla(${node.hue}, ${node.saturation}%, 50%, 0.8)`
          ctx.lineWidth = 4
          ctx.shadowColor = `hsla(${node.hue}, 20%, 30%, 0.5)`
          ctx.shadowOffsetY = 10
          ctx.shadowBlur = 40
          ctx.strokeRect(
            nodeXRange[0] - 4,
            nodeYRange[0] - 4,
            thru.duration(nodeXRange) + 8,
            thru.duration(nodeYRange) + 8,
          )

          ctx.font = '50px Rajdhani'
          ctx.textBaseline = 'middle'
          ctx.textAlign = 'center'

          ctx.fillText(
            node.name || '',
            nodeXRange[0] + thru.duration(nodeXRange) / 2,
            nodeYRange[0] + thru.duration(nodeYRange) / 2,
            thru.duration(nodeXRange),
          )
        }
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
  range: [[-5, 5], [-5, 5]],
  parent: null,
  children: [1],
})
nodes.set(1, {
  name: 'yellow',
  hue: 100,
  saturation: 60,
  range: [[-3, 3], [-4, 3]],
  parent: 0,
  children: [2, 3],
})

nodes.set(2, {
  hue: 200,
  name: 'blu',
  saturation: 44,
  range: [[-2, -1], [-3, 2]],
  parent: 1,
  children: [],
})
nodes.set(3, {
  hue: 260,
  name: 'purp',
  saturation: 40,
  range: [[0, 2], [-3, 0]],
  parent: 1,
  children: [4],
})
nodes.set(4, {
  hue: 350,
  name: 'little',
  saturation: 35,
  range: [[0.5, 1.5], [-2, -0.5]],
  parent: 3,
  children: [5],
})
nodes.set(5, {
  hue: 40,
  name: 'littler',
  saturation: 30,
  range: [[0.8, 1.2], [-1.7, -0.7]],
  parent: 4,
  children: [],
})

function scanNode(id, coordinate) {
  const node = nodes.get(id)

  if (
    thru.contains(node.range[0], coordinate[0]) &
    thru.contains(node.range[1], coordinate[1])
  ) {
    console.log(node)
    // children of collapsed nodes aren't visible so just return this id
    if (node.collapsed) return id
    // coordinate is in range!
    // give kids a chance to intercept but fall back to this id:
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
  dragStart = [e.clientX, e.clientY]
  const coordinate = [pxToX(dragStart[0]), pxToY(dragStart[1])]
  const targetNode = scanNode(rootId, coordinate)
  canvas.addEventListener('mousemove', moveHandler)
  canvas.addEventListener('mouseup', clear)
  document.addEventListener('blur', clear)
  if (targetNode !== undefined) {
    dragTarget = {
      type: 'node',
      id: targetNode,
      originalRange: [...nodes.get(targetNode).range],
    }
  } else {
    dragTarget = {
      type: 'pan',
      originalViewport: [[...viewport[0]], [...viewport[1]]],
    }
  }
}
function moveHandler(e) {
  const dragEnd = [e.clientX, e.clientY]
  const change = thru.sub(dragEnd, dragStart)
  const xChange = pxToX(change[0]) - pxToX(0)
  const yChange = pxToY(change[1]) - pxToY(0)
  if (dragTarget.type === 'node') {
    const node = nodes.get(dragTarget.id)
    node.range[0] = thru.add(dragTarget.originalRange[0], [xChange, xChange])
    node.range[1] = thru.add(dragTarget.originalRange[1], [yChange, yChange])
    update(...viewport)
  } else if (dragTarget.type === 'pan') {
    viewport = [
      thru.sub(dragTarget.originalViewport[0], [xChange, xChange]),
      thru.sub(dragTarget.originalViewport[1], [yChange, yChange]),
    ]
    update(...viewport)
  }
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

const deepCopy = obj => JSON.parse(JSON.stringify(obj))

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
