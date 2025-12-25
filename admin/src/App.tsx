function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            BabyJac Admin Dashboard
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Complete administrative control panel for your e-commerce platform
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            🖥️ Admin Dashboard - React + Vite Application
          </h2>

          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">
                🚀 Technology Stack
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• React 18 with TypeScript</li>
                <li>• Vite for fast development</li>
                <li>• TailwindCSS for styling</li>
                <li>• shadcn/ui components</li>
                <li>• Zustand for state management</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">
                ⚡ Admin Features
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Product management (CRUD)</li>
                <li>• Order processing</li>
                <li>• User management</li>
                <li>• Analytics & reports</li>
                <li>• Inventory tracking</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-purple-800 mb-2">
            🛠️ Ready to Build Your Admin Interface?
          </h3>
          <p className="text-purple-700 mb-4">
            This placeholder content shows the admin dashboard structure. Remove
            this section to start building your administrative features!
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
          <div className="bg-purple-50 rounded-lg p-4 shadow border-2 border-purple-200">
            <h4 className="font-medium text-purple-800">🖥️ Admin Dashboard</h4>
            <p className="text-purple-600">localhost:5173 (You are here)</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <h4 className="font-medium text-gray-800">🌐 Client Website</h4>
            <p className="text-gray-600">localhost:3000</p>
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

export default App;
