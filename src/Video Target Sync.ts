import * as ecs from '@8thwall/ecs'

ecs.registerComponent({
  name: 'Video Target Sync',
  schema: {},
  stateMachine: ({world, eid}) => {
    ecs.defineState('default')
      .initial()
      .listen(world.events.globalId, 'reality.imagefound', () => {
        // Encontrou o target: volta para o frame zero e dá play
        ecs.video.setCurrentTime(world, eid, 0)
        ecs.VideoControls.mutate(world, eid, (c) => {
          c.paused = false
        })
      })
      .listen(world.events.globalId, 'reality.imagelost', () => {
        // Perdeu o target: pausa e reseta para o início
        ecs.VideoControls.mutate(world, eid, (c) => {
          c.paused = true
        })
        ecs.video.setCurrentTime(world, eid, 0)
      })
  },
})