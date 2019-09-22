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

    ctx.font = '50px Rajdhani'
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'

    const alphaRange = [0, 1]

    // HELP MESSAGES
    ctx.fillStyle = `hsla(0, 0%, 100%, ${thru.clamp(
      alphaRange,
      thru.line([40, 12], alphaRange, thru.duration(viewport[0])),
    )})`
    ctx.fillText(
      'this is a virtual canvas that only updates 5 times a second',
      xToPx(0),
      yToPx(-6),
    )

    // This message needs the alpha multiplier because it is visible at start
    ctx.fillStyle = `hsla(0, 0%, 100%, ${textAlpha() *
      thru.clamp(
        [1, 0],
        thru.line([300, 50], [1, 0], thru.duration(viewport[0])),
      )})`
    ctx.fillText('scroll to zoom', xToPx(0), yToPx(-50))
    // END HELP MESSAGES

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
        ctx.textAlign = 'left'
        const nodeNameWidth = ctx.measureText(node.name || '').width
        const nodeWidth = thru.duration(nodeXRange)

        const collapsed = nodeNameWidth + 4 + 150 > nodeWidth
        node.collapsed = collapsed

        const parent = node.parent !== null ? nodes.get(node.parent) : null
        const parentNameWidth = parent
          ? ctx.measureText(parent.name || '').width
          : 0

        let parentTitleCoordinate
        if (parent) {
          parentTitleCoordinate = [
            xToPx(parent.range[0][0]),
            yToPx(parent.range[1][0]),
          ]
        }
        if (!collapsed) {
          const color = (alpha = 0.8) =>
            `hsla(${node.hue}, ${node.saturation}%, 50%, ${alpha})`

          ctx.shadowColor = `hsla(${node.hue}, 20%, 30%, 0.5)`
          ctx.shadowOffsetY = 10
          ctx.shadowBlur = 40

          ctx.fillStyle = color(textAlpha())

          ctx.fillText(
            node.name || '',
            nodeXRange[0],
            nodeYRange[0],
            thru.duration(nodeXRange),
          )

          ctx.fillStyle = color()

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
          const color = alpha =>
            `hsla(${node.hue}, ${node.saturation}%, 50%, ${alpha || 0.8})`
          ctx.fillStyle = color()
          ctx.strokeStyle = color()
          const nodeXRange = node.range[0].map(xToPx)
          const nodeYRange = node.range[1].map(yToPx)
          ctx.lineWidth = 4
          ctx.shadowOffsetY = 10
          ctx.shadowBlur = 40

          if (nodeNameWidth < nodeWidth) {
            ctx.strokeRect(
              nodeXRange[0] - 2,
              nodeYRange[0] - 2,
              thru.duration(nodeXRange) + 4,
              thru.duration(nodeYRange) + 4,
            )
          }

          const alpha = textAlpha()
          ctx.fillStyle = color(alpha)

          ctx.font = '50px Rajdhani'
          ctx.textBaseline = 'middle'
          ctx.textAlign = 'center'

          ctx.fillText(
            node.name || '',
            nodeXRange[0] + thru.duration(nodeXRange) / 2,
            nodeYRange[0] + thru.duration(nodeYRange) / 2,
          )
        }
      }
    }
    drawNode(rootId)

    // HELP MESSAGES
    ctx.fillStyle = `hsla(0, 0%, 100%, ${thru.clamp(
      alphaRange,
      thru.line([20, 1], alphaRange, thru.duration(viewport[0])),
    )})`
    ctx.fillText(
      'you can drag stuff -- it will feel weird',
      xToPx(1),
      yToPx(-2.3),
    )
    // END HELP MESSAGES
  },
  canvas,
})

let viewport = [[-100, 100], [-100, 100]]

let rootId = 0
// let nodeCount =
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
  children: [6],
})
nodes.set(6, {
  hue: 290,
  name: 'tiny babby',
  saturation: 26,
  range: [[0.9, 1.1], [-1.6, -0.8]],
  parent: 5,
  children: [7],
})
nodes.set(7, {
  hue: 180,
  name: 'bibby bobby',
  saturation: 26,
  range: [[0.95, 1.05], [-1.35, -1.05]],
  parent: 6,
  children: [8],
})
nodes.set(8, {
  hue: 260,
  name: 'beep boop',
  saturation: 26,
  range: [[0.99, 1.01], [-1.22, -1.19]],
  parent: 7,
  children: [9, 10],
})
nodes.set(9, {
  hue: 70,
  name: 'knick knacks',
  saturation: 26,
  range: [[0.991, 0.999], [-1.197, -1.192]],
  parent: 8,
  children: [],
})
nodes.set(10, {
  hue: 0,
  name: 'doodads',
  saturation: 22,
  range: [[0.997, 1.009], [-1.209, -1.199]],
  parent: 8,
  children: [],
})

function scanNode(id, coordinate) {
  const node = nodes.get(id)

  if (
    thru.contains(node.range[0], coordinate[0]) &
    thru.contains(node.range[1], coordinate[1])
  ) {
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
  const amount = (thru.duration(viewport[0]) * 0.1 * e.deltaY) / 100
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
    const originalRanges = {}
    function storeFrameRange(id) {
      const node = nodes.get(id)
      originalRanges[id] = deepCopy(node.range)
      node.children.forEach(storeFrameRange)
    }
    const node = nodes.get(targetNode)
    const parent = node.parent !== null ? nodes.get(node.parent) : null
    storeFrameRange(targetNode)
    dragTarget = {
      type: 'node',
      id: targetNode,
      originalRanges,
      bounds: parent && [
        thru.sub(parent.range[0], node.range[0]),
        thru.sub(parent.range[1], node.range[1]),
      ],
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
  let xChange = pxToX(change[0]) - pxToX(0)
  let yChange = pxToY(change[1]) - pxToY(0)
  if (dragTarget.bounds) {
    xChange = thru.clamp(dragTarget.bounds[0], xChange)
    yChange = thru.clamp(dragTarget.bounds[1], yChange)
  }
  if (dragTarget.type === 'node') {
    function dragNode(id) {
      const node = nodes.get(id)
      const xRange = thru.add(dragTarget.originalRanges[id][0], [
        xChange,
        xChange,
      ])
      const yRange = thru.add(dragTarget.originalRanges[id][1], [
        yChange,
        yChange,
      ])
      node.range[0] = xRange
      node.range[1] = yRange
      node.children.forEach(id => dragNode(id))
    }
    dragNode(dragTarget.id)
    update(...viewport)
    for (let i = 0; i < 3; i++) {
      setTimeout(() => update(...viewport), i * 300)
    }
  } else if (dragTarget.type === 'pan') {
    viewport = [
      thru.sub(dragTarget.originalViewport[0], [xChange, xChange]),
      thru.sub(dragTarget.originalViewport[1], [yChange, yChange]),
    ]
    update(...viewport)
    for (let i = 0; i < 3; i++) {
      setTimeout(() => update(...viewport), i * 300)
    }
  }
}
function clear(e) {
  canvas.removeEventListener('mousemove', moveHandler)
  canvas.removeEventListener('mouseup', clear)
  document.removeEventListener('blur', clear)
  dragStart = null
  dragTarget = null
}

// this is to fade the fonts in and hide the default font
const start = Date.now()
const textAlpha = () => {
  // this makes a linear fade in for 500ms
  const alpha = thru.from([start, start + 500], Date.now())
  return thru.clamp([0, 1], alpha)
}
// initial updates for when the fonts load
update(...viewport)
for (let i = 0; i < 30; i++) {
  setTimeout(() => update(...viewport), i * 30)
}

canvas.addEventListener('mousewheel', scrollHandler)
canvas.addEventListener('pointerdown', downHandler)

const deepCopy = obj => JSON.parse(JSON.stringify(obj))
