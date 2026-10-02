import * as ecs from '@8thwall/ecs'

const WARMUP = {x: 0, y: 0, z: -1.5}    // à frente da câmera, durante o loading
const PARKING = {x: 0, y: -100, z: 0}   // fora de vista, já aquecido

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
  stateMachine: ({world, eid, schemaAttribute, defineState}) => {
    const {worldContent} = schemaAttribute.get(eid)

    defineState('warmup')
      .initial()
      .onEnter(() => {
        console.log('>> aquecendo, worldContent:', worldContent)
        ecs.Hidden.remove(world, worldContent)
        world.setPosition(worldContent, WARMUP.x, WARMUP.y, WARMUP.z)
      })
      .onEvent(ecs.events.REALITY_READY, 'scanning', {target: world.events.globalId})
      .onExit(() => {
        console.log('>> realidade pronta, estacionando')
        world.setPosition(worldContent, PARKING.x, PARKING.y, PARKING.z)
      })

    defineState('scanning')
      .listen(world.events.globalId, ecs.events.REALITY_IMAGE_FOUND, (e) => {
        const {name, position, rotation} = e.data as any
        const {imageTargetName} = schemaAttribute.get(eid)
        if (name !== imageTargetName) return

        console.log('>> imagem encontrada, ancorando')
        world.setQuaternion(worldContent, rotation.x, rotation.y, rotation.z, rotation.w)
        world.setPosition(worldContent, position.x, position.y, position.z)
        world.events.dispatch(eid, 'anchored')
      })
      .onEvent('anchored', 'anchored')

    // ancorado: ninguém mexe mais na posição, nem se a imagem for reencontrada
    defineState('anchored')
  },
})