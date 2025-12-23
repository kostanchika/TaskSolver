import React, { createContext, useContext, ReactNode } from "react";
import { useSignalR } from "../hooks/useSignalR";

interface SignalRContextType {
  isConnected: boolean;
  isConnecting: boolean;
}

const SignalRContext = createContext<SignalRContextType | undefined>(undefined);

interface SignalRProviderProps {
  children: ReactNode;
  onSolutionCompleted?: (solutionId: string) => void;
}

export const SignalRProvider: React.FC<SignalRProviderProps> = ({
  children,
  onSolutionCompleted,
}) => {
  const hubUrl = `${import.meta.env.VITE_API_URL}/solutionsHub`;

  const { isConnected, isConnecting } = useSignalR({
    url: hubUrl,
    onSolutionCompleted,
  });

  return (
    <SignalRContext.Provider value={{ isConnected, isConnecting }}>
      {children}
    </SignalRContext.Provider>
  );
};

export const useSignalRContext = () => {
  const context = useContext(SignalRContext);
  if (context === undefined) {
    throw new Error("useSignalRContext must be used within a SignalRProvider");
  }
  return context;
};
