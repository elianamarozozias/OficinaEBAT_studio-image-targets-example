export const MakeSticky = {
  init() {
    this.el.addEventListener('xrimagefound', () => {
      this.hasBeenFound = true
    })
    this.el.addEventListener('xrimagelost', () => {
      if (this.hasBeenFound) {
        // Impede o 8th Wall de esconder o 3D quando a imagem sumir
        this.el.object3D.visible = true
      }
    })
  }
}