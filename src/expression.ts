import { onExpressionChange } from './main'

const $exprInput = document.querySelector<HTMLInputElement>('#expression input')!
$exprInput.addEventListener('focusout', () => toggleExpressionDisplay(false, $exprInput.value))
$exprInput.addEventListener('change', (event: Event) => {
  const expression = (event.target as HTMLInputElement).value
  onExpressionChange(expression)
})

const $exprContent = document.querySelector<HTMLSpanElement>('#expression .content')!
const $exprContentText = document.querySelector<HTMLSpanElement>('#expression .content span')!
$exprContent.addEventListener('click', () => toggleExpressionDisplay(true))

export function toggleExpressionDisplay(editing: boolean, content?: string) {
  if (editing) {
    $exprContent.classList.add('hide')
    $exprInput.classList.remove('hide')
    $exprInput.focus()
  } else {
    if (content) $exprContentText.innerText = content
    $exprContent.classList.remove('hide')
    $exprInput.classList.add('hide')
  }
}
