import * as ecs from '@8thwall/ecs'

ecs.registerComponent({
  name: 'MakeSticky',

  add: (world, component) => {
    const {eid} = component
    let isSticky = false

    world.events.addListener(eid, 'xrimagefound', () => {
      // Garante que só roda uma única vez na primeira leitura
      if (isSticky) return
      isSticky = true

      // Pega todos os elementos dentro do Target (Petrobras + Obras dos Alunos)
      const children = ecs.Parent.getChildren(world, eid)

      children.forEach((childEid) => {
        // Captura posição, rotação e escala atuais no mundo real
        const pos = ecs.Position.get(world, childEid)
        const rot = ecs.Rotation.get(world, childEid)
        const scale = ecs.Scale.get(world, childEid)

        // Desconecta o elemento do Image Target (solta no Mundo)
        ecs.Parent.remove(world, childEid)

        // Re-aplica as coordenadas fixas no espaço 3D da sala
        ecs.Position.set(world, childEid, pos.x, pos.y, pos.z)
        ecs.Rotation.set(world, childEid, rot.x, rot.y, rot.z, rot.w)
        ecs.Scale.set(world, childEid, scale.x, scale.y, scale.z)
      })
    })
  },
})