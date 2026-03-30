import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../store/index'

const Home: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth)

  return (
    <div className="bg-gradient-coffee min-h-screen">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-gold mb-4">
              DWARKESH FOOD
            </h1>
            <p className="text-2xl text-gray-300 mb-6">
              Authentic Indian Cuisine Delivered Fresh
            </p>
            <p className="text-gray-400 mb-8 text-lg">
              Experience the taste of traditional Indian snacks, curries, and desserts
              prepared with love and served to your door.
            </p>
            <div className="flex gap-4">
              <Link
                to="/menu"
                className="px-8 py-3 bg-gold text-black rounded-lg font-bold hover:bg-yellow-500 transition-colors text-lg"
              >
                Order Now
              </Link>
              <a
                href="tel:0571679999"
                className="px-8 py-3 border-2 border-gold text-gold rounded-lg font-bold hover:bg-gold hover:text-black transition-colors text-lg"
              >
                Call Us
              </a>
            </div>
          </div>
          <div className="text-center">
            <div className="text-9xl">🍽️</div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-black py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-gold text-center mb-12">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🚚</div>
              <h3 className="text-xl font-bold text-white mb-2">Fast Delivery</h3>
              <p className="text-gray-400">
                Get your order delivered in 30-45 minutes with real-time tracking
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">👨‍🍳</div>
              <h3 className="text-xl font-bold text-white mb-2">Authentic Recipes</h3>
              <p className="text-gray-400">
                Traditional Indian recipes prepared by expert chefs
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">💳</div>
              <h3 className="text-xl font-bold text-white mb-2">Multiple Payment Options</h3>
              <p className="text-gray-400">
                Pay with Stripe, Momo, or Cash on Delivery
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-dark-coffee border border-coffee rounded-lg p-8">
          <h2 className="text-3xl font-bold text-gold mb-6">Get In Touch</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-white font-bold mb-4">📞 Phone</h3>
              <p className="text-gray-400 mb-2">0571679999</p>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">💬 WhatsApp</h3>
              <p className="text-gray-400 mb-2">0571679999</p>
            </div>
          </div>
          <div className="mt-6">
            <h3 className="text-white font-bold mb-4">🕐 Hours</h3>
            <p className="text-gray-400">Monday - Sunday: 11:00 AM - 11:00 PM</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
