import * as ecs from '@8thwall/ecs'
import {OBJECT_PLACED_EVENT, OBJECT_RESET_EVENT} from './tap-to-place'

// imagens em src/assets/PETROBRAS
const IMG = {
  mover: encodeURI('assets/PETROBRAS/mOVER - pETROBRAS.png'),
  escalar: encodeURI('assets/PETROBRAS/Escalar 2 - petrobras.png'),
  rotacionar: encodeURI('assets/PETROBRAS/rotacionar - petrobras.png'),
  petrobras: encodeURI('assets/PETROBRAS/target_petrobras.png'),
  ebat: encodeURI('assets/PETROBRAS/ebat_marca.png'), // <- trocar pelo caminho da logo EBAT
}

const CSS = `
  #hud * { box-sizing: border-box; }
  #hud { position: fixed; inset: 0; z-index: 9999; pointer-events: none; font-family: sans-serif; }
  #hud .escondido { display: none !important; }

  #hud-loading { position: absolute; inset: 0; background: #000; color: #fff; pointer-events: auto;
    display: flex; align-items: center; justify-content: center; font-size: clamp(16px, 4.5vw, 24px); }

  #hud-gestos { position: absolute; left: 50%; transform: translateX(-50%);
    top: max(14px, env(safe-area-inset-top)); display: flex; gap: 3vw; }
  #hud-gestos .gesto { display: flex; flex-direction: column; align-items: center; gap: 4px; }
  #hud-gestos .ic { width: clamp(56px, 16vw, 90px); aspect-ratio: 1; background: #fff; border-radius: 14px;
    display: flex; align-items: center; justify-content: center; overflow: hidden; }
  #hud-gestos .ic img { width: 100%; height: 100%; object-fit: contain; }
  #hud-gestos span { color: #fff; font-size: clamp(12px, 3.5vw, 18px); text-shadow: 0 1px 3px #000; }

  #hud-instrucao { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
    width: min(92vw, 520px); background: #fff; border-radius: 18px; padding: 14px 16px;
    display: grid; grid-template-columns: auto 1fr auto; gap: 10px; align-items: center; }
  #hud-instrucao img { width: clamp(44px, 13vw, 70px); }
  #hud-instrucao p { margin: 0; text-align: center; font-size: clamp(13px, 3.8vw, 18px); line-height: 1.25; color: #000; }
  #hud-instrucao b { grid-column: 1 / -1; text-align: center; font-weight: 400; color: #000;
    font-size: clamp(15px, 4.4vw, 22px); }

  #hud-reset { position: absolute; pointer-events: auto; touch-action: manipulation;
    right: max(16px, env(safe-area-inset-right)); bottom: max(20px, env(safe-area-inset-bottom));
    background: #F00; color: #fff; border: none; border-radius: 14px;
    font-size: clamp(14px, 4vw, 20px); padding: clamp(10px, 3vw, 16px) clamp(16px, 5vw, 26px); }
`

ecs.registerComponent({
  name: 'hud-html',
  stateMachine: ({world, defineState}) => {
    // ---------- monta o HTML ----------
    let style = document.getElementById('hud-style')
    if (!style) {
      style = document.createElement('style')
      style.id = 'hud-style'
      style.textContent = CSS
      document.head.appendChild(style)
    }

    document.getElementById('hud')?.remove()
    const hud = document.createElement('div')
    hud.id = 'hud'
    hud.innerHTML = `
      <div id="hud-loading">Carregando...</div>

      <div id="hud-gestos" class="escondido">
        <div class="gesto"><div class="ic"><img src="${IMG.mover}"></div><span>Mover</span></div>
        <div class="gesto"><div class="ic"><img src="${IMG.escalar}"></div><span>Escalar</span></div>
        <div class="gesto"><div class="ic"><img src="${IMG.rotacionar}"></div><span>Rotacionar</span></div>
      </div>

      <div id="hud-instrucao" class="escondido">
        <img src="${IMG.ebat}">
        <p>Aponte o celular para a logo da Petrobrás para visualizar sua Realidade Aumentada.</p>
        <img src="${IMG.petrobras}">
        <b>OK</b>
      </div>

      <button id="hud-reset" class="escondido">Reposicionar</button>
    `
    document.body.appendChild(hud)

    const el = (id: string) => hud.querySelector('#' + id) as HTMLElement
    const mostrar = (id: string) => el(id).classList.remove('escondido')
    const esconder = (id: string) => el(id).classList.add('escondido')

    // ---------- botão Reposicionar ----------
    const reset = el('hud-reset')
    let ultimoToque = 0
    const resetar = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      const agora = Date.now()
      if (agora - ultimoToque < 400) return // evita disparar 2x no mesmo toque
      ultimoToque = agora
      console.log('[HUD] reposicionar clicado')
      world.events.dispatch(world.events.globalId, OBJECT_RESET_EVENT)
    }
    reset.addEventListener('pointerdown', (e) => e.stopPropagation())
    reset.addEventListener('touchstart', (e) => e.stopPropagation())
    reset.addEventListener('pointerup', resetar)
    reset.addEventListener('touchend', resetar)
    reset.addEventListener('click', resetar)

    // ---------- estados ----------
    // 1) carregando
    defineState('carregando')
      .initial()
      .onEvent(ecs.events.REALITY_READY, 'instrucao', {target: world.events.globalId})

    // 2) instrução no meio; some com qualquer toque
    defineState('instrucao')
      .onEnter(() => {
        esconder('hud-loading')
        mostrar('hud-instrucao')
      })
      .listen(world.events.globalId, ecs.input.SCREEN_TOUCH_START, () => esconder('hud-instrucao'))
      .onEvent(OBJECT_PLACED_EVENT, 'colocado', {target: world.events.globalId})

    // 3) objeto colocado: gestos + reposicionar (ficam)
    defineState('colocado')
      .onEnter(() => {
        esconder('hud-loading')
        esconder('hud-instrucao')
        mostrar('hud-gestos')
        mostrar('hud-reset')
      })
  },
  remove: () => {
    document.getElementById('hud')?.remove()
    document.getElementById('hud-style')?.remove()
  },
})