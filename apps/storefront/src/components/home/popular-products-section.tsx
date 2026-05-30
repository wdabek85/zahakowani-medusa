import { ProductCard } from "@/components/product"
import { getPopularProducts } from "@/lib/medusa/products"

/**
 * "Najczęściej Przeglądane i Kupowane" home section.
 * Server Component — fetches products on render (Figma 413:1548).
 *
 * Width/padding follow the site-wide layout convention shared by Header,
 * InfoBar, SubNav, Hero and Footer: `mx-auto max-w-[1440px] px-4 sm:px-8
 * lg:px-20` (16/32/80px). Renders the shared compact ProductCard in a
 * responsive grid; the card's fixed width is overridden to `w-full` so it
 * fills each grid cell.
 */
export async function PopularProductsSection() {
  const products = await getPopularProducts(8)

  if (products.length === 0) return null

  return (
    <section className="bg-white py-6">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 sm:px-8 lg:px-20">
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
      </div>
    </section>
  )
}
