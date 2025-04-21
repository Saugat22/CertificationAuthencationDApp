import web3Service from './web3Service';

// This file now acts as a compatibility layer for old API-based code
// It redirects all calls to web3Service for direct blockchain interaction

// Helper function to extract useful error message
const extractErrorMessage = (error) => {
  if (error.details) {
    return error.details;
  }
  return error.message || 'Unknown error occurred';
};

export const api = {
  // Issue a new certificate
  issueCertificate: async (certificateData) => {
    try {
      const response = await web3Service.issueCertificate(
        certificateData.id,
        certificateData.studentName,
        certificateData.courseName,
        certificateData.issueDate
      );
      return {
        success: true,
        message: 'Certificate issued successfully',
        txHash: response.txHash
      };
    } catch (error) {
      console.error('Error issuing certificate:', error);
      throw {
        message: 'Failed to issue certificate',
        details: extractErrorMessage(error)
      };
    }
  },
  
  // Verify a certificate by ID
  verifyCertificate: async (id) => {
    try {
      const response = await web3Service.verifyCertificate(id);
      return response;
    } catch (error) {
      console.error('Error verifying certificate:', error);
      throw {
        message: 'Failed to verify certificate',
        details: extractErrorMessage(error)
      };
    }
  },
  
  // Get certificate details by ID
  getCertificateDetails: async (id) => {
    try {
      const response = await web3Service.getCertificateDetails(id);
      return response;
    } catch (error) {
      console.error('Error getting certificate details:', error);
      throw {
        message: 'Failed to get certificate details',
        details: extractErrorMessage(error)
      };
    }
  },
  
  // Revoke a certificate by ID
  revokeCertificate: async (id, userAddress) => {
    try {
      const response = await web3Service.revokeCertificate(id);
      return {
        success: true,
        message: 'Certificate revoked successfully',
        txHash: response.txHash
      };
    } catch (error) {
      console.error('Error revoking certificate:', error);
      throw {
        message: 'Failed to revoke certificate',
        details: extractErrorMessage(error)
      };
    }
  },
  
  // Check health - simplified for client-only operation
  checkHealth: async () => {
    try {
      // Check if web3 is connected
      await web3Service.init();
      return { 
        status: 'OK', 
        blockchain: 'Connected'
      };
    } catch (error) {
      console.error('Error checking blockchain connection:', error);
      throw {
        message: 'Failed to connect to blockchain',
        details: extractErrorMessage(error)
      };
    }
  }
}; 