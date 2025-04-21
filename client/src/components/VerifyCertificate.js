import React, { useState } from 'react';
import web3Service from '../web3Service';

function VerifyCertificate() {
  const [certificateId, setCertificateId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!certificateId.trim()) {
      setError('Please enter a certificate ID.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      // First, try to get certificate details using web3Service
      const detailsResponse = await web3Service.getCertificateDetails(certificateId);
      const certificateDetails = detailsResponse.certificate;
      
      // Then verify if it's valid using web3Service
      const verifyResponse = await web3Service.verifyCertificate(certificateId);
      
      setResult({
        isValid: verifyResponse.isValid,
        details: certificateDetails
      });
    } catch (error) {
      console.error('Verification error:', error);
      // Handle error format
      if (error.details) {
        setError(error.details);
      } else {
        setError(error.message || 'An error occurred while verifying the certificate');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#383a59', color: '#f8f8f2' }} className="shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#f8f8f2' }}>Verify Certificate Authenticity</h2>
      
      {error && (
        <div className="border-l-4 p-4 mb-6" style={{ backgroundColor: '#4c347d', borderColor: '#ffb86c' }} role="alert">
          <p className="font-bold" style={{ color: '#ffb86c' }}>Information</p>
          <p style={{ color: '#f8f8f2' }}>{error === "Certificate not found" ? 
            "No certificate found with this ID. Please make sure the ID is correct." : 
            error}</p>
          <p className="mt-2 text-sm" style={{ color: '#d6bcfa' }}>Try checking the certificate ID again or contact support if you believe this is an error.</p>
        </div>
      )}
      
      <form onSubmit={handleVerify} className="space-y-4 mb-8">
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
            placeholder="Enter the certificate ID to verify"
            required
          />
        </div>
        
        <div className="mt-6">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-md ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
            style={{ backgroundColor: '#805AD5', color: '#ffffff' }}
          >
            {isLoading ? 'Verifying...' : 'Verify Certificate'}
          </button>
        </div>
      </form>
      
      {isLoading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: '#bd93f9' }}></div>
        </div>
      )}
      
      {result && (
        <div className="border rounded-lg p-6" style={{ 
          backgroundColor: '#44475a',
          borderColor: result.isValid ? '#50fa7b' : '#ff5555'
        }}>
          <div className="flex items-center justify-center mb-4">
            {result.isValid ? (
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#283442' }}>
                <svg className="w-8 h-8" style={{ color: '#50fa7b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#3d2a3a' }}>
                <svg className="w-8 h-8" style={{ color: '#ff5555' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
            )}
          </div>
          
          <h3 className="text-xl font-semibold mb-4 text-center" style={{ 
            color: result.isValid ? '#50fa7b' : '#ff5555'
          }}>
            {result.isValid 
              ? 'Certificate is Valid and Authentic' 
              : 'Certificate has been Revoked'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 p-4 rounded-lg" style={{ backgroundColor: '#282a36' }}>
            <div className="border-b md:border-b-0 md:border-r pb-2 md:pb-0 md:pr-4" style={{ borderColor: '#6272a4' }}>
              <p className="text-sm font-semibold" style={{ color: '#f8f8f2' }}>Certificate ID</p>
              <p className="text-base" style={{ color: '#f8f8f2' }}>{result.details.id}</p>
            </div>
            
            <div className="border-b pb-2" style={{ borderColor: '#6272a4' }}>
              <p className="text-sm font-semibold" style={{ color: '#f8f8f2' }}>Student Name</p>
              <p className="text-base" style={{ color: '#f8f8f2' }}>{result.details.studentName}</p>
            </div>
            
            <div className="border-b md:border-b-0 md:border-r pb-2 md:pb-0 md:pr-4" style={{ borderColor: '#6272a4' }}>
              <p className="text-sm font-semibold" style={{ color: '#f8f8f2' }}>Course Name</p>
              <p className="text-base" style={{ color: '#f8f8f2' }}>{result.details.courseName}</p>
            </div>
            
            <div>
              <p className="text-sm font-semibold" style={{ color: '#f8f8f2' }}>Issue Date</p>
              <p className="text-base" style={{ color: '#f8f8f2' }}>{result.details.issueDate}</p>
            </div>
          </div>
          
          <div className="mt-6 text-sm text-center">
            <p style={{ color: '#f8f8f2' }}>This certificate was issued by:</p>
            <p className="font-mono mt-1 break-all" style={{ color: '#f8f8f2' }}>{result.details.issuer}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default VerifyCertificate; 