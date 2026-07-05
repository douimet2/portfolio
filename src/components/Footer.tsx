export default function Footer() {
  return (
    <footer id="contact" className="border-t border-gray-200 bg-white py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-gray-900 font-semibold mb-2">Built in my spare time</p>
            <p className="text-gray-600 text-sm max-w-sm">
              These are side projects I've built to explore AI, machine learning, and modern web
              technologies. Each one has taught me something new.
            </p>
          </div>
          <a
            href="mailto:contact@example.com"
            className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            Get in touch
          </a>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-100 text-center text-sm text-gray-500">
          <p>© 2024 AI Portfolio. All projects available on GitHub.</p>
        </div>
      </div>
    </footer>
  );
}
