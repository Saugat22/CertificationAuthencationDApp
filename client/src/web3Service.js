import Web3 from 'web3';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './contractConfig';

class Web3Service {
  constructor() {
    this.web3 = null;
    this.contract = null;
    this.initialized = false;
    this.contractAddress = CONTRACT_ADDRESS;
  }

  async init() {
    if (this.initialized) return true;

    try {
      // Modern dApp browsers
      if (window.ethereum) {
        this.web3 = new Web3(window.ethereum);
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log('Connected to MetaMask');
      } 
      // Legacy dApp browsers
      else if (window.web3) {
        this.web3 = new Web3(window.web3.currentProvider);
        console.log('Using legacy web3 provider');
      } 
      // No web3 provider
      else {
        throw new Error('No MetaMask detected. Please install MetaMask to use this application.');
      }

      // Create contract instance
      this.contract = new this.web3.eth.Contract(CONTRACT_ABI, this.contractAddress);
      console.log('Contract initialized at', this.contractAddress);
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing Web3:', error);
      throw error;
    }
  }

  async getCurrentAccount() {
    await this.init();
    const accounts = await this.web3.eth.getAccounts();
    return accounts[0];
  }

  // Helper method to normalize certificate ID
  _normalizeCertificateId(id) {
    // Convert to string if not already a string
    id = String(id).trim();
    
    // Log the normalized ID
    console.log(`Normalized certificate ID: ${id}`);
    
    return id;
  }

  // Check if user is the contract owner
  async isOwner() {
    try {
      await this.init();
      const account = await this.getCurrentAccount();
      const owner = await this.contract.methods.owner().call();
      
      return {
        success: true,
        isOwner: account.toLowerCase() === owner.toLowerCase()
      };
    } catch (error) {
      console.error('Error checking owner status:', error);
      throw {
        message: 'Failed to check owner status',
        details: this._extractErrorMessage(error)
      };
    }
  }

  // Check if user is authorized to issue certificates
  async isAuthorizedIssuer() {
    try {
      await this.init();
      const account = await this.getCurrentAccount();
      
      const isAuthorized = await this.contract.methods
        .isAuthorizedIssuer(account)
        .call();
      
      return {
        success: true,
        isAuthorized: isAuthorized
      };
    } catch (error) {
      console.error('Error checking issuer authorization:', error);
      throw {
        message: 'Failed to check authorization status',
        details: this._extractErrorMessage(error)
      };
    }
  }

  // Authorize an address to issue certificates (owner only)
  async authorizeIssuer(issuerAddress) {
    try {
      await this.init();
      const account = await this.getCurrentAccount();
      
      // Check if user is owner
      const owner = await this.contract.methods.owner().call();
      if (account.toLowerCase() !== owner.toLowerCase()) {
        throw new Error('Only the owner can authorize issuers');
      }
      
      const gas = await this.contract.methods
        .authorizeIssuer(issuerAddress)
        .estimateGas({ from: account });
      
      // Use helper method to safely calculate gas
      const gasValue = this._calculateGasWithBuffer(gas);
      
      const result = await this.contract.methods
        .authorizeIssuer(issuerAddress)
        .send({ 
          from: account,
          gas: gasValue
        });
      
      console.log('Issuer authorized, transaction:', result);
      return { 
        success: true, 
        txHash: result.transactionHash
      };
    } catch (error) {
      console.error('Error authorizing issuer:', error);
      throw {
        message: 'Failed to authorize issuer',
        details: this._extractErrorMessage(error)
      };
    }
  }

  // Revoke an address's authorization to issue certificates (owner only)
  async revokeIssuer(issuerAddress) {
    try {
      await this.init();
      const account = await this.getCurrentAccount();
      
      // Check if user is owner
      const owner = await this.contract.methods.owner().call();
      if (account.toLowerCase() !== owner.toLowerCase()) {
        throw new Error('Only the owner can revoke issuers');
      }
      
      const gas = await this.contract.methods
        .revokeIssuer(issuerAddress)
        .estimateGas({ from: account });
      
      // Use helper method to safely calculate gas
      const gasValue = this._calculateGasWithBuffer(gas);
      
      const result = await this.contract.methods
        .revokeIssuer(issuerAddress)
        .send({ 
          from: account,
          gas: gasValue
        });
      
      console.log('Issuer revoked, transaction:', result);
      return { 
        success: true, 
        txHash: result.transactionHash
      };
    } catch (error) {
      console.error('Error revoking issuer:', error);
      throw {
        message: 'Failed to revoke issuer',
        details: this._extractErrorMessage(error)
      };
    }
  }

  async issueCertificate(id, studentName, courseName, issueDate) {
    try {
      await this.init();
      const account = await this.getCurrentAccount();
      
      // Normalize the certificate ID
      id = this._normalizeCertificateId(id);
      
      console.log(`Issuing certificate from: ${account}`);
      console.log('Certificate data:', { id, studentName, courseName, issueDate });
      
      const gas = await this.contract.methods
        .issueCertificate(id, studentName, courseName, issueDate)
        .estimateGas({ from: account });
      
      // Use helper method to safely calculate gas
      const gasValue = this._calculateGasWithBuffer(gas);
      
      const result = await this.contract.methods
        .issueCertificate(id, studentName, courseName, issueDate)
        .send({ 
          from: account,
          gas: gasValue
        });
      
      console.log('Certificate issued, transaction:', result);
      return { 
        success: true, 
        txHash: result.transactionHash,
        issuer: account
      };
    } catch (error) {
      console.error('Error issuing certificate:', error);
      throw {
        message: 'Failed to issue certificate',
        details: this._extractErrorMessage(error)
      };
    }
  }

  async revokeCertificate(id) {
    try {
      await this.init();
      const account = await this.getCurrentAccount();
      
      // Normalize the certificate ID
      id = this._normalizeCertificateId(id);
      
      console.log(`Revoking certificate ID ${id} from: ${account}`);
      
      const gas = await this.contract.methods
        .revokeCertificate(id)
        .estimateGas({ from: account });
      
      // Use helper method to safely calculate gas
      const gasValue = this._calculateGasWithBuffer(gas);
      
      const result = await this.contract.methods
        .revokeCertificate(id)
        .send({ 
          from: account,
          gas: gasValue
        });
      
      console.log('Certificate revoked, transaction:', result);
      return { 
        success: true, 
        txHash: result.transactionHash
      };
    } catch (error) {
      console.error('Error revoking certificate:', error);
      throw {
        message: 'Failed to revoke certificate',
        details: this._extractErrorMessage(error)
      };
    }
  }

  async getCertificateDetails(id) {
    try {
      await this.init();
      
      // Normalize the certificate ID
      id = this._normalizeCertificateId(id);
      
      console.log(`Getting details for certificate ID: ${id}`);
      
      // Add retry logic for certificate retrieval
      let retries = 3;
      let rawResult;
      let lastError;
      
      while (retries > 0) {
        try {
          // Get raw result from blockchain
          rawResult = await this.contract.methods
            .getCertificateDetails(id)
            .call();
          
          // If successful, break out of retry loop
          break;
        } catch (error) {
          console.log(`Attempt failed, ${retries-1} retries left`);
          lastError = error;
          retries--;
          
          // Wait a bit before retrying
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      // If all retries failed, throw the last error
      if (!rawResult) {
        throw lastError || new Error('Failed to retrieve certificate details after multiple attempts');
      }
      
      console.log('Raw certificate details from blockchain:', rawResult);
      
      // Use array indexes instead of object properties to avoid potential BigInt issues
      const certificate = {
        id: typeof rawResult[0] === 'string' ? rawResult[0] : String(rawResult[0]),
        studentName: typeof rawResult[1] === 'string' ? rawResult[1] : String(rawResult[1]),
        courseName: typeof rawResult[2] === 'string' ? rawResult[2] : String(rawResult[2]),
        issueDate: typeof rawResult[3] === 'string' ? rawResult[3] : String(rawResult[3]),
        isValid: rawResult[4] === true || rawResult[4] === 'true' || rawResult[4] === '1' || rawResult[4] === 1,
        issuer: typeof rawResult[5] === 'string' ? rawResult[5] : String(rawResult[5])
      };
      
      console.log('Processed certificate:', certificate);
      
      return {
        success: true,
        certificate: certificate
      };
    } catch (error) {
      console.error('Error getting certificate details:', error);
      throw {
        message: 'Failed to get certificate details',
        details: 'Certificate not found or blockchain sync delay. If you just created this certificate, please wait a few seconds and try again.'
      };
    }
  }

  async verifyCertificate(id) {
    try {
      await this.init();
      
      // Normalize the certificate ID
      id = this._normalizeCertificateId(id);
      
      console.log(`Verifying certificate ID: ${id}`);
      
      // Add retry logic for certificate verification
      let retries = 3;
      let rawIsValid;
      let lastError;
      
      while (retries > 0) {
        try {
          rawIsValid = await this.contract.methods
            .verifyCertificate(id)
            .call();
          
          // If successful, break out of retry loop
          break;
        } catch (error) {
          console.log(`Verification attempt failed, ${retries-1} retries left`);
          lastError = error;
          retries--;
          
          // Wait a bit before retrying
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      // If all retries failed, throw the last error
      if (rawIsValid === undefined) {
        throw lastError || new Error('Failed to verify certificate after multiple attempts');
      }
      
      console.log(`Raw certificate validity from blockchain:`, rawIsValid);
      
      // Convert to a simple boolean
      const isValid = rawIsValid === true || 
                     rawIsValid === 'true' || 
                     rawIsValid === '1' || 
                     rawIsValid === 1;
      
      console.log(`Processed certificate validity:`, isValid);
      
      return {
        success: true,
        isValid: isValid
      };
    } catch (error) {
      console.error('Error verifying certificate:', error);
      throw {
        message: 'Failed to verify certificate',
        details: 'Certificate not found or blockchain sync delay. If you just created this certificate, please wait a few seconds and try again.'
      };
    }
  }

  _extractErrorMessage(error) {
    // Handle different error formats from Web3 and MetaMask
    if (error.message && error.message.includes('revert')) {
      // Extract the revert reason
      const match = error.message.match(/revert (.*?)(?:'|$)/);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    if (error.message && error.message.includes('User denied transaction signature')) {
      return 'Transaction was rejected in MetaMask';
    }
    
    if (error.message && error.message.includes("can't convert BigInt to number")) {
      return "Error processing large numbers. Try again or use a different browser.";
    }
    
    return error.message || 'Unknown error occurred';
  }
  
  // Helper method to safely calculate gas with buffer
  _calculateGasWithBuffer(gasEstimate, bufferPercentage = 20) {
    try {
      // Convert to string first to avoid BigInt conversion issues
      const gasString = String(gasEstimate);
      // Convert to number and add buffer
      return Math.round(Number(gasString) * (1 + bufferPercentage/100));
    } catch (error) {
      console.error('Error calculating gas with buffer:', error);
      // If conversion fails, return the original gas estimate
      return gasEstimate;
    }
  }
}

// Create and export a singleton instance
const web3Service = new Web3Service();
export default web3Service; 