/**
 * Mock types for Handlebars library
 * Since the library is not installed, we provide type definitions and basic implementation
 */

export interface HelperOptions {
  fn?: (context: any) => string;
  inverse?: (context: any) => string;
  hash: Record<string, any>;
  data?: any;
}

export interface TemplateDelegate<T = any> {
  (context: T, options?: RuntimeOptions): string;
}

export interface RuntimeOptions {
  data?: any;
  helpers?: { [name: string]: HelperDelegate };
  partials?: { [name: string]: HandlebarsTemplateDelegate };
  decorators?: { [name: string]: Function };
}

export type HelperDelegate = (
  this: any,
  ...params: any[]
) => any;

export interface HandlebarsTemplateDelegate<T = any> {
  (context: T, options?: RuntimeOptions): string;
}

class HandlebarsInstance {
  compile<T = any>(input: string): TemplateDelegate<T> {
    return (context: T) => {
      // Simple string replacement mock
      let result = input;
      if (typeof context === 'object' && context !== null) {
        Object.keys(context).forEach(key => {
          const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
          result = result.replace(regex, String((context as any)[key]));
        });
      }
      return result;
    };
  }

  registerHelper(name: string, fn: HelperDelegate): void {
    // Mock implementation - helpers are not actually registered
  }

  registerPartial(name: string, partial: string | HandlebarsTemplateDelegate): void {
    // Mock implementation
  }
}

const Handlebars = new HandlebarsInstance();

export default Handlebars;
export { Handlebars };
