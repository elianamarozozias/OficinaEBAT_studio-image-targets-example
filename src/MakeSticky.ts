import * as ecs from '@8thwall/ecs'

ecs.registerComponent({
  name: 'MakeSticky',

  add: (world, component) => {
    const {eid} = component
    let isSticky = false

    world.events.addListener(eid, 'xrimagefound', () => {
      if (isSticky) return
      isSticky = true

      // Quando o 8th Wall disparar a perda da imagem:
      world.events.addListener(eid, 'xrimagelost', () => {
        // O setTimeout(..., 0) executa na micro-tarefa seguinte,
        // vencendo o loop interno do motor e impedindo o pisca-pisca (flickering)
        setTimeout(() => {
          if (ecs.Disabled.has(world, eid)) {
            ecs.Disabled.remove(world, eid)
          }
        }, 0)
      })
    })
  },
})