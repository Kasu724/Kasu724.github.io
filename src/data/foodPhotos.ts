import type { DisplayableFoodPhoto, FoodPhoto, FoodPhotoGroup } from '../types/food'

// New images are added here automatically. Fill in the date to publish an entry.
export const foodPhotos: FoodPhoto[] = [
  {
    src: "https://kasu724-food-assets.klui7240.workers.dev/originals/IMG_7612.jpg",
    date: '2026-08-11',
    caption: 'Burdock ice cream',
    restaurant: 'Moono',
    location: 'New York, NY, USA',
  },
  {
    src: "https://kasu724-food-assets.klui7240.workers.dev/originals/IMG_7611.jpg",
    date: '2026-08-11',
    caption: 'Korean melon shaved ice',
    restaurant: 'Moono',
    location: 'New York, NY, USA',
  },
  {
    src: "https://kasu724-food-assets.klui7240.workers.dev/originals/IMG_7608.JPG",
    date: '2026-08-11',
    caption: 'Pyongyang cold noodle',
    restaurant: 'Moono',
    location: 'New York, NY, USA',
  },
  {
    src: "https://kasu724-food-assets.klui7240.workers.dev/originals/IMG_7607.jpg",
    date: '2026-08-11',
    caption: 'Squid stir fry',
    restaurant: 'Moono',
    location: 'New York, NY, USA',
  },
  {
    src: "https://kasu724-food-assets.klui7240.workers.dev/originals/IMG_7605.jpg",
    date: '2026-08-11',
    caption: 'Hoe muchim (spicy Korean raw salmon) with seaweed',
    restaurant: 'Moono',
    location: 'New York, NY, USA',
  },
  {
    src: "https://kasu724-food-assets.klui7240.workers.dev/originals/IMG_7604.jpg",
    date: '2026-08-11',
    caption: 'Asparagus japchae',
    restaurant: 'Moono',
    location: 'New York, NY, USA',
  },
  {
    src: "https://kasu724-food-assets.klui7240.workers.dev/originals/IMG_7603.jpg",
    date: '2026-08-11',
    caption: 'Lotus root gangjeong',
    restaurant: 'Moono',
    location: 'New York, NY, USA',
  },
  {
    src: "https://kasu724-food-assets.klui7240.workers.dev/originals/IMG_7602.jpg",
    date: '2026-08-11',
    caption: 'Shrimp pancakes',
    restaurant: 'Moono',
    location: 'New York, NY, USA',
  },
  {
    src: "https://kasu724-food-assets.klui7240.workers.dev/originals/IMG_7601.jpg",
    date: '2026-08-11',
    caption: 'Spicy fried chicken',
    restaurant: 'Moono',
    location: 'New York, NY, USA',
  },
  {
    src: "https://kasu724-food-assets.klui7240.workers.dev/originals/IMG_7600.jpg",
    date: '2026-08-11',
    caption: 'Yukhoe (beef tartare)',
    restaurant: 'Moono',
    location: 'New York, NY, USA',
  },
  {
    src: "https://kasu724-food-assets.klui7240.workers.dev/originals/IMG_7599.jpg",
    date: '2026-08-11',
    caption: 'Kimchi',
    restaurant: 'Moono',
    location: 'New York, NY, USA',
  },
  {
    src: "https://kasu724-food-assets.klui7240.workers.dev/originals/IMG_7598.jpg",
    date: '2026-08-11',
    caption: 'Chilled cucumber soup amuse-bouche (oi-naengguk) with agar jelly and apple',
    restaurant: 'Moono',
    location: 'New York, NY, USA',
  },
  {
    src: "https://kasu724-food-assets.klui7240.workers.dev/originals/IMG_7597.jpg",
    date: '2026-08-11',
    caption: 'Iced strawberry matcha latte',
    restaurant: 'Cha Cha Matcha',
    location: 'New York, NY, USA',
  },
  {
    src: "https://kasu724-food-assets.klui7240.workers.dev/originals/IMG_7593.jpg",
    date: '2026-08-11',
    caption: 'Hazelnut cloud pastry',
    restaurant: 'Salswee',
    location: 'New York, NY, USA',
  },
  {
    src: "https://kasu724-food-assets.klui7240.workers.dev/originals/IMG_7592.jpg",
    date: '2026-08-11',
    caption: 'Yuzu pastry',
    restaurant: 'Salswee',
    location: 'New York, NY, USA',
  },
  {
    src: "https://kasu724-food-assets.klui7240.workers.dev/originals/IMG_7591.jpg",
    date: '2026-08-11',
    caption: 'Pistachio and cashew baklava',
    restaurant: 'ilili Midtown',
    location: 'New York, NY, USA',
  },
  {
    src: "https://kasu724-food-assets.klui7240.workers.dev/originals/IMG_7589.JPG",
    date: '2026-08-11',
    caption: 'Hummus, baba ghannouj, mouhamara',
    restaurant: 'ilili Midtown',
    location: 'New York, NY, USA',
  },
  {
    src: "https://kasu724-food-assets.klui7240.workers.dev/originals/IMG_7590.jpg",
    date: '2026-08-11',
    caption: 'Wagyu burger',
    restaurant: 'ilili Midtown',
    location: 'New York, NY, USA',
  },
  {
    src: "https://kasu724-food-assets.klui7240.workers.dev/originals/IMG_7707.JPG",
    date: '2026-08-17',
    caption: 'Affogato',
    restaurant: 'Viaggio @ Sunscape Resort',
    location: 'Cancún, QR, Mexico',
  },
  {
    src: "https://kasu724-food-assets.klui7240.workers.dev/originals/IMG_7706.JPG",
    date: '2026-08-17',
    caption: 'Tiramisu',
    restaurant: 'Viaggio @ Sunscape Resort',
    location: 'Cancún, QR, Mexico',
  },
  {
    src: "https://kasu724-food-assets.klui7240.workers.dev/originals/IMG_7704.JPG",
    date: '2026-08-17',
    caption: 'Grilled mackerel',
    restaurant: 'Viaggio @ Sunscape Resort',
    location: 'Cancún, QR, Mexico',
  },
  {
    src: "https://kasu724-food-assets.klui7240.workers.dev/originals/IMG_7703.JPG",
    date: '2026-08-17',
    caption: 'Four cheese mac and cheese with truffle oil',
    restaurant: 'Viaggio @ Sunscape Resort',
    location: 'Cancún, QR, Mexico',
  },
  {
    src: "https://kasu724-food-assets.klui7240.workers.dev/originals/IMG_7665.jpg",
    date: '2026-08-14',
    caption: 'Mango sorbet, sticky rice, candied coconut',
    restaurant: 'Crown Shy',
    location: 'New York, NY, USA',
  },
  {
    src: "https://kasu724-food-assets.klui7240.workers.dev/originals/IMG_7664.jpg",
    date: '2026-08-14',
    caption: 'Satsuma, toasted marshmallow, honeycomb',
    restaurant: 'Crown Shy',
    location: 'New York, NY, USA',
  },
  {
    src: "https://kasu724-food-assets.klui7240.workers.dev/originals/IMG_7663.jpg",
    date: '2026-08-14',
    caption: 'Sungold amatriciana, rigatoni',
    restaurant: 'Crown Shy',
    location: 'New York, NY, USA',
  },
  {
    src: "https://kasu724-food-assets.klui7240.workers.dev/originals/IMG_7662.jpg",
    date: '2026-08-14',
    caption: 'Tempura squash, vadouvan, koshihikari rice',
    restaurant: 'Crown Shy',
    location: 'New York, NY, USA',
  },
  {
    src: "https://kasu724-food-assets.klui7240.workers.dev/originals/IMG_7661.jpg",
    date: '2026-08-14',
    caption: 'Blackened monkfish, sauce américaine',
    restaurant: 'Crown Shy',
    location: 'New York, NY, USA',
  },
  {
    src: "https://kasu724-food-assets.klui7240.workers.dev/originals/IMG_7660.jpg",
    date: '2026-08-14',
    caption: 'Seared scallops, chicharrones',
    restaurant: 'Crown Shy',
    location: 'New York, NY, USA',
  },
  {
    src: "https://kasu724-food-assets.klui7240.workers.dev/originals/IMG_7658.JPG",
    date: '2026-08-14',
    caption: 'Kibbeh nayah, lavash; tomato, peach, parmesan',
    restaurant: 'Crown Shy',
    location: 'New York, NY, USA',
  },
  {
    src: "https://kasu724-food-assets.klui7240.workers.dev/originals/IMG_7657.jpg",
    date: '2026-08-14',
    caption: 'Pull-apart pistachio pesto bread',
    restaurant: 'Crown Shy',
    location: 'New York, NY, USA',
  },
  {
    src: "https://kasu724-food-assets.klui7240.workers.dev/originals/IMG_7727.jpg",
    date: '2026-08-18',
    caption: 'Tuna Tartare',
    restaurant: 'At Sunset @ Sunscape Resort',
    location: 'Cancún, QR, Mexico',
  },
  {
    src: "https://kasu724-food-assets.klui7240.workers.dev/originals/IMG_7728.JPG",
    date: '2026-08-18',
    caption: 'Ribeye with a baked potato',
    restaurant: 'At Sunset @ Sunscape Resort',
    location: 'Cancún, QR, Mexico',
  },
  {
    src: "https://kasu724-food-assets.klui7240.workers.dev/originals/IMG_7729.JPG",
    date: '2026-08-18',
    caption: 'Chocolate mousse',
    restaurant: 'At Sunset @ Sunscape Resort',
    location: 'Cancún, QR, Mexico',
  },
  {
    src: "https://kasu724-food-assets.klui7240.workers.dev/originals/IMG_7731.JPG",
    date: '2026-08-19',
    caption: 'Beef birria gorditas',
    restaurant: 'Casa de Rosa @ Sunscape Resort',
    location: 'Cancún, QR, Mexico',
  },
  {
    src: "https://kasu724-food-assets.klui7240.workers.dev/originals/IMG_7734.jpg",
    date: '2026-08-19',
    caption: 'Grilled octopus',
    restaurant: 'Casa de Rosa @ Sunscape Resort',
    location: 'Cancún, QR, Mexico',
  },
  {
    src: "https://kasu724-food-assets.klui7240.workers.dev/originals/IMG_7736.jpg",
    date: '2026-08-19',
    caption: 'Churros with hot chocolate',
    restaurant: 'Casa de Rosa @ Sunscape Resort',
    location: 'Cancún, QR, Mexico',
  },
  {
    src: "https://kasu724-food-assets.klui7240.workers.dev/originals/IMG_7777.jpg",
    date: '2026-08-22',
    caption: 'Soy-marinated salmon',
    restaurant: 'NARO',
    location: 'New York, NY, USA',
  },
  {
    src: "https://kasu724-food-assets.klui7240.workers.dev/originals/IMG_7778.jpg",
    date: '2026-08-22',
    caption: 'Steak tartare',
    restaurant: 'NARO',
    location: 'New York, NY, USA',
  },
  {
    src: "https://kasu724-food-assets.klui7240.workers.dev/originals/IMG_7779.jpg",
    date: '2026-08-22',
    caption: 'Black cod',
    restaurant: 'NARO',
    location: 'New York, NY, USA',
  },
  {
    src: "https://kasu724-food-assets.klui7240.workers.dev/originals/IMG_7780.jpg",
    date: '2026-08-22',
    caption: 'Beef tenderloin',
    restaurant: 'NARO',
    location: 'New York, NY, USA',
  },
  {
    src: "https://kasu724-food-assets.klui7240.workers.dev/originals/IMG_7782.jpg",
    date: '2026-08-22',
    caption: 'Mushroom rice',
    restaurant: 'NARO',
    location: 'New York, NY, USA',
  },

]

const monthYearFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
})

const fullDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

function parseLocalDate(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function isDisplayableFoodPhoto(photo: FoodPhoto): photo is DisplayableFoodPhoto {
  if (!photo.src?.trim() || !photo.date || !/^\d{4}-\d{2}-\d{2}$/.test(photo.date)) {
    return false
  }

  const [year, month, day] = photo.date.split('-').map(Number)
  const parsedDate = parseLocalDate(photo.date)

  return parsedDate.getFullYear() === year
    && parsedDate.getMonth() === month - 1
    && parsedDate.getDate() === day
}

export function formatFoodPhotoDate(date: string) {
  return fullDateFormatter.format(parseLocalDate(date))
}

export function groupFoodPhotosByMonth(photos: FoodPhoto[] = foodPhotos): FoodPhotoGroup[] {
  const groups = new Map<string, FoodPhotoGroup>()
  const sortedPhotos = photos
    .filter(isDisplayableFoodPhoto)
    .sort((left, right) => right.date.localeCompare(left.date))

  sortedPhotos.forEach((photo) => {
    const key = photo.date.slice(0, 7)
    const existingGroup = groups.get(key)

    if (existingGroup) {
      existingGroup.photos.push(photo)
      return
    }

    groups.set(key, {
      key,
      label: monthYearFormatter.format(parseLocalDate(photo.date)),
      photos: [photo],
    })
  })

  return [...groups.values()]
}
