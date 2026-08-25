export type FoodPhoto = {
  src?: string
  alt?: string
  date?: string
  caption?: string
  restaurant?: string
  location?: string
}

export type DisplayableFoodPhoto = FoodPhoto & {
  src: string
  date: string
}

export type FoodPhotoGroup = {
  key: string
  label: string
  photos: DisplayableFoodPhoto[]
}
