import * as ecs from '@8thwall/ecs'

ecs.registerComponent({
  name: 'Hide On Click',
  schema: {},
  stateMachine: ({world, eid}) => {
    ecs.defineState('default')
      .initial()
      .listen(eid, 'click', () => {
        ecs.Hidden.set(world, eid)
      })
  },
})