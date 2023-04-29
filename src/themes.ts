import { onThemeChange } from './main'

export type Theme = 'dark' | 'light'

const $appRoot = document.getElementById('app')!

const $themeSelector = document.getElementById('theme-selector')!
$themeSelector.addEventListener('click', () => {
  const theme = $appRoot.classList.contains('theme-light') ? 'dark' : 'light'
  selectTheme(theme)
  onThemeChange(theme)
})

function selectTheme(theme: Theme) {
  if (theme === 'dark') {
    $appRoot.classList.remove('theme-light')
    $appRoot.classList.add('theme-dark')
  } else {
    $appRoot.classList.remove('theme-dark')
    $appRoot.classList.add('theme-light')
  }
}
