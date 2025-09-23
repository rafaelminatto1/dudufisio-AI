// Mock useNavigate hook for navigation without React Router
export const useNavigate = () => {
  return (path: string) => {
    console.log('Navigation requested to:', path);
    // For now, just log the navigation request
    // This can be replaced with proper navigation logic later
  };
};