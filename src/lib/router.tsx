import React, { useState, useEffect, createContext, useContext } from 'react';

interface RouterContextType {
  path: string;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextType>({
  path: window.location.pathname,
  navigate: () => {},
});

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [path, setPath] = useState<string>(() => window.location.pathname + window.location.search);

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname + window.location.search);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string) => {
    if (to !== window.location.pathname + window.location.search) {
      window.history.pushState({}, '', to);
      setPath(to);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export function useRouter() {
  return useContext(RouterContext);
}

export const Link: React.FC<{
  to: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  id?: string;
}> = ({ to, className, children, onClick, id }) => {
  const { navigate } = useRouter();

  return (
    <a
      id={id}
      href={to}
      className={className}
      onClick={(e) => {
        // Allow cmd/ctrl + click to open in new tab
        if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
          e.preventDefault();
          if (onClick) onClick();
          navigate(to);
        }
      }}
    >
      {children}
    </a>
  );
};

export function matchPath(pattern: string, currentPath: string): { matches: boolean; params: Record<string, string> } {
  // Strip search queries
  const cleanPath = currentPath.split('?')[0];
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = cleanPath.split('/').filter(Boolean);

  if (patternParts.length !== pathParts.length) {
    return { matches: false, params: {} };
  }

  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      const paramName = patternParts[i].substring(1);
      params[paramName] = pathParts[i];
    } else if (patternParts[i] !== pathParts[i]) {
      return { matches: false, params: {} };
    }
  }

  return { matches: true, params };
}
