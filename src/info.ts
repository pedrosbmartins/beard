const $infoModal = document.getElementById('info-modal')!
const $infoButton = document.getElementById('info-button')!

$infoButton.addEventListener('click', () => {
  $infoModal.classList.remove('hide')
})

$infoModal.addEventListener('click', event => {
  const target = event.target as any
  if (target.id === $infoModal.id) {
    $infoModal.classList.add('hide')
  }
})
