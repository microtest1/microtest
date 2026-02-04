import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DemoContextType {
  isDemoMode: boolean;
  setIsDemoMode: (value: boolean) => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);

  return (
    <DemoContext.Provider value={{ isDemoMode, setIsDemoMode }}>
      {children}
      {isDemoMode && (
        <div className="fixed top-20 right-4 z-50 px-3 py-1.5 rounded-full bg-warning text-warning-foreground text-xs font-semibold uppercase tracking-wider shadow-lg">
          Demo Mode
        </div>
      )}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};
