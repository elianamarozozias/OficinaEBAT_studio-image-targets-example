import * as ecs from '@8thwall/ecs'

ecs.registerComponent({
  name: 'Hide On Click',
  schema: {},
  stateMachine: ({world, eid, entity, defineState}) => {
    defineState('loading')
      .initial()
      .onEnter(() => entity.hide())
      .onExit(() => entity.show())
      .onEvent(ecs.events.REALITY_READY, 'visivel', {target: world.events.globalId})

    defineState('visivel')
      .listen(world.events.globalId, ecs.input.SCREEN_TOUCH_START, () => entity.hide())
  },
})