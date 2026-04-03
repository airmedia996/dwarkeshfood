const WhatsAppButton: React.FC = () => {
  const phoneNumber = '233571679999'
  const message = 'Hello! I need help with my order.'
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 left-6 w-14 h-14 bg-green-500 rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform z-40 animate-pulse"
      title="Chat on WhatsApp"
    >
      💚
    </a>
  )
}

export default WhatsAppButton