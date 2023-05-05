import { onExpressionChanged } from './main'

const $exprInput = document.querySelector<HTMLInputElement>('#expression input')!
const $exprContent = document.querySelector<HTMLSpanElement>('#expression .content')!
const $exprContentText = document.querySelector<HTMLSpanElement>('#expression .content span')!
const $graphviz = document.querySelector<HTMLSpanElement>('#graphviz')!

$exprInput.addEventListener('focusout', () => showExpressionContent($exprInput.value))
$exprInput.addEventListener('change', (event: Event) => {
  const expression = (event.target as HTMLInputElement).value
  onExpressionChanged(expression)
})

$exprContent.addEventListener('click', () => showExpressionInput())

export function showExpressionInput() {
  $exprContent.classList.add('hide')
  $exprInput.classList.remove('hide')
  $exprInput.focus()
}

export function showExpressionContent(content: string) {
  $exprContentText.innerText = content
  $exprInput.value = content
  $exprContent.classList.remove('hide')
  $exprInput.classList.add('hide')
}

$graphviz.addEventListener('click', () => {
  if (!$exprInput.classList.contains('hide')) {
    onExpressionChanged($exprInput.value)
  }
})
