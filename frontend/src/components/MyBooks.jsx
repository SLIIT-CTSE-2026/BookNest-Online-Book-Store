import { useEffect, useState } from 'react';
import { productAPI } from '../utils/api';

export default function MyBooks({ sellerId, onEdit }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, [sellerId]);

  useEffect(() => {
    if (!selectedBook) return;
    const handleEscape = (e) => {
      if (e.key === 'Escape') setSelectedBook(null);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedBook]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getProductsBySeller(sellerId);
      setBooks(response.data.products || []);
    } catch (err) {
      setError('Failed to fetch your books. Please try again.');
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) {
      return;
    }

    try {
      await productAPI.deleteProduct(bookId);
      setBooks(books.filter(book => book._id !== bookId));
    } catch (err) {
      alert('Failed to delete book. Please try again.');
      console.error('Error deleting book:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-md">
        {error}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Books Yet</h3>
        <p className="text-gray-600">You haven't added any books yet. Click "Add Book" to get started!</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">My Books ({books.length})</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Book
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {books.map((book) => (
              <tr key={book._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="h-12 w-10 object-cover rounded"
                      />
                    ) : (
                      <div className="h-12 w-10 bg-gray-200 rounded flex items-center justify-center text-2xl">
                        📖
                      </div>
                    )}
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{book.title}</div>
                      <div className="text-sm text-gray-500">{book.author}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">${book.price.toFixed(2)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    book.stock > 10 ? 'bg-green-100 text-green-800' :
                    book.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {book.stock} in stock
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {book.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => setSelectedBook(book)}
                    className="mr-4 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium transition-colors"
                  >
                    View details
                  </button>
                  <button
                    onClick={() => handleDelete(book._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedBook && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedBook(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="book-detail-title"
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with cover + title */}
            <div className="relative bg-gradient-to-br from-slate-50 to-indigo-50/30 border-b border-slate-200">
              <button
                onClick={() => setSelectedBook(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex flex-col sm:flex-row gap-4 p-6">
                <div className="shrink-0 mx-auto sm:mx-0">
                  {selectedBook.coverImage ? (
                    <img
                      src={selectedBook.coverImage}
                      alt={selectedBook.title}
                      className="w-36 h-52 sm:w-40 sm:h-56 object-cover rounded-xl shadow-lg ring-1 ring-black/5"
                    />
                  ) : (
                    <div className="w-36 h-52 sm:w-40 sm:h-56 rounded-xl bg-gradient-to-br from-indigo-100 to-slate-200 flex items-center justify-center text-5xl shadow-inner">
                      📖
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <h2 id="book-detail-title" className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight pr-10">
                    {selectedBook.title}
                  </h2>
                  <p className="mt-1 text-indigo-600 font-medium">{selectedBook.author}</p>
                  <p className="mt-2 text-sm text-slate-500">{selectedBook.category}</p>
                  <div className="mt-4 flex flex-wrap gap-3 justify-center sm:justify-start">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-800">
                      ${selectedBook.price?.toFixed(2)}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedBook.stock > 10 ? 'bg-emerald-100 text-emerald-800' :
                      selectedBook.stock > 0 ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedBook.stock} in stock
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Details grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedBook.isbn && (
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-0.5">ISBN</p>
                      <p className="text-slate-900 font-medium">{selectedBook.isbn}</p>
                    </div>
                  )}
                  {selectedBook.publisher && (
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-0.5">Publisher</p>
                      <p className="text-slate-900 font-medium">{selectedBook.publisher}</p>
                    </div>
                  )}
                  {selectedBook.publicationYear && (
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-0.5">Year</p>
                      <p className="text-slate-900 font-medium">{selectedBook.publicationYear}</p>
                    </div>
                  )}
                  {selectedBook.language && (
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-0.5">Language</p>
                      <p className="text-slate-900 font-medium">{selectedBook.language}</p>
                    </div>
                  )}
                  {selectedBook.pages && (
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-0.5">Pages</p>
                      <p className="text-slate-900 font-medium">{selectedBook.pages}</p>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Description</p>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                    {selectedBook.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50/50 flex flex-wrap gap-3 justify-end">
              <button
                onClick={() => setSelectedBook(null)}
                className="px-4 py-2.5 rounded-xl text-slate-700 font-medium bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              {onEdit && (
                <button
                  onClick={() => {
                    setSelectedBook(null);
                    onEdit(selectedBook);
                  }}
                  className="px-4 py-2.5 rounded-xl font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                >
                  Edit book
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
