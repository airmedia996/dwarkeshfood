import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { menuAPI } from '../../services/api'

const MenuManager: React.FC = () => {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: 'snacks',
    description: '',
    price: 0,
    image: '',
    isVegetarian: true,
    spiceLevel: 'mild',
    preparationTime: 15,
    availability: true,
  })

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await menuAPI.getMenuItems({})
        setItems(response.data)
      } catch (error) {
        console.error('Failed to fetch menu items')
      } finally {
        setIsLoading(false)
      }
    }
    fetchItems()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await menuAPI.updateMenuItem(editingId, formData)
        setItems(items.map((item) => (item.id === editingId ? { ...item, ...formData } : item)))
      } else {
        const response = await menuAPI.createMenuItem(formData)
        setItems([...items, response.data])
      }
      setShowForm(false)
      setEditingId(null)
      setFormData({
        name: '',
        category: 'snacks',
        description: '',
        price: 0,
        image: '',
        isVegetarian: true,
        spiceLevel: 'mild',
        preparationTime: 15,
        availability: true,
      })
    } catch (error) {
      alert('Failed to save menu item')
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this item?')) {
      try {
        await menuAPI.deleteMenuItem(id)
        setItems(items.filter((item) => item.id !== id))
      } catch (error) {
        alert('Failed to delete menu item')
      }
    }
  }

  return (
    <div>
      {/* Add Item Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          setShowForm(!showForm)
          setEditingId(null)
        }}
        className="mb-6 px-6 py-3 bg-gold text-black rounded-lg font-bold hover:bg-yellow-500 transition-colors"
      >
        {showForm ? '✕ Cancel' : '+ Add Menu Item'}
      </motion.button>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="bg-dark-coffee border border-coffee rounded-lg p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <input
              type="text"
              placeholder="Item Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="px-4 py-2 bg-black border border-coffee rounded text-white"
            />
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="px-4 py-2 bg-black border border-coffee rounded text-white"
            >
              <option value="snacks">Snacks</option>
              <option value="curries">Curries</option>
              <option value="desserts">Desserts</option>
              <option value="breads">Breads</option>
            </select>
            <input
              type="number"
              placeholder="Price"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              className="px-4 py-2 bg-black border border-coffee rounded text-white"
            />
            <input
              type="number"
              placeholder="Prep Time (mins)"
              value={formData.preparationTime}
              onChange={(e) => setFormData({ ...formData, preparationTime: parseInt(e.target.value) })}
              className="px-4 py-2 bg-black border border-coffee rounded text-white"
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="md:col-span-2 px-4 py-2 bg-black border border-coffee rounded text-white"
              rows={2}
            />
            <input
              type="url"
              placeholder="Image URL"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="md:col-span-2 px-4 py-2 bg-black border border-coffee rounded text-white"
            />
            <button
              type="submit"
              className="md:col-span-2 px-6 py-2 bg-gold text-black rounded font-bold hover:bg-yellow-500"
            >
              {editingId ? 'Update Item' : 'Add Item'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Items List */}
      {isLoading ? (
        <div className="text-center text-gray-400">Loading menu items...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-dark-coffee border border-coffee rounded-lg overflow-hidden"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="text-white font-bold mb-1">{item.name}</h3>
                <p className="text-gray-400 text-sm mb-2">{item.category}</p>
                <p className="text-gold font-bold mb-2">₹{item.price}</p>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => {
                      setFormData(item)
                      setEditingId(item.id)
                      setShowForm(true)
                    }}
                    className="flex-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Edit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => handleDelete(item.id)}
                    className="flex-1 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MenuManager
