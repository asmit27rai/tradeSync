"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Extend the Window interface to include the ethereum property
declare global {
  interface Window {
    ethereum: any;
  }
}
import { ethers } from 'ethers';

interface WalletContextType {
  isConnected: boolean;
  account: string | null;
  provider: ethers.providers.Web3Provider | null;
  balance: string;
  chainId: number | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const WalletContext = createContext<WalletContextType>({} as WalletContextType);

export const useWallet = () => useContext(WalletContext);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [balance, setBalance] = useState('0');
  const [chainId, setChainId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize wallet connection on mount
  useEffect(() => {
    checkConnection();
    // Listen for network changes
    if (window.ethereum) {
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  // Check if wallet is already connected
  const checkConnection = async () => {
    try {
      if (window.ethereum) {
        const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await ethProvider.listAccounts();
        
        if (accounts.length > 0) {
          const network = await ethProvider.getNetwork();
          const accountBalance = await ethProvider.getBalance(accounts[0]);
          
          setProvider(ethProvider);
          setAccount(accounts[0]);
          setIsConnected(true);
          setChainId(network.chainId);
          setBalance(ethers.utils.formatEther(accountBalance));
        }
      }
    } catch (err) {
      console.error('Error checking connection:', err);
      setError('Error checking wallet connection');
    }
  };

  // Handle chain/network changes
  const handleChainChanged = (newChainId: string) => {
    window.location.reload();
  };

  // Handle account changes
  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
      disconnect();
    } else if (accounts[0] !== account) {
      setAccount(accounts[0]);
      updateBalance(accounts[0]);
    }
  };

  // Update account balance
  const updateBalance = async (address: string) => {
    if (provider) {
      try {
        const balance = await provider.getBalance(address);
        setBalance(ethers.utils.formatEther(balance));
      } catch (err) {
        console.error('Error updating balance:', err);
        setError('Error updating balance');
      }
    }
  };

  // Connect wallet
  const connect = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not installed');
      }

      const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      
      const network = await ethProvider.getNetwork();
      const accountBalance = await ethProvider.getBalance(accounts[0]);

      setProvider(ethProvider);
      setAccount(accounts[0]);
      setIsConnected(true);
      setChainId(network.chainId);
      setBalance(ethers.utils.formatEther(accountBalance));
    } catch (err: any) {
      console.error('Error connecting wallet:', err);
      setError(err.message || 'Error connecting wallet');
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect wallet
  const disconnect = async () => {
    setIsLoading(true);
    setError(null);

    try {
      setProvider(null);
      setAccount(null);
      setIsConnected(false);
      setChainId(null);
      setBalance('0');
    } catch (err: any) {
      console.error('Error disconnecting wallet:', err);
      setError(err.message || 'Error disconnecting wallet');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        account,
        provider,
        balance,
        chainId,
        connect,
        disconnect,
        isLoading,
        error,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};