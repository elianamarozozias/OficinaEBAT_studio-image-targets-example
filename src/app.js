// Injeta a transparencia direto na pagina para evitar flashbang preto/branco
const style = document.createElement('style')
style.innerHTML = `
  html, body, canvas, .ar-canvas {
    background: transparent !important;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
`
document.head.appendChild(style)

// Inicializacao limpa do 8th Wall (sem tela intermediaria)
const onxrloaded = () => {
  XR8.XrController.configure({
    imageTargetData: [
      require('../image-targets/20_Element_Fire.json'),
      require('../image-targets/22_Element_Air.json'),
      require('../image-targets/23_Element_Water.json'),
      require('../image-targets/25_Element_Earth.json'),
      require('../image-targets/bmo-bites.json'),
      require('../image-targets/toggle-slam.json'),
      require('../image-targets/waves.json'),
      require('../image-targets/metagallery_transparent.json'),
    ],
  })
}

window.XR8 ? onxrloaded() : window.addEventListener('xrloaded', onxrloaded)