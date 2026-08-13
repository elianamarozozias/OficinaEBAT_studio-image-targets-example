import * as ecs from '@8thwall/ecs'

ecs.registerComponent({
  name: 'MakeSticky',

  add: (world, component) => {
    const {eid} = component
    let hasBeenFound = false

    // 1. Quando o Image Target for encontrado na câmera
    world.events.addListener(eid, 'xrimagefound', () => {
      hasBeenFound = true
    })

    // 2. Quando o Image Target sair de quadro
    world.events.addListener(eid, 'xrimagelost', () => {
      if (hasBeenFound) {
        // Remove o estado "Disabled" que o 8th Wall aplica automaticamente ao perder a imagem
        ecs.Disabled.remove(world, eid)
      }
    })
  },
})