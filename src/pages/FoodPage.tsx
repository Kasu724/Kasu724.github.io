import FoodGallery from '../components/FoodGallery'

function FoodPage() {
  return (
    <main className="standalone-page">
      <section className="food-page" aria-labelledby="food-page-title">
        <h1 id="food-page-title" className="page-section-label">Food</h1>
        <FoodGallery />
      </section>
    </main>
  )
}

export default FoodPage
