import Hammer from 'hammerjs'
import svgPanZoom from 'svg-pan-zoom'

let hammer: HammerManager | undefined

export function setupSVGControl() {
  const svgControl = svgPanZoom('#graphviz svg', {
    zoomEnabled: true,
    controlIconsEnabled: false,
    zoomScaleSensitivity: 0.5,
    minZoom: 0.25,
    customEventsHandler
  })
  svgControl.zoom(0.85)
}

const customEventsHandler: SvgPanZoom.CustomEventHandler = {
  haltEventListeners: ['touchstart', 'touchend', 'touchmove', 'touchleave', 'touchcancel'],
  init: function (options: SvgPanZoom.CustomEventOptions) {
    var instance = options.instance,
      initialScale = 1,
      pannedX = 0,
      pannedY = 0

    hammer = new Hammer(options.svgElement)

    hammer.get('pinch').set({ enable: true })
    hammer.on('doubletap', () => instance.zoomIn())
    hammer.on('panstart panmove', event => {
      if (event.type === 'panstart') {
        pannedX = 0
        pannedY = 0
      }
      instance.panBy({ x: event.deltaX - pannedX, y: event.deltaY - pannedY })
      pannedX = event.deltaX
      pannedY = event.deltaY
    })
    hammer.on('pinchstart pinchmove', event => {
      if (event.type === 'pinchstart') {
        initialScale = instance.getZoom()
        instance.zoomAtPoint(initialScale * event.scale, { x: event.center.x, y: event.center.y })
      }
      instance.zoomAtPoint(initialScale * event.scale, { x: event.center.x, y: event.center.y })
    })

    // Prevent moving the page on some devices when panning over SVG
    options.svgElement.addEventListener('touchmove', event => event.preventDefault())
  },

  destroy: function () {
    hammer?.destroy()
  }
}
