/**
 * Mock types for Handlebars library
 * Since the library is not installed, we provide type definitions and basic implementation
 */
class HandlebarsInstance {
    compile(input) {
        return (context) => {
            // Simple string replacement mock
            let result = input;
            if (typeof context === 'object' && context !== null) {
                Object.keys(context).forEach(key => {
                    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
                    result = result.replace(regex, String(context[key]));
                });
            }
            return result;
        };
    }
    registerHelper(name, fn) {
        // Mock implementation - helpers are not actually registered
    }
    registerPartial(name, partial) {
        // Mock implementation
    }
}
const Handlebars = new HandlebarsInstance();
export default Handlebars;
export { Handlebars };
