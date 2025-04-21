import React, { useState } from 'react';
import web3Service from '../web3Service';

function ViewCertificate() {
  const [certificateId, setCertificateId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!certificateId.trim()) {
      setError('Please enter a certificate ID.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setCertificate(null);
    
    try {
      const response = await web3Service.getCertificateDetails(certificateId);
      setCertificate(response.certificate);
    } catch (error) {
      console.error('View certificate error:', error);
      if (error.details) {
        setError(error.details);
      } else {
        setError(error.message || 'An error occurred while retrieving the certificate');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#383a59', color: '#f8f8f2' }} className="shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#f8f8f2' }}>View Certificate</h2>
      
      {error && (
        <div className="border-l-4 p-4 mb-6" style={{ backgroundColor: '#4c347d', borderColor: '#ffb86c' }} role="alert">
          <p className="font-bold" style={{ color: '#ffb86c' }}>Information</p>
          <p style={{ color: '#f8f8f2' }}>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSearch} className="space-y-4 mb-8">
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
            placeholder="Enter the certificate ID to view"
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
            {isLoading ? 'Searching...' : 'View Certificate'}
          </button>
        </div>
      </form>
      
      {isLoading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: '#bd93f9' }}></div>
        </div>
      )}
      
      {certificate && (
        <div className="p-6 rounded-lg border" style={{ backgroundColor: '#44475a', borderColor: '#6272a4' }}>
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold" style={{ color: '#f8f8f2' }}>Certificate of Completion</h3>
            <p className="text-lg mt-2" style={{ color: '#f8f8f2' }}>This certifies that</p>
            <p className="text-xl font-bold mt-2" style={{ color: '#f8f8f2' }}>{certificate.studentName}</p>
            <p className="text-lg mt-2" style={{ color: '#f8f8f2' }}>has successfully completed</p>
            <p className="text-xl font-bold mt-2" style={{ color: '#f8f8f2' }}>{certificate.courseName}</p>
            <p className="text-lg mt-2" style={{ color: '#f8f8f2' }}>on {certificate.issueDate}</p>
          </div>
          
          <div className="grid grid-cols-1 gap-2 mt-6 p-4 rounded-lg" style={{ backgroundColor: '#282a36' }}>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#f8f8f2' }}>Certificate ID:</p>
              <p className="font-medium" style={{ color: '#f8f8f2' }}>{certificate.id}</p>
            </div>
            
            <div>
              <p className="text-sm font-semibold" style={{ color: '#f8f8f2' }}>Issuer:</p>
              <p className="text-xs font-mono break-all" style={{ color: '#f8f8f2' }}>{certificate.issuer}</p>
            </div>
            
            <div>
              <p className="text-sm font-semibold" style={{ color: '#f8f8f2' }}>Status:</p>
              <p className="font-medium" style={{ color: certificate.isValid ? '#50fa7b' : '#ff5555' }}>
                {certificate.isValid !== false ? 'Valid' : 'Revoked'}
              </p>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center">
            <button 
              onClick={() => window.print()}
              className="px-4 py-2 rounded-md hover:opacity-90"
              style={{ backgroundColor: '#805AD5', color: '#ffffff' }}
            >
              Print Certificate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewCertificate; 