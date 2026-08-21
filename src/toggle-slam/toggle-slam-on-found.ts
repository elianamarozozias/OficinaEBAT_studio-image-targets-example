import * as ecs from '@8thwall/ecs'

ecs.registerComponent({
  name: 'Toggle SLAM on Found',
  schema: {
    // @required
    worldContent: ecs.eid,
    imageTargetName: ecs.string,
  },
  schemaDefaults: {
    imageTargetName: '',
  },
  stateMachine: ({world, eid, schemaAttribute}) => {
    ecs.defineState('default')
      .initial()
      .onEnter(() => {
        const {worldContent} = schemaAttribute.get(eid)
        // Apenas esconde o conteúdo inicialmente, sem desativar o motor SLAM da câmera
        ecs.Hidden.set(world, worldContent)
      })
      .listen(world.events.globalId, 'reality.imagefound', (e) => {
        const {name, position, scale} = e.data as any
        const {imageTargetName, worldContent} = schemaAttribute.get(eid)

        if (name === imageTargetName) {
          // Posiciona, escala e revela o objeto sem engasgo de tracking
          world.setScale(worldContent, scale, scale, scale)
          world.setPosition(worldContent, position.x, position.y, position.z)
          ecs.Hidden.remove(world, worldContent)
        }
      })
  },
})