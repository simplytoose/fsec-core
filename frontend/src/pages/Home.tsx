import React, { useEffect, useState } from 'react'
import { getProducts, type Product } from '../api'
import Hero from '../components/Hero'
import ProductCard from '../components/ProductCard'
import { useCart } from '../CartContext'

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null)
  const { addToCart } = useCart();

  const fetchProducts = async () => {
    try {
      const data = await getProducts(0, 100)
      if (data && data.content) {
        setProducts(data.content)
      } else if (Array.isArray(data)) {
         setProducts(data)
      } else if (data && data.pageable) {
         setProducts(data.content)
      }
    } catch (error) {
      console.error("Failed to fetch products", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleBuy = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    addToCart(product, 1);
    
    setNotification({ message: `${product.title} added to cart!`, type: "success" })
    
    setTimeout(() => {
      setNotification(null)
    }, 2500)
  }

  return (
    <main className="main-content">
      <Hero />
      
      <section className="products-section">
        <div className="section-header">
          <h2 className="section-title">Trending Deals</h2>
          <div className="filter-tabs">
            <button className="active">All</button>
            <button>Components</button>
            <button>Peripherals</button>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loader large"></div>
            <p>Loading the best deals...</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.length === 0 && (
              <div className="empty-state">
                <p>No products available yet. Add some to the database!</p>
              </div>
            )}
            {products.map((product, index) => (
              <div key={product.id} style={{ animationDelay: `${index * 0.1}s`, animation: 'fadeInUp 0.6s ease-out backwards' }}>
                <ProductCard 
                  product={product} 
                  onBuy={handleBuy} 
                />
              </div>
            ))}
          </div>
        )}
      </section>
      
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </main>
  )
}

export default Home;
