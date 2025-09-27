import { useNavigate as useRouterNavigate } from 'react-router-dom';

/**
 * Wrapper around React Router's useNavigate to keep a stable import path.
 */
export const useNavigate = () => {
  const navigate = useRouterNavigate();
  return navigate;
};
