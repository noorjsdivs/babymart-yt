export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Babymart E-commerce Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Modern, full-stack e-commerce solution for baby products
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            🌐 Client Website - Next.js Application
          </h2>

          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">
                🚀 Technology Stack
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Next.js 14 with TypeScript</li>
                <li>• TailwindCSS for styling</li>
                <li>• shadcn/ui components</li>
                <li>• Zustand for state management</li>
                <li>• React Hook Form + Zod validation</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">
                ✨ Features
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Shopping cart & checkout</li>
                <li>• User authentication</li>
                <li>• Product search & filtering</li>
                <li>• Order tracking</li>
                <li>• Responsive design</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            🛠️ Ready to Start Development?
          </h3>
          <p className="text-yellow-700 mb-4">
            This placeholder content explains the project structure. Remove this
            section to start building your custom e-commerce features!
          </p>
          <div className="bg-white rounded p-4 text-left">
            <p className="text-sm text-gray-600 mb-2">Quick start commands:</p>
            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
              npm run dev
            </code>
            <span className="text-gray-500 ml-2">
              - Start development server
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white rounded-lg p-4 shadow">
            <h4 className="font-medium text-gray-800">🖥️ Admin Dashboard</h4>
            <p className="text-gray-600">localhost:5173</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 shadow border-2 border-blue-200">
            <h4 className="font-medium text-blue-800">🌐 Client Website</h4>
            <p className="text-blue-600">localhost:3000 (You are here)</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <h4 className="font-medium text-gray-800">🔧 Backend API</h4>
            <p className="text-gray-600">localhost:8000</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            📖 Check README.md for complete setup instructions and documentation
          </p>
        </div>
      </div>
    </div>
  );
}
