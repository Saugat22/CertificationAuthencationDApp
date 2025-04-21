import React, { useState, useEffect } from 'react';
import { api } from '../api';
import web3Service from '../web3Service';

// Helper function to get current date in YYYY-MM-DD format
const getCurrentDate = () => {
  return new Date().toISOString().split('T')[0];
};

function IssueCertificate({ account }) {
  const [formData, setFormData] = useState({
    id: '',
    studentName: '',
    courseName: '',
    issueDate: getCurrentDate()
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentAccount, setCurrentAccount] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const account = await web3Service.getCurrentAccount();
        setCurrentAccount(account);
        setIsConnected(true);
        
        // Check if user is authorized to issue certificates
        const authResponse = await web3Service.isAuthorizedIssuer();
        setIsAuthorized(authResponse.isAuthorized);
        
        // Check if user is owner
        const ownerResponse = await web3Service.isOwner();
        setIsOwner(ownerResponse.isOwner);
      } catch (error) {
        console.error('MetaMask connection error:', error);
        setIsConnected(false);
        setIsAuthorized(false);
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
          // Re-check authorization when account changes
          checkConnection();
        } else {
          setCurrentAccount('');
          setIsConnected(false);
          setIsAuthorized(false);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.id.trim() || !formData.studentName.trim() || 
        !formData.courseName.trim() || !formData.issueDate.trim()) {
      setError('All fields are required');
      return;
    }
    
    if (!isConnected) {
      setError('Please connect your MetaMask wallet first.');
      return;
    }
    
    if (!isAuthorized) {
      setError('You are not authorized to issue certificates. Only the owner or authorized issuers can issue certificates.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Use web3Service instead of API - direct blockchain interaction
      const response = await web3Service.issueCertificate(
        formData.id,
        formData.studentName,
        formData.courseName,
        formData.issueDate
      );
      
      setSuccess({
        txHash: response.txHash,
        message: 'Certificate issued successfully',
        issuer: response.issuer
      });
      
      // Reset form
      setFormData({
        id: '',
        studentName: '',
        courseName: '',
        issueDate: getCurrentDate()
      });
      
    } catch (error) {
      console.error('Issue certificate error:', error);
      // Handle error
      if (error.details) {
        setError(error.details);
      } else {
        setError(error.message || 'An error occurred while issuing the certificate');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#383a59', color: '#f8f8f2' }} className="shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#f8f8f2' }}>Issue Certificate</h2>
      
      {!isConnected && (
        <div className="border-l-4 p-4 mb-6" style={{ backgroundColor: '#4c347d', borderColor: '#ffb86c' }} role="alert">
          <p className="font-bold" style={{ color: '#ffb86c' }}>Connect Wallet</p>
        </div>
      )}
      
      {isConnected && !isAuthorized && (
        <div className="border-l-4 p-4 mb-6" style={{ backgroundColor: '#4c347d', borderColor: '#ff5555' }} role="alert">
          <p className="font-bold" style={{ color: '#ff5555' }}>Not Authorized</p>
        </div>
      )}
      
      {isConnected && isAuthorized && (
        <div className="border-l-4 p-4 mb-6" style={{ backgroundColor: '#4c347d', borderColor: '#50fa7b' }} role="alert">
          <p className="font-bold" style={{ color: '#50fa7b' }}>{isOwner ? "Admin Connected" : "Authorized"}</p>
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
          <p className="text-xs" style={{ color: '#8be9fd' }}>Issuer: {success.issuer}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="id" className="block text-sm font-medium mb-1" style={{ color: '#f8f8f2' }}>
            Certificate ID
          </label>
          <input
            type="text"
            id="id"
            name="id"
            value={formData.id}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-purple-400"
            style={{ backgroundColor: '#44475a', color: '#f8f8f2', borderColor: '#6272a4' }}
            placeholder="Enter a unique certificate ID"
            required
          />
        </div>
        
        <div>
          <label htmlFor="studentName" className="block text-sm font-medium mb-1" style={{ color: '#f8f8f2' }}>
            Student Name
          </label>
          <input
            type="text"
            id="studentName"
            name="studentName"
            value={formData.studentName}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-purple-400"
            style={{ backgroundColor: '#44475a', color: '#f8f8f2', borderColor: '#6272a4' }}
            placeholder="Enter student's full name"
            required
          />
        </div>
        
        <div>
          <label htmlFor="courseName" className="block text-sm font-medium mb-1" style={{ color: '#f8f8f2' }}>
            Course Name
          </label>
          <input
            type="text"
            id="courseName"
            name="courseName"
            value={formData.courseName}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-purple-400"
            style={{ backgroundColor: '#44475a', color: '#f8f8f2', borderColor: '#6272a4' }}
            placeholder="Enter course name"
            required
          />
        </div>
        
        <div>
          <label htmlFor="issueDate" className="block text-sm font-medium mb-1" style={{ color: '#f8f8f2' }}>
            Issue Date
          </label>
          <input
            type="date"
            id="issueDate"
            name="issueDate"
            value={formData.issueDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-purple-400"
            style={{ backgroundColor: '#44475a', color: '#f8f8f2', borderColor: '#6272a4' }}
            required
          />
        </div>
        
        <div className="mt-6">
          <button
            type="submit"
            disabled={isLoading || !isConnected || !isAuthorized}
            className={`w-full py-2 px-4 rounded-md ${
              isLoading || !isConnected || !isAuthorized
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:opacity-90'
            }`}
            style={{ backgroundColor: '#805AD5', color: '#ffffff' }}
          >
            {isLoading ? 'Processing...' : 'Issue Certificate'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default IssueCertificate; 