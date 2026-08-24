import * as ecs from '@8thwall/ecs'

ecs.registerComponent({
  name: 'Particle Target Sync',
  schema: {},
  stateMachine: ({world, eid}) => {
    ecs.defineState('default')
      .initial()
      .listen(world.events.globalId, 'reality.imagefound', () => {
        // Encontrou a imagem: remove o Hidden para exibir as partículas
        ecs.Hidden.remove(world, eid)
      })
      .listen(world.events.globalId, 'reality.imagelost', () => {
        // Perdeu a imagem: aplica o Hidden para ocultar no mesmo frame
        ecs.Hidden.set(world, eid)
      })
  },
})