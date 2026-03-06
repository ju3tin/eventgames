type Callback = (data?: any) => void

class MotionEvents {
  private events: { [key: string]: Callback[] } = {}

  on(event: string, cb: Callback) {
    if (!this.events[event]) this.events[event] = []
    this.events[event].push(cb)
  }

  off(event: string, cb: Callback) {
    if (!this.events[event]) return
    this.events[event] = this.events[event].filter(c => c !== cb)
  }

  emit(event: string, data?: any) {
    if (!this.events[event]) return
    this.events[event].forEach(cb => cb(data))
  }
}

export const motionEvents = new MotionEvents()