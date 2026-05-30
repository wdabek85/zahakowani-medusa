import { Container } from "@/components/ui"
import { ProductCard } from "@/components/product"
import { getPopularProducts } from "@/lib/medusa/products"

/**
 * "Najczęściej Przeglądane i Kupowane" home section.
 * Server Component — fetches products on render (Figma 413:1548).
 *
 * Renders the shared compact ProductCard in a responsive grid. The card's
 * fixed width is overridden to `w-full` so it fills each grid cell.
 */
export async function PopularProductsSection() {
  const products = await getPopularProducts(8)

  if (products.length === 0) return null

  return (
    <section className="bg-white py-6">
      <Container className="flex flex-col gap-4">
        <h2 className="font-heading text-2xl font-bold leading-7 text-black">
          Najczęściej Przeglądane i Kupowane
        </h2>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              className="w-full"
            />
          ))}
        </div>
      </Container>
    </section>
  )
}
