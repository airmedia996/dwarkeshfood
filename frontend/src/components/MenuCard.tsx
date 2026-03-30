import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../store/slices/cartSlice'
import { RootState } from '../store/index'
import { motion } from 'framer-motion'

interface MenuItem {
  id: string
  name: string
  category: string
  description?: string
  price: number
  image: string
  rating: number
  reviewCount: number
  isVegetarian: boolean
  spiceLevel?: string
  preparationTime?: number
  availability: boolean
}

interface MenuCardProps {
  item: MenuItem
}

const MenuCard: React.FC<MenuCardProps> = ({ item }) => {
  const dispatch = useDispatch()
  const { token } = useSelector((state: RootState) => state.auth)
  const [quantity, setQuantity] = useState(1)
  const [showAnimation, setShowAnimation] = useState(false)

  const handleAddToCart = () => {
    if (!token) {
      alert('Please login to add items to cart')
      return
    }

    setShowAnimation(true)
    dispatch(
      addToCart({
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity,
      })
    )
    setTimeout(() => {
      setShowAnimation(false)
      setQuantity(1)
    }, 600)
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-dark-coffee border border-coffee rounded-lg overflow-hidden hover:border-gold transition-colors"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-black">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
        />
        {!item.availability && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-gold font-bold">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-white font-bold text-lg flex-1">{item.name}</h3>
          {item.isVegetarian && <span className="text-green-500 text-sm">🌱 Veg</span>}
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-gray-400 text-sm mb-2 line-clamp-2">{item.description}</p>
        )}

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-gold">⭐ {item.rating.toFixed(1)}</span>
          <span className="text-gray-400 text-sm">({item.reviewCount})</span>
        </div>

        {/* Spice Level and Prep Time */}
        <div className="flex gap-2 mb-3 text-xs text-gray-400">
          {item.spiceLevel && <span>🌶️ {item.spiceLevel}</span>}
          {item.preparationTime && <span>⏱️ {item.preparationTime} min</span>}
        </div>

        {/* Price */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-2xl font-bold text-gold">₹{item.price}</span>
        </div>

        {/* Quantity and Add to Cart */}
        <div className="flex gap-2">
          <div className="flex items-center border border-coffee rounded">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 py-1 text-gold hover:bg-coffee transition-colors"
            >
              −
            </button>
            <span className="px-4 py-1 text-white">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="px-3 py-1 text-gold hover:bg-coffee transition-colors"
            >
              +
            </button>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddToCart}
            disabled={!item.availability}
            className={`flex-1 px-4 py-2 rounded font-bold transition-colors ${
              item.availability
                ? 'bg-gold text-black hover:bg-yellow-500'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {showAnimation ? '✓ Added!' : 'Add to Cart'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default MenuCard
