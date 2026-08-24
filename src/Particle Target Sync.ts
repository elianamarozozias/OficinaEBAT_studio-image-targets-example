import * as ecs from '@8thwall/ecs'

ecs.registerComponent({
  name: 'Particle Target Sync',
  schema: {},
  stateMachine: ({world, eid}) => {
    ecs.defineState('default')
      .initial()
      .listen(world.events.globalId, 'reality.imagefound', () => {
        // Encontrou a imagem: ativa a emissão de partículas
        ecs.ParticleEmitter.set(world, eid, {
          stopped: false,
        })
      })
      .listen(world.events.globalId, 'reality.imagelost', () => {
        // Perdeu a imagem: pausa a emissão
        ecs.ParticleEmitter.set(world, eid, {
          stopped: true,
        })
      })
  },
})