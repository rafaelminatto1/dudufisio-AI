import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
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
    fullWidth: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

export const Default: Story = {
  args: {
    options: sampleOptions,
    placeholder: 'Select an option',
  },
};

export const Small: Story = {
  args: {
    options: sampleOptions,
    placeholder: 'Small select',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    options: sampleOptions,
    placeholder: 'Medium select',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    options: sampleOptions,
    placeholder: 'Large select',
    size: 'lg',
  },
};

export const WithLabel: Story = {
  args: {
    options: sampleOptions,
    placeholder: 'Select a category',
    label: 'Category',
  },
};

export const WithHelpText: Story = {
  args: {
    options: sampleOptions,
    placeholder: 'Select your role',
    label: 'User Role',
    helpText: 'Choose the role that best describes your position.',
  },
};

export const Error: Story = {
  args: {
    options: sampleOptions,
    placeholder: 'Select an option',
    label: 'Required Field',
    error: true,
    helpText: 'This field is required.',
  },
};

export const Disabled: Story = {
  args: {
    options: sampleOptions,
    placeholder: 'Disabled select',
    label: 'Disabled Field',
    disabled: true,
  },
};

export const FullWidth: Story = {
  args: {
    options: sampleOptions,
    placeholder: 'Full width select',
    fullWidth: true,
    label: 'Full Width Field',
  },
};

export const ManyOptions: Story = {
  args: {
    options: [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' },
      { value: 'cherry', label: 'Cherry' },
      { value: 'date', label: 'Date' },
      { value: 'elderberry', label: 'Elderberry' },
      { value: 'fig', label: 'Fig' },
      { value: 'grape', label: 'Grape' },
      { value: 'honeydew', label: 'Honeydew' },
    ],
    placeholder: 'Select a fruit',
    label: 'Favorite Fruit',
  },
};

export const GroupedOptions: Story = {
  args: {
    options: [
      { value: 'frontend', label: 'Frontend', group: 'Development' },
      { value: 'backend', label: 'Backend', group: 'Development' },
      { value: 'fullstack', label: 'Full Stack', group: 'Development' },
      { value: 'designer', label: 'Designer', group: 'Design' },
      { value: 'ux-researcher', label: 'UX Researcher', group: 'Design' },
      { value: 'product-manager', label: 'Product Manager', group: 'Management' },
    ],
    placeholder: 'Select a role',
    label: 'Team Role',
  },
};