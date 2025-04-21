import React, { useState, useEffect } from 'react';
import web3Service from '../web3Service';

function RevokeCertificate() {
  const [certificateId, setCertificateId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentAccount, setCurrentAccount] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [certificateDetails, setCertificateDetails] = useState(null);

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

  const checkCertificateDetails = async () => {
    if (!certificateId.trim()) {
      setError('Please enter a certificate ID.');
      return false;
    }
    
    if (!isOwner) {
      setError('No permission to revoke');
      return false;
    }
    
    try {
      const response = await web3Service.getCertificateDetails(certificateId);
      const certificate = response.certificate;
      setCertificateDetails(certificate);
      return true;
    } catch (error) {
      console.error('Error checking certificate:', error);
      if (error.details) {
        setError(error.details);
      } else {
        setError(error.message || 'Certificate not found');
      }
      return false;
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      setError('Wallet not connected');
      return;
    }
    
    setError(null);
    
    // Check certificate and authorization
    const canProceed = await checkCertificateDetails();
    if (canProceed) {
      setShowConfirm(true);
    }
  };

  const handleRevoke = async () => {
    if (!isConnected) {
      setError('Wallet not connected');
      setShowConfirm(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResult(null);
    setShowConfirm(false);
    
    try {
      // Use web3Service instead of API - direct blockchain interaction
      const response = await web3Service.revokeCertificate(certificateId);
      
      setResult({
        success: true,
        message: 'Certificate revoked',
        txHash: response.txHash
      });
      
      setCertificateId('');
      setCertificateDetails(null);
    } catch (error) {
      console.error('Revoke error:', error);
      // Handle error
      if (error.details) {
        setError(error.details);
      } else {
        setError(error.message || 'Revocation failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <div style={{ backgroundColor: '#383a59', color: '#f8f8f2' }} className="shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#f8f8f2' }}>Revoke Certificate</h2>
      
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
      
      {result && result.success && (
        <div className="border-l-4 p-4 mb-6" style={{ backgroundColor: '#4c347d', borderColor: '#50fa7b' }} role="alert">
          <p className="font-bold" style={{ color: '#50fa7b' }}>Success</p>
          <p style={{ color: '#f8f8f2' }}>{result.message}</p>
        </div>
      )}
      
      {showConfirm ? (
        <div className="p-6 rounded-lg border" style={{ backgroundColor: '#44475a', borderColor: '#6272a4' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#f8f8f2' }}>Confirm Revocation</h3>
          {certificateDetails && (
            <div className="mb-4 p-4 rounded-lg border" style={{ backgroundColor: '#282a36', borderColor: '#6272a4' }}>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#f8f8f2' }}>Certificate ID:</p>
                  <p className="font-medium" style={{ color: '#f8f8f2' }}>{certificateDetails.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#f8f8f2' }}>Student Name:</p>
                  <p className="font-medium" style={{ color: '#f8f8f2' }}>{certificateDetails.studentName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#f8f8f2' }}>Course:</p>
                  <p className="font-medium" style={{ color: '#f8f8f2' }}>{certificateDetails.courseName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#f8f8f2' }}>Issuer:</p>
                  <p className="text-xs font-mono" style={{ color: '#f8f8f2' }}>{certificateDetails.issuer}</p>
                </div>
              </div>
            </div>
          )}
          <p className="mb-6" style={{ color: '#f8f8f2' }}>
            Revoke this certificate?
            <br />
            <span className="text-sm font-bold" style={{ color: '#ff5555' }}>Cannot be undone</span>
          </p>
          
          <div className="flex space-x-4">
            <button
              onClick={handleRevoke}
              disabled={isLoading}
              className={`px-4 py-2 rounded-md ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
              style={{ backgroundColor: '#ff5555', color: '#f8f8f2' }}
            >
              {isLoading ? 'Processing...' : 'Revoke'}
            </button>
            
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-md hover:opacity-90"
              style={{ backgroundColor: '#6b46c1', color: '#f8f8f2' }}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleConfirm} className="space-y-4">
          <div>
            <label htmlFor="certificateId" className="block text-sm font-medium mb-1" style={{ color: '#f8f8f2' }}>
              Certificate ID
            </label>
            <input
              type="text"
              id="certificateId"
              value={certificateId}
              onChange={(e) => setCertificateId(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-purple-400"
              style={{ backgroundColor: '#44475a', color: '#f8f8f2', borderColor: '#6272a4' }}
              placeholder="Enter the certificate ID to revoke"
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
              {isLoading ? 'Processing...' : 'Check Certificate'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default RevokeCertificate; 