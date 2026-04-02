import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { RootState } from '../store/index'
import { setMenuItems, setLoading, setError, setSelectedCategory } from '../store/slices/menuSlice'
import { menuAPI } from '../services/api'
import MenuCard from '../components/MenuCard'

const Menu: React.FC = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items, isLoading, error, selectedCategory } = useSelector(
    (state: RootState) => state.menu
  )
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        dispatch(setLoading(true))
        const response = await menuAPI.getMenuItems({
          category: selectedCategory || undefined,
        })
        dispatch(setMenuItems(response.data))
      } catch (err: any) {
        dispatch(setError(err.message))
      } finally {
        dispatch(setLoading(false))
      }
    }

    const fetchCategories = async () => {
      try {
        const response = await menuAPI.getCategories()
        setCategories(response.data)
      } catch (err) {
        console.error('Failed to fetch categories')
      }
    }

    fetchMenu()
    fetchCategories()
  }, [dispatch, selectedCategory])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <div className="bg-black py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-gold hover:text-yellow-500 transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-5xl font-bold text-gold mb-2">🍽️ Our Menu</h1>
          <p className="text-gray-400 text-lg">Authentic Indian cuisine - Fresh & Delicious</p>
          <div className="w-24 h-1 bg-gradient-to-r from-gold to-coffee rounded mt-4"></div>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex flex-wrap gap-3 mb-10"
        >
          <button
            onClick={() => dispatch(setSelectedCategory(null))}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              !selectedCategory
                ? 'bg-gold text-black shadow-lg scale-105'
                : 'bg-coffee text-white hover:bg-gold hover:text-black'
            }`}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => dispatch(setSelectedCategory(cat))}
              className={`px-6 py-3 rounded-lg font-semibold capitalize transition-all duration-300 ${
                selectedCategory === cat
                  ? 'bg-gold text-black shadow-lg scale-105'
                  : 'bg-coffee text-white hover:bg-gold hover:text-black'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Menu Items */}
        {isLoading ? (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-center text-gray-400 py-12"
          >
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mb-4"></div>
              <p>Loading delicious menu items...</p>
            </div>
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center text-red-500 py-12 bg-red-900 bg-opacity-20 rounded-lg"
          >
            {error}
          </motion.div>
        ) : items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-400 py-12"
          >
            No items found in this category
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {items.map((item) => (
              <motion.div key={item.id} variants={itemVariants}>
                <MenuCard item={item} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Stats */}
        {!isLoading && items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-center mt-12 text-gray-400"
          >
            <p>Showing <span className="text-gold font-bold">{items.length}</span> delicious items</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Menu
