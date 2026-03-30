import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store/index'
import { setMenuItems, setLoading, setError } from '../store/slices/menuSlice'
import { menuAPI } from '../services/api'
import MenuCard from '../components/MenuCard'

const Menu: React.FC = () => {
  const dispatch = useDispatch()
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

  return (
    <div className="bg-black py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gold mb-2">Our Menu</h1>
        <p className="text-gray-400 mb-8">Authentic Indian cuisine</p>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => {}}
            className="px-4 py-2 rounded bg-coffee text-white hover:bg-gold hover:text-black transition-colors"
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {}}
              className="px-4 py-2 rounded bg-coffee text-white hover:bg-gold hover:text-black transition-colors capitalize"
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        {isLoading ? (
          <div className="text-center text-gray-400">Loading menu...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Menu
