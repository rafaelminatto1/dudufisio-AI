import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Design System/Introduction',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj;

export const Introduction: Story = {
  render: () => (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Dudufisio Design System</h1>
        <p className="text-xl text-gray-600">
          A comprehensive design system for building beautiful, accessible, and consistent user interfaces.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">🎨 Design Principles</h2>
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Modern and clean aesthetic</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Accessibility-first approach</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Consistent spacing and typography</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Responsive and mobile-first</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">🚀 Key Features</h2>
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              <span>Theme customization system</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              <span>Smooth animations and transitions</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              <span>Comprehensive component library</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              <span>Interactive documentation</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-8 mb-12">
        <h2 className="text-2xl font-semibold mb-6">Getting Started</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">1. Installation</h3>
            <div className="bg-gray-800 text-white rounded p-4 font-mono text-sm">
              npm install @dudufisio/design-system
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">2. Import Components</h3>
            <div className="bg-gray-800 text-white rounded p-4 font-mono text-sm">
              {`import { Button, Card, Input } from '@dudufisio/design-system';`}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">3. Use in Your App</h3>
            <div className="bg-gray-800 text-white rounded p-4 font-mono text-sm">
              {`<Button variant="primary" size="lg">
  Get Started
</Button>`}
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Explore the Components</h2>
        <p className="text-gray-600 mb-6">
          Navigate through the sidebar to explore all available components and their variations.
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="?path=/docs/components-button--docs"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            View Components
          </a>
          <a
            href="?path=/docs/design-system-colors--docs"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Design Tokens
          </a>
        </div>
      </div>
    </div>
  ),
};