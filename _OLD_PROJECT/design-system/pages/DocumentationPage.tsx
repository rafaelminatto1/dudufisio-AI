import React from 'react';
import { Card } from '../components/layout/Card';
import { Button } from '../components/inputs/Button';

export const DocumentationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dudufisio Design System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A comprehensive design system for building beautiful, accessible, and consistent user interfaces
            for healthcare applications.
          </p>
        </div>

        {/* Quick Start */}
        <Card variant="elevated" className="mb-12">
          <div className="p-8">
            <h2 className="text-3xl font-bold mb-6">🚀 Quick Start</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold text-xl">1</span>
                </div>
                <h3 className="font-semibold mb-2">Installation</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Install the design system package in your project
                </p>
                <div className="bg-gray-800 text-white rounded p-3 text-xs font-mono">
                  npm install @dudufisio/design-system
                </div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 font-bold text-xl">2</span>
                </div>
                <h3 className="font-semibold mb-2">Import Components</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Import the components you need
                </p>
                <div className="bg-gray-800 text-white rounded p-3 text-xs font-mono">
                  {`import { Button, Card } from '@dudufisio/design-system';`}
                </div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 font-bold text-xl">3</span>
                </div>
                <h3 className="font-semibold mb-2">Use Components</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Start building with our components
                </p>
                <div className="bg-gray-800 text-white rounded p-3 text-xs font-mono">
                  {`<Button variant="primary">
  Get Started
</Button>`}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Design Principles */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card variant="outlined">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <span className="mr-3">🎨</span>
                Design Principles
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-3 mt-1">•</span>
                  <div>
                    <strong>Accessibility First</strong>
                    <p className="text-sm text-gray-600">Built with WCAG guidelines in mind</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-3 mt-1">•</span>
                  <div>
                    <strong>Healthcare Focused</strong>
                    <p className="text-sm text-gray-600">Tailored for medical applications</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-3 mt-1">•</span>
                  <div>
                    <strong>Modern & Clean</strong>
                    <p className="text-sm text-gray-600">Contemporary design aesthetic</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-3 mt-1">•</span>
                  <div>
                    <strong>Consistent Spacing</strong>
                    <p className="text-sm text-gray-600">Systematic spacing scale</p>
                  </div>
                </li>
              </ul>
            </div>
          </Card>

          <Card variant="outlined">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <span className="mr-3">⚡</span>
                Key Features
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 mt-1">•</span>
                  <div>
                    <strong>Theme Customization</strong>
                    <p className="text-sm text-gray-600">Dynamic theme switching</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 mt-1">•</span>
                  <div>
                    <strong>Smooth Animations</strong>
                    <p className="text-sm text-gray-600">Framer Motion integration</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 mt-1">•</span>
                  <div>
                    <strong>Responsive Design</strong>
                    <p className="text-sm text-gray-600">Mobile-first approach</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 mt-1">•</span>
                  <div>
                    <strong>TypeScript Support</strong>
                    <p className="text-sm text-gray-600">Full type safety</p>
                  </div>
                </li>
              </ul>
            </div>
          </Card>
        </div>

        {/* Component Categories */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">📚 Component Library</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card variant="elevated" interactive>
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Form Components</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Buttons, inputs, selects, and form validation
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="px-2 py-1 bg-gray-100 text-xs rounded">Button</span>
                  <span className="px-2 py-1 bg-gray-100 text-xs rounded">Input</span>
                  <span className="px-2 py-1 bg-gray-100 text-xs rounded">Select</span>
                </div>
              </div>
            </Card>

            <Card variant="elevated" interactive>
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📦</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Layout Components</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Cards, containers, grids, and layout utilities
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="px-2 py-1 bg-gray-100 text-xs rounded">Card</span>
                  <span className="px-2 py-1 bg-gray-100 text-xs rounded">Container</span>
                  <span className="px-2 py-1 bg-gray-100 text-xs rounded">Grid</span>
                </div>
              </div>
            </Card>

            <Card variant="elevated" interactive>
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🧩</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">UI Elements</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Badges, alerts, tooltips, and interactive elements
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="px-2 py-1 bg-gray-100 text-xs rounded">Badge</span>
                  <span className="px-2 py-1 bg-gray-100 text-xs rounded">Alert</span>
                  <span className="px-2 py-1 bg-gray-100 text-xs rounded">Tooltip</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">🧭 Explore the System</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              fullWidth
              onClick={() => window.location.hash = '#colors'}
            >
              🎨 Colors
            </Button>
            <Button
              variant="outline"
              fullWidth
              onClick={() => window.location.hash = '#typography'}
            >
              📝 Typography
            </Button>
            <Button
              variant="outline"
              fullWidth
              onClick={() => window.location.hash = '#spacing'}
            >
              📏 Spacing
            </Button>
            <Button
              variant="outline"
              fullWidth
              onClick={() => window.location.hash = '#animations'}
            >
              ✨ Animations
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};