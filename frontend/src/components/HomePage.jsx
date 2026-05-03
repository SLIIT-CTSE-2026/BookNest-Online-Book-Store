import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-800 mb-4">
            Book<span className="text-indigo-600">Nest - Viva</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">Your Online Book Store</p>
          <div className="w-24 h-1 bg-indigo-600 mx-auto"></div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 max-w-2xl mx-auto">
          <Link
            to="/login"
            className="w-full md:w-48 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-8 rounded-lg shadow-lg transition duration-300 transform hover:scale-105 text-center"
          >
            Login
          </Link>
          
          <div className="text-gray-400 font-medium">or</div>
          
          <Link
            to="/register"
            className="w-full md:w-48 bg-white hover:bg-gray-50 text-indigo-600 font-semibold py-4 px-8 rounded-lg shadow-lg border-2 border-indigo-600 transition duration-300 transform hover:scale-105 text-center"
          >
            Register
          </Link>
        </div>
        
        <div className="mt-16 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2">Vast Collection</h3>
              <p className="text-gray-600">Discover thousands of books across all genres</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Quick and reliable shipping to your doorstep</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">💎</div>
              <h3 className="text-xl font-semibold mb-2">Quality Service</h3>
              <p className="text-gray-600">Exceptional customer service and support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
