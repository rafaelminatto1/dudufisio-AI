import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: 'boolean',
    },
    error: {
      control: 'boolean',
    },
    success: {
      control: 'boolean',
    },
    fullWidth: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {
  args: {
    placeholder: 'Enter your name',
    type: 'text',
  },
};

export const Email: Story = {
  args: {
    placeholder: 'Enter your email',
    type: 'email',
  },
};

export const Password: Story = {
  args: {
    placeholder: 'Enter your password',
    type: 'password',
  },
};

export const Number: Story = {
  args: {
    placeholder: 'Enter a number',
    type: 'number',
  },
};

export const Search: Story = {
  args: {
    placeholder: 'Search...',
    type: 'search',
  },
};

export const Small: Story = {
  args: {
    placeholder: 'Small input',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    placeholder: 'Medium input',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    placeholder: 'Large input',
    size: 'lg',
  },
};

export const WithLabel: Story = {
  args: {
    placeholder: 'Enter your name',
    label: 'Full Name',
  },
};

export const WithHelpText: Story = {
  args: {
    placeholder: 'Enter your email',
    label: 'Email Address',
    helpText: 'We\'ll never share your email with anyone else.',
  },
};

export const Error: Story = {
  args: {
    placeholder: 'Enter your email',
    label: 'Email Address',
    error: true,
    helpText: 'Please enter a valid email address.',
  },
};

export const Success: Story = {
  args: {
    placeholder: 'Enter your username',
    label: 'Username',
    success: true,
    helpText: 'Username is available!',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    label: 'Disabled Field',
    disabled: true,
    value: 'This input is disabled',
  },
};

export const FullWidth: Story = {
  args: {
    placeholder: 'Full width input',
    fullWidth: true,
    label: 'Full Width Field',
  },
};

export const WithIcon: Story = {
  args: {
    placeholder: 'Search...',
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
  },
};