import React, { memo, ComponentType } from 'react';

/**
 * HOC para criar componentes memoizados com comparação customizada
 */
export function withMemoization<P extends object>(
  Component: ComponentType<P>,
  propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
) {
  return memo(Component, propsAreEqual);
}

/**
 * Comparador de props que ignora funções
 */
export function shallowEqualWithoutFunctions<P extends object>(
  prevProps: Readonly<P>,
  nextProps: Readonly<P>
): boolean {
  const prevKeys = Object.keys(prevProps) as Array<keyof P>;
  const nextKeys = Object.keys(nextProps) as Array<keyof P>;

  if (prevKeys.length !== nextKeys.length) {
    return false;
  }

  for (const key of prevKeys) {
    const prevValue = prevProps[key];
    const nextValue = nextProps[key];

    // Ignore function props
    if (typeof prevValue === 'function' && typeof nextValue === 'function') {
      continue;
    }

    // Compare primitive values and objects by reference
    if (prevValue !== nextValue) {
      return false;
    }
  }

  return true;
}

/**
 * Hook para memoização com TTL (time to live)
 */
export function useMemoWithExpiration<T>(
  factory: () => T,
  deps: React.DependencyList,
  ttl: number
): T {
  const [state, setState] = React.useState<{
    value: T;
    timestamp: number;
  }>(() => ({
    value: factory(),
    timestamp: Date.now(),
  }));

  React.useEffect(() => {
    const now = Date.now();
    if (now - state.timestamp > ttl) {
      setState({
        value: factory(),
        timestamp: now,
      });
    }
  }, [...deps, ttl]);

  return state.value;
}

