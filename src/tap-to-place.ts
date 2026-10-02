import * as ecs from '@8thwall/ecs'

const OBJECT_PLACED_EVENT = 'object-placed'
const OBJECT_RESET_EVENT = 'object-reset'

const PARKING_SPOT = {x: 0, y: -100, z: 0}
const WARMUP_SPOT = {x: 0, y: 0, z: -1.5}   // à frente da câmera, durante o loading

ecs.registerComponent({
  name: 'tap-to-place',
  schema: {
    prefab: 'eid',
    imageTargetName: ecs.string,   // nome do image target
    facingOffset: 'f32',
  },
  schemaDefaults: {
    imageTargetName: '',
  },
  stateMachine: ({world, eid, schemaAttribute, defineState}) => {
    let placedEid: any = null

    const createParked = (spot) => {
      const newEid = world.createEntity(schemaAttribute.get(eid).prefab)
      world.getEntity(newEid).setLocalPosition(spot)
      return newEid
    }

    // nasce visível: a GPU compila shader durante a tela de loading
    placedEid = createParked(WARMUP_SPOT)

    defineState('warmup')
      .initial()
      .onEvent(ecs.events.REALITY_READY, 'scanning', {target: world.events.globalId})
      .onExit(() => {
        world.getEntity(placedEid).setLocalPosition(PARKING_SPOT)
      })

    defineState('scanning')
      .listen(world.events.globalId, ecs.events.REALITY_IMAGE_FOUND, (e) => {
        const {name, position, rotation} = e.data as any
        const {imageTargetName} = schemaAttribute.get(eid)
        if (name !== imageTargetName) return

        let alive = false
        if (placedEid !== null) {
          try {
            ecs.Position.get(world, placedEid)
            alive = true
          } catch (err) {
            placedEid = null
          }
        }
        if (!alive) placedEid = createParked(PARKING_SPOT)

        const entity = world.getEntity(placedEid)
        entity.setLocalPosition(position)
        entity.set(ecs.Quaternion, {x: rotation.x, y: rotation.y, z: rotation.z, w: rotation.w})

        world.events.dispatch(world.events.globalId, OBJECT_PLACED_EVENT)
        world.events.dispatch(eid, 'placed')
      })
      .onEvent('placed', 'placed')

    // ancorado: reencontrar a imagem não reposiciona nada
    defineState('placed')
      .listen(world.events.globalId, OBJECT_RESET_EVENT, () => {
        world.events.dispatch(eid, 'back')
      })
      .onEvent('back', 'scanning')
  },
})

export {OBJECT_PLACED_EVENT, OBJECT_RESET_EVENT}