import React, { useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';

interface RouterDebuggerProps {
  enabled?: boolean;
}

const RouterDebugger: React.FC<RouterDebuggerProps> = ({ enabled = true }) => {
  if (!enabled || process.env.NODE_ENV === 'production') {
    return null;
  }

  // Check if we're inside a Router context
  let location, navigate;
  try {
    location = ReactRouterDOM.useLocation();
    navigate = ReactRouterDOM.useNavigate();
  } catch (error) {
    console.error('RouterDebugger: Router context not available', error);
    return null;
  }

  useEffect(() => {
    console.log('🧭 Router Debug - Current location:', {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      state: location.state,
      key: location.key
    });
  }, [location]);

  useEffect(() => {
    const logRouterStatus = () => {
      console.log('🧭 Router Debug - Context Status:', {
        hasLocation: !!location,
        hasNavigate: !!navigate,
        timestamp: new Date().toISOString()
      });
    };

    logRouterStatus();
  }, [location, navigate]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        background: 'green',
        color: 'white',
        padding: '4px 8px',
        fontSize: '12px',
        zIndex: 9999,
        borderRadius: '0 0 0 4px'
      }}
    >
      Router: ✅
    </div>
  );
};

export default RouterDebugger;