export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <span className="text-xl font-semibold text-gray-900">AI Tools</span>
          </div>
          <nav className="hidden sm:flex items-center gap-8">
            <a
              href="#"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Home
            </a>
            <a
              href="#gallery"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Projects
            </a>
            <a
              href="#contact"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Contact
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
