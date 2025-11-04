import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Design System/Colors',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj;

const ColorPalette = ({ name, colors }: { name: string; colors: Record<string, string> }) => (
  <div className="mb-8">
    <h3 className="text-xl font-semibold mb-4">{name}</h3>
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Object.entries(colors).map(([key, value]) => (
        <div key={key} className="text-center">
          <div
            className="w-full h-20 rounded-lg shadow-sm mb-2"
            style={{ backgroundColor: value }}
          />
          <div className="text-sm font-medium">{key}</div>
          <div className="text-xs text-gray-500">{value}</div>
        </div>
      ))}
    </div>
  </div>
);

export const Colors: Story = {
  render: () => (
    <div className="max-w-6xl mx-auto p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Color System</h1>
        <p className="text-xl text-gray-600">
          A comprehensive color palette for consistent and accessible design.
        </p>
      </div>

      <ColorPalette
        name="Primary Colors"
        colors={{
          'Primary-50': '#eff6ff',
          'Primary-100': '#dbeafe',
          'Primary-200': '#bfdbfe',
          'Primary-300': '#93c5fd',
          'Primary-400': '#60a5fa',
          'Primary-500': '#3b82f6',
          'Primary-600': '#2563eb',
          'Primary-700': '#1d4ed8',
          'Primary-800': '#1e40af',
          'Primary-900': '#1e3a8a',
        }}
      />

      <ColorPalette
        name="Secondary Colors"
        colors={{
          'Secondary-50': '#f0fdfa',
          'Secondary-100': '#ccfbf1',
          'Secondary-200': '#99f6e4',
          'Secondary-300': '#5eead4',
          'Secondary-400': '#2dd4bf',
          'Secondary-500': '#14b8a6',
          'Secondary-600': '#0d9488',
          'Secondary-700': '#0f766e',
          'Secondary-800': '#115e59',
          'Secondary-900': '#134e4a',
        }}
      />

      <ColorPalette
        name="Neutral Colors"
        colors={{
          'Gray-50': '#f9fafb',
          'Gray-100': '#f3f4f6',
          'Gray-200': '#e5e7eb',
          'Gray-300': '#d1d5db',
          'Gray-400': '#9ca3af',
          'Gray-500': '#6b7280',
          'Gray-600': '#4b5563',
          'Gray-700': '#374151',
          'Gray-800': '#1f2937',
          'Gray-900': '#111827',
        }}
      />

      <ColorPalette
        name="Semantic Colors"
        colors={{
          'Success': '#10b981',
          'Warning': '#f59e0b',
          'Error': '#ef4444',
          'Info': '#3b82f6',
          'Success-Light': '#d1fae5',
          'Warning-Light': '#fef3c7',
          'Error-Light': '#fee2e2',
          'Info-Light': '#dbeafe',
        }}
      />

      <div className="bg-gray-50 rounded-lg p-8 mt-12">
        <h2 className="text-2xl font-semibold mb-4">Color Usage Guidelines</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Primary Colors</h3>
            <p className="text-gray-600 text-sm">
              Use for main actions, brand elements, and key interactive elements.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Secondary Colors</h3>
            <p className="text-gray-600 text-sm">
              Use for secondary actions, accents, and complementary elements.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Neutral Colors</h3>
            <p className="text-gray-600 text-sm">
              Use for text, backgrounds, borders, and non-interactive elements.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Semantic Colors</h3>
            <p className="text-gray-600 text-sm">
              Use for status indicators, alerts, and feedback messages.
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
};