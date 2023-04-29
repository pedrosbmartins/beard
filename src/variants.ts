import { onVariantSelect as onVariantSelected } from './main'

export type Variant = 'full' | 'tree' | 'diagram'

const $variants: { [k in Variant]: HTMLElement } = {
  full: document.querySelector<HTMLElement>('#variant-selector div[data-variant="full"]')!,
  tree: document.querySelector<HTMLElement>('#variant-selector div[data-variant="tree"]')!,
  diagram: document.querySelector<HTMLElement>('#variant-selector div[data-variant="diagram"]')!
}

Object.entries($variants).forEach(([variant, element]) => {
  element.addEventListener('click', () => onVariantSelected(variant as Variant))
})

export function selectVariant(current: Variant) {
  Object.keys($variants).forEach(key => {
    if (key === current) {
      $variants[key].classList.add('active')
    } else {
      $variants[key as Variant].classList.remove('active')
    }
  })
}
