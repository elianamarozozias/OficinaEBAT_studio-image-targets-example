import * as ecs from '@8thwall/ecs'
import {OBJECT_PLACED_EVENT, OBJECT_RESET_EVENT} from './tap-to-place'

ecs.registerComponent({
  name: 'reset-button',
  stateMachine: ({world, entity, defineState}) => {
    defineState('nothing-placed')
      .initial()
      .onEvent(OBJECT_PLACED_EVENT, 'placed', {target: world.events.globalId})
      .onEnter(() => entity.hide())
      .onExit(() => entity.show())

    defineState('placed')
      .listen(world.events.globalId, ecs.input.UI_CLICK, () => {
        world.events.dispatch(world.events.globalId, OBJECT_RESET_EVENT)
      })
  },
})