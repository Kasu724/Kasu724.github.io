import FoodGallery from '../components/FoodGallery'

function FoodPage() {
  return (
    <main className="standalone-page">
      <section className="food-page" aria-labelledby="food-page-title">
        <h1 id="food-page-title" className="page-section-label">Food</h1>
        <p className="food-page__lede">
          Meals and places worth remembering. Hover over a photo for details, or select it
          to take a closer look.
        </p>
        <FoodGallery />
      </section>
    </main>
  )
}

export default FoodPage
