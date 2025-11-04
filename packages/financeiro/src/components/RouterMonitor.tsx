import React from 'react';
import { useRouterDebug } from '../contexts/DebugContext';

interface RouterMonitorProps {
  enabled?: boolean;
}

const RouterMonitor: React.FC<RouterMonitorProps> = ({ enabled = true }) => {
  // Use the safe router debug hook
  useRouterDebug();

  if (!enabled || process.env['NODE_ENV'] === 'production') {
    return null;
  }

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

export default RouterMonitor;