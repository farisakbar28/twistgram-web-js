// Placeholder page — 404 Not Found
const NotFoundPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300">404</h1>
        <p className="text-xl font-semibold text-gray-700 mt-4">Halaman tidak ditemukan</p>
        <a href="/" className="mt-6 inline-block text-blue-600 hover:underline">
          Kembali ke Beranda
        </a>
      </div>
    </div>
  );
};

export default NotFoundPage;
