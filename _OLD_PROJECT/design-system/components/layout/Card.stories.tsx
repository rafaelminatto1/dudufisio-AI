import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'elevated', 'outlined', 'filled', 'gradient'],
    },
    interactive: {
      control: 'boolean',
    },
    padding: {
      control: { type: 'select' },
      options: ['none', 'sm', 'md', 'lg', 'xl'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Card Title</h3>
        <p className="text-gray-600">
          This is a default card with some sample content.
        </p>
      </div>
    ),
    variant: 'default',
  },
};

export const Elevated: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Elevated Card</h3>
        <p className="text-gray-600">
          This card has elevated styling with enhanced shadows.
        </p>
      </div>
    ),
    variant: 'elevated',
  },
};

export const Outlined: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Outlined Card</h3>
        <p className="text-gray-600">
          This card has a border outline for clear definition.
        </p>
      </div>
    ),
    variant: 'outlined',
  },
};

export const Filled: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Filled Card</h3>
        <p className="text-gray-600">
          This card has a filled background color.
        </p>
      </div>
    ),
    variant: 'filled',
  },
};

export const Gradient: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Gradient Card</h3>
        <p className="text-gray-600">
          This card features a beautiful gradient background.
        </p>
      </div>
    ),
    variant: 'gradient',
  },
};

export const Interactive: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Interactive Card</h3>
        <p className="text-gray-600">
          Hover over this card to see the interactive effects.
        </p>
      </div>
    ),
    interactive: true,
  },
};

export const WithCustomPadding: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Custom Padding</h3>
        <p className="text-gray-600">
          This card has extra large padding for spacious content.
        </p>
      </div>
    ),
    padding: 'xl',
  },
};

export const ComplexContent: Story = {
  args: {
    children: (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Project Card</h3>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
            Active
          </span>
        </div>
        <p className="text-gray-600">
          A comprehensive project management card with various elements.
        </p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Created: March 15, 2024</span>
          <span>5 team members</span>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
            Edit
          </button>
          <button className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50">
            View
          </button>
        </div>
      </div>
    ),
    variant: 'elevated',
  },
};