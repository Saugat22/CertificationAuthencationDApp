import React, { useState, useEffect } from 'react';
import web3Service from '../web3Service';

function ManageIssuers() {
  const [newIssuerAddress, setNewIssuerAddress] = useState('');
  const [revokeAddress, setRevokeAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentAccount, setCurrentAccount] = useState('');
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const account = await web3Service.getCurrentAccount();
        setCurrentAccount(account);
        setIsConnected(true);
        
        // Check if user is owner
        const ownerResponse = await web3Service.isOwner();
        setIsOwner(ownerResponse.isOwner);
      } catch (error) {
        console.error('MetaMask connection error:', error);
        setIsConnected(false);
        setIsOwner(false);
      }
    };
    
    checkConnection();
    
    // Set up listener for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setCurrentAccount(accounts[0]);
          setIsConnected(true);
          checkConnection();
        } else {
          setCurrentAccount('');
          setIsConnected(false);
          setIsOwner(false);
        }
      });
    }
    
    return () => {
      // Clean up listener
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  const handleAuthorize = async (e) => {
    e.preventDefault();
    
    if (!newIssuerAddress.trim()) {
      setError('Please enter an Ethereum address to authorize.');
      return;
    }
    
    if (!isConnected) {
      setError('Please connect your MetaMask wallet first.');
      return;
    }
    
    if (!isOwner) {
      setError('Only the contract owner can authorize issuers.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await web3Service.authorizeIssuer(newIssuerAddress);
      
      setSuccess({
        txHash: response.txHash,
        message: `Address ${newIssuerAddress} has been authorized to issue certificates.`
      });
      
      // Reset form
      setNewIssuerAddress('');
    } catch (error) {
      console.error('Authorize issuer error:', error);
      if (error.details) {
        setError(error.details);
      } else {
        setError(error.message || 'An error occurred while authorizing the issuer');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevoke = async (e) => {
    e.preventDefault();
    
    if (!revokeAddress.trim()) {
      setError('Please enter an Ethereum address to revoke.');
      return;
    }
    
    if (!isConnected) {
      setError('Please connect your MetaMask wallet first.');
      return;
    }
    
    if (!isOwner) {
      setError('Only the contract owner can revoke issuers.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await web3Service.revokeIssuer(revokeAddress);
      
      setSuccess({
        txHash: response.txHash,
        message: `Address ${revokeAddress} has been revoked from issuing certificates.`
      });
      
      // Reset form
      setRevokeAddress('');
    } catch (error) {
      console.error('Revoke issuer error:', error);
      if (error.details) {
        setError(error.details);
      } else {
        setError(error.message || 'An error occurred while revoking the issuer');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#383a59', color: '#f8f8f2' }} className="shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#f8f8f2' }}>Manage Certificate Issuers</h2>
      
      {!isConnected && (
        <div className="border-l-4 p-4 mb-6" style={{ backgroundColor: '#4c347d', borderColor: '#ffb86c' }} role="alert">
          <p className="font-bold" style={{ color: '#ffb86c' }}>Connect Wallet</p>
        </div>
      )}
      
      {isConnected && !isOwner && (
        <div className="border-l-4 p-4 mb-6" style={{ backgroundColor: '#4c347d', borderColor: '#ff5555' }} role="alert">
          <p className="font-bold" style={{ color: '#ff5555' }}>Admin Only</p>
        </div>
      )}
      
      {isConnected && isOwner && (
        <div className="border-l-4 p-4 mb-6" style={{ backgroundColor: '#4c347d', borderColor: '#50fa7b' }} role="alert">
          <p className="font-bold" style={{ color: '#50fa7b' }}>Admin Connected</p>
        </div>
      )}
      
      {error && (
        <div className="border-l-4 p-4 mb-6" style={{ backgroundColor: '#4c347d', borderColor: '#ff5555' }} role="alert">
          <p className="font-bold" style={{ color: '#ff5555' }}>Error</p>
          <p style={{ color: '#f8f8f2' }}>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="border-l-4 p-4 mb-6" style={{ backgroundColor: '#4c347d', borderColor: '#50fa7b' }} role="alert">
          <p className="font-bold" style={{ color: '#50fa7b' }}>Success</p>
          <p style={{ color: '#f8f8f2' }}>{success.message}</p>
          <p className="text-xs mt-2" style={{ color: '#8be9fd' }}>Transaction Hash: {success.txHash}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Authorize Issuer Form */}
        <div className="p-4 rounded-lg" style={{ backgroundColor: '#44475a' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#f8f8f2' }}>Authorize New Issuer</h3>
          <form onSubmit={handleAuthorize} className="space-y-4">
            <div>
              <label htmlFor="newIssuerAddress" className="block text-sm font-medium mb-1" style={{ color: '#d6bcfa' }}>
                Ethereum Address
              </label>
              <input
                type="text"
                id="newIssuerAddress"
                value={newIssuerAddress}
                onChange={(e) => setNewIssuerAddress(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-purple-400"
                style={{ backgroundColor: '#2a1f50', color: '#f8f8f2', borderColor: '#553c9a' }}
                placeholder="0x..."
                required
              />
            </div>
            
            <div className="mt-6">
              <button
                type="submit"
                disabled={isLoading || !isConnected || !isOwner}
                className={`w-full py-2 px-4 rounded-md ${isLoading || !isConnected || !isOwner ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
                style={{ backgroundColor: '#805AD5', color: '#ffffff' }}
              >
                {isLoading ? 'Authorizing...' : 'Authorize Issuer'}
              </button>
            </div>
          </form>
        </div>
        
        {/* Revoke Issuer Form */}
        <div className="p-4 rounded-lg" style={{ backgroundColor: '#44475a' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#f8f8f2' }}>Revoke Issuer Access</h3>
          <form onSubmit={handleRevoke} className="space-y-4">
            <div>
              <label htmlFor="revokeAddress" className="block text-sm font-medium mb-1" style={{ color: '#d6bcfa' }}>
                Ethereum Address
              </label>
              <input
                type="text"
                id="revokeAddress"
                value={revokeAddress}
                onChange={(e) => setRevokeAddress(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-purple-400"
                style={{ backgroundColor: '#2a1f50', color: '#f8f8f2', borderColor: '#553c9a' }}
                placeholder="0x..."
                required
              />
            </div>
            
            <div className="mt-6">
              <button
                type="submit"
                disabled={isLoading || !isConnected || !isOwner}
                className={`w-full py-2 px-4 rounded-md ${isLoading || !isConnected || !isOwner ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
                style={{ backgroundColor: '#ff5555', color: '#ffffff' }}
              >
                {isLoading ? 'Revoking...' : 'Revoke Issuer'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="mt-8 p-4 rounded-lg" style={{ backgroundColor: '#44475a' }}>
        <h3 className="text-lg font-semibold mb-2" style={{ color: '#f8f8f2' }}>How Issuer Management Works</h3>
        <ul className="list-disc pl-5 space-y-2" style={{ color: '#f8f8f2' }}>
          <li>Only the contract owner can authorize or revoke issuers</li>
          <li>Authorized issuers can create new certificates</li>
          <li>Each certificate records who issued it</li>
          <li>Only the owner or the original issuer can revoke a certificate</li>
          <li>The owner's address is always authorized and cannot be revoked</li>
        </ul>
      </div>
    </div>
  );
}

export default ManageIssuers; 