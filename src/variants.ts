import { onVariantSelect as onVariantSelected } from './main'

export type Variant = 'full' | 'tree' | 'diagram'

const $variantSelector = document.getElementById('variant-selector')!

const $variants: { [k in Variant]: HTMLElement } = {
  full: $variantSelector.querySelector<HTMLElement>('div[data-variant="full"]')!,
  tree: $variantSelector.querySelector<HTMLElement>('div[data-variant="tree"]')!,
  diagram: $variantSelector.querySelector<HTMLElement>('div[data-variant="diagram"]')!
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

export function hideVariantSelector() {
  $variantSelector.setAttribute('style', 'display: none;')
}
