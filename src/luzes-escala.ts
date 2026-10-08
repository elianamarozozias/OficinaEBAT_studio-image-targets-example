import * as ecs from '@8thwall/ecs'

const original = new Map<any, {intensidade: number, distancia: number, escala: number}>()
let ultimoLog = 0

// escala real no mundo (soma a escala de todos os pais)
const escalaNoMundo = (obj: any) => {
  let s = 1
  let o = obj
  while (o) { s *= o.scale.x; o = o.parent }
  return s
}

ecs.registerComponent({
  name: 'luz-escala',
  tick: (world, component) => {
    const {eid} = component
    if (!ecs.Light.has(world, eid)) return
    const obj: any = world.three.entityToObject.get(eid)
    if (!obj) return

    const luzAtual: any = ecs.Light.get(world, eid)
    if (luzAtual.type !== 'point' && luzAtual.type !== 'spot') return

    const escala = escalaNoMundo(obj)
    if (!original.has(eid)) {
      original.set(eid, {
        intensidade: luzAtual.intensity,
        distancia: luzAtual.distance ?? 0,
        escala,
      })
    }
    const o = original.get(eid)
    const proporcao = escala / o.escala

    const luz: any = ecs.Light.cursor(world, eid)
    luz.intensity = o.intensidade * proporcao * proporcao
    if (o.distancia > 0) luz.distance = o.distancia * proporcao

    // diagnóstico: 1x por segundo no console
    const agora = Date.now()
    if (agora - ultimoLog > 1000) {
      ultimoLog = agora
      console.log('[luz-escala] proporção', proporcao.toFixed(2), 'intensidade', luz.intensity.toFixed(2))
    }
  },
  remove: (world, component) => {
    original.delete(component.eid)
  },
})