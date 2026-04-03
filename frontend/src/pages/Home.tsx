import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { RootState } from '../store/index'

const Home: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth)

  const features = [
    {
      icon: '🚚',
      title: 'Fast Delivery',
      description: 'Get your favorite food delivered in 30-45 minutes',
    },
    {
      icon: '👨‍🍳',
      title: 'Authentic Recipes',
      description: 'Traditional Indian recipes made by expert chefs',
    },
    {
      icon: '💳',
      title: 'Secure Payments',
      description: 'Pay safely with Stripe, Momo, or Cash on Delivery',
    },
    {
      icon: '⭐',
      title: 'Top Quality',
      description: 'Fresh ingredients sourced daily for the best taste',
    },
  ]

  const stats = [
    { number: '15+', label: 'Menu Items' },
    { number: '1000+', label: 'Happy Customers' },
    { number: '4.8', label: 'Average Rating' },
    { number: '30min', label: 'Avg Delivery' },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 100, damping: 15 },
    },
  }

  const floatVariant = {
    initial: { y: 0 },
    animate: {
      y: [0, -15, 0],
      transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
    },
  }

  const statsVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: { delay: i * 0.15, type: 'spring', stiffness: 100 },
    }),
  }

  return (
    <div className="bg-black min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-black via-dark-coffee to-black">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, #D4A574 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -80 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, type: 'spring', stiffness: 50 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-block px-4 py-2 bg-gold bg-opacity-20 border border-gold rounded-full mb-6"
              >
                <span className="text-gold text-sm font-medium">✨ Authentic Indian Cuisine</span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-4xl md:text-6xl lg:text-7xl font-bold text-gold mb-6 leading-tight"
              >
                DWARKESH
                <br />
                <span className="text-white">FOOD</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-xl md:text-2xl text-gray-300 mb-4"
              >
                Taste the Tradition, Delivered to Your Door
              </motion.p>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-gray-400 text-lg mb-8 max-w-lg"
              >
                Experience the rich flavors of authentic Indian snacks, curries, and desserts. 
                Crafted with love, served with pride.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <motion.div
                  whileHover={{ scale: 1.08, boxShadow: '0 0 30px rgba(212, 165, 116, 0.5)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/menu"
                    className="inline-block px-8 py-4 bg-gold text-black rounded-xl font-bold text-lg hover:bg-yellow-500 transition-all shadow-lg shadow-gold/30"
                  >
                    🍽️ Order Now
                  </Link>
                </motion.div>
                <motion.a
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  href="tel:0571679999"
                  className="inline-block px-8 py-4 border-2 border-gold text-gold rounded-xl font-bold text-lg hover:bg-gold hover:text-black transition-all text-center"
                >
                  📞 0571679999
                </motion.a>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.2, type: 'spring', stiffness: 50 }}
              className="relative"
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 bg-gradient-to-br from-gold/20 to-transparent rounded-full blur-3xl"
              />
              <div className="relative text-center">
                <motion.div
                  variants={floatVariant}
                  initial="initial"
                  animate="animate"
                  className="text-[180px] md:text-[220px] leading-none"
                >
                  🍛
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-4 flex justify-center gap-4"
                >
                  <motion.span
                    animate={{ y: [0, -10, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                    className="text-6xl"
                  >
                    🥘
                  </motion.span>
                  <motion.span
                    animate={{ y: [0, -10, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                    className="text-6xl"
                  >
                    🍲
                  </motion.span>
                  <motion.span
                    animate={{ y: [0, -10, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                    className="text-6xl"
                  >
                    🫓
                  </motion.span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
      </section>

      {/* Stats Section */}
      <section className="bg-dark-coffee py-16">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                custom={index}
                variants={statsVariants}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-gold mb-2">
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    {stat.number}
                  </motion.span>
                </div>
                <div className="text-gray-300 text-sm md:text-base">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-gold text-sm font-medium uppercase tracking-wider">Why Choose Us</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-4">
              The <span className="text-gold">Dwarkesh</span> Experience
            </h2>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="w-24 h-1 bg-gradient-to-r from-gold to-coffee mx-auto mt-6 rounded-full"
            />
          </motion.div>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="bg-dark-coffee border border-coffee rounded-2xl p-8 hover:border-gold transition-all group"
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                  className="text-5xl mb-6 group-hover:scale-110 transition-transform"
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-bold text-gold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Popular Items Section */}
      <section className="py-20 bg-gradient-to-b from-black via-dark-coffee to-black">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-gold text-sm font-medium uppercase tracking-wider">Our Specialties</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-4">
              Popular <span className="text-gold">Dishes</span>
            </h2>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="w-24 h-1 bg-gradient-to-r from-gold to-coffee mx-auto mt-6 rounded-full"
            />
          </motion.div>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { name: 'Chole Batura', price: '₵120', emoji: '🫓', desc: 'Spiced chickpeas with fluffy fried bread' },
              { name: 'Mansukh Bhai', price: '₵100', emoji: '⭐', desc: 'Our signature specialty dish' },
              { name: 'Dal Batti Plate', price: '₵150', emoji: '🥘', desc: 'Traditional Rajasthani delight' },
            ].map((item, index) => (
              <motion.div
                key={item.name}
                variants={itemVariants}
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(212, 165, 116, 0.2)' }}
                className="bg-black border-2 border-coffee rounded-2xl p-8 text-center hover:border-gold transition-all"
              >
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: index * 0.5 }}
                  className="text-6xl mb-4"
                >
                  {item.emoji}
                </motion.div>
                <h3 className="text-2xl font-bold text-gold mb-2">{item.name}</h3>
                <p className="text-gray-400 mb-4">{item.desc}</p>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="text-3xl font-bold text-white"
                >
                  {item.price}
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center mt-12"
          >
            <Link
              to="/menu"
              className="inline-block px-8 py-4 bg-gold text-black rounded-xl font-bold text-lg hover:bg-yellow-500 transition-all"
            >
              View Full Menu →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-dark-coffee via-coffee to-dark-coffee rounded-3xl p-12 border border-gold"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Hungry? We're Here to Serve!
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Order now and get your favorite Indian dishes delivered hot and fresh
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={token ? "/menu" : "/register"}
                className="inline-block px-8 py-4 bg-gold text-black rounded-xl font-bold text-lg hover:bg-yellow-500 transition-all"
              >
                {token ? '🍽️ Order Food' : 'Create Account'}
              </Link>
              <a
                href="https://wa.me/233571679999"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition-all"
              >
                💬 WhatsApp Order
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 bg-dark-coffee">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6"
            >
              <div className="text-4xl mb-4">📍</div>
              <h3 className="text-gold font-bold text-lg mb-2">Location</h3>
              <p className="text-gray-400">Ghana</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-6"
            >
              <div className="text-4xl mb-4">📞</div>
              <h3 className="text-gold font-bold text-lg mb-2">Phone</h3>
              <p className="text-gray-400">0571679999</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-6"
            >
              <div className="text-4xl mb-4">🕐</div>
              <h3 className="text-gold font-bold text-lg mb-2">Hours</h3>
              <p className="text-gray-400">11:00 AM - 11:00 PM</p>
              <p className="text-gray-500 text-sm">Open Daily</p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
