import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import IssueCertificate from './components/IssueCertificate';
import VerifyCertificate from './components/VerifyCertificate';
import ViewCertificate from './components/ViewCertificate';
import RevokeCertificate from './components/RevokeCertificate';
import ManageIssuers from './components/ManageIssuers';

function App() {
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);
  const [currentAccount, setCurrentAccount] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  const connectToMetaMask = async () => {
    try {
      // Check if MetaMask is installed
      if (window.ethereum) {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Set current account
        setCurrentAccount(accounts[0]);
        setIsMetaMaskConnected(true);
      } else {
        alert('MetaMask is not installed. Please install it to use this app.');
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
    }
  };
  
  // Handle account changes and disconnections
  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      setCurrentAccount('');
      setIsMetaMaskConnected(false);
      console.log('MetaMask wallet disconnected');
    } else {
      // User switched accounts
      setCurrentAccount(accounts[0]);
      console.log('MetaMask account changed to:', accounts[0]);
    }
  };

  useEffect(() => {
    // Check if MetaMask is already connected
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setCurrentAccount(accounts[0]);
            setIsMetaMaskConnected(true);
          }
          
          // Set up event listeners for account changes and disconnections
          window.ethereum.on('accountsChanged', handleAccountsChanged);
          
          // Clean up function
          return () => {
            if (window.ethereum.removeListener) {
              window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            }
          };
        } catch (error) {
          console.error('Error checking MetaMask connection:', error);
        }
      }
    };
    
    checkConnection();
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#282a36', color: '#f8f8f2' }}>
      <header style={{ backgroundColor: '#44475a', color: '#f8f8f2' }} className="shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#ff79c6' }}>CN6035 2425 (T2) Mobile and Distributed Systems (OC)</h1>
            <h2 className="text-xl font-semibold" style={{ color: '#8be9fd' }}>Certificate Authentication DApp</h2>
          </div>
          <div className="flex justify-center">
            {isMetaMaskConnected ? (
              <div className="flex items-center">
                <span className="mr-2 rounded-full h-3 w-3" style={{ backgroundColor: '#50fa7b' }}></span>
                <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#44475a', color: '#8be9fd' }}>
                  {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}
                </span>
              </div>
            ) : (
              <button 
                onClick={connectToMetaMask}
                className="px-4 py-2 rounded hover:opacity-90"
                style={{ backgroundColor: '#6272a4', color: '#f8f8f2' }}
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </header>

      <nav style={{ backgroundColor: '#44475a', color: '#f8f8f2' }} className="relative">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center md:hidden">
            <div className="text-lg font-bold" style={{ color: '#8be9fd' }}>Menu</div>
            <button 
              onClick={toggleMenu} 
              className="hamburger-btn p-2"
              style={{
                position: 'relative',
                width: '40px',
                height: '30px',
              }}
            >
              <div 
                style={{
                  position: 'absolute',
                  width: '30px',
                  height: '4px',
                  background: '#bd93f9',
                  borderRadius: '3px',
                  transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none',
                  top: menuOpen ? '10px' : '6px',
                  transition: 'all 0.3s ease',
                  boxShadow: menuOpen ? 'none' : '0 2px 3px rgba(0,0,0,0.5)'
                }}
              ></div>
              <div 
                style={{
                  position: 'absolute',
                  width: '30px',
                  height: '4px',
                  background: '#bd93f9',
                  borderRadius: '3px',
                  opacity: menuOpen ? 0 : 1,
                  top: '14px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 3px rgba(0,0,0,0.5)'
                }}
              ></div>
              <div 
                style={{
                  position: 'absolute',
                  width: '30px',
                  height: '4px',
                  background: '#bd93f9',
                  borderRadius: '3px',
                  transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none',
                  top: menuOpen ? '18px' : '22px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 3px rgba(0,0,0,0.5)'
                }}
              ></div>
            </button>
          </div>
          
          <ul className={`${menuOpen ? 'block' : 'hidden'} md:flex md:space-x-6 md:block space-y-2 md:space-y-0 py-2`}>
            <li>
              <Link to="/" className="block py-1" style={{ color: '#f8f8f2', transition: 'all 0.2s ease' }} onMouseOver={(e) => e.target.style.color = '#ff79c6'} onMouseOut={(e) => e.target.style.color = '#f8f8f2'}>Home</Link>
            </li>
            <li>
              <Link to="/issue" className="block py-1" style={{ color: '#f8f8f2', transition: 'all 0.2s ease' }} onMouseOver={(e) => e.target.style.color = '#ff79c6'} onMouseOut={(e) => e.target.style.color = '#f8f8f2'}>Issue Certificate</Link>
            </li>
            <li>
              <Link to="/verify" className="block py-1" style={{ color: '#f8f8f2', transition: 'all 0.2s ease' }} onMouseOver={(e) => e.target.style.color = '#ff79c6'} onMouseOut={(e) => e.target.style.color = '#f8f8f2'}>Verify Certificate</Link>
            </li>
            <li>
              <Link to="/view" className="block py-1" style={{ color: '#f8f8f2', transition: 'all 0.2s ease' }} onMouseOver={(e) => e.target.style.color = '#ff79c6'} onMouseOut={(e) => e.target.style.color = '#f8f8f2'}>View Certificate</Link>
            </li>
            <li>
              <Link to="/revoke" className="block py-1" style={{ color: '#f8f8f2', transition: 'all 0.2s ease' }} onMouseOver={(e) => e.target.style.color = '#ff79c6'} onMouseOut={(e) => e.target.style.color = '#f8f8f2'}>Revoke Certificate</Link>
            </li>
            <li>
              <Link to="/manage" className="block py-1" style={{ color: '#f8f8f2', transition: 'all 0.2s ease' }} onMouseOver={(e) => e.target.style.color = '#ff79c6'} onMouseOut={(e) => e.target.style.color = '#f8f8f2'}>Manage Issuers</Link>
            </li>
          </ul>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {!isMetaMaskConnected && (
          <div className="border-l-4 p-4 mb-8" role="alert" style={{ backgroundColor: '#383a59', borderColor: '#ffb86c' }}>
            <p className="font-bold" style={{ color: '#ffb86c' }}>Wallet Not Connected</p>
            <p style={{ color: '#f8f8f2' }}>Please connect your wallet to use this application.</p>
          </div>
        )}

        <Routes>
          <Route path="/" element={
            <div className="shadow-md rounded-lg p-8" style={{ backgroundColor: '#383a59' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#f8f8f2' }}>Welcome to Certificate Authentication DApp</h2>
              <p className="mb-4" style={{ color: '#f8f8f2' }}>This decentralized application allows you to:</p>
              <ul className="list-disc pl-8 mb-6" style={{ color: '#f8f8f2' }}>
                <li>Issue new digital certificates on the blockchain</li>
                <li>Verify the authenticity of certificates</li>
                <li>View certificate details</li>
                <li>Revoke certificates when necessary</li>
                <li>Manage who can issue certificates (owner only)</li>
              </ul>
              <div className="p-4 rounded" style={{ backgroundColor: '#44475a' }}>
                <h3 className="font-bold mb-2" style={{ color: '#f8f8f2' }}>Role-Based Access Control</h3>
                <p style={{ color: '#f8f8f2' }}>Only the contract owner or authorized issuers can create certificates. Only the original issuer or the owner can revoke a certificate.</p>
              </div>
            </div>
          } />
          <Route path="/issue" element={<IssueCertificate account={currentAccount} />} />
          <Route path="/verify" element={<VerifyCertificate />} />
          <Route path="/view" element={<ViewCertificate />} />
          <Route path="/revoke" element={<RevokeCertificate account={currentAccount} />} />
          <Route path="/manage" element={<ManageIssuers />} />
        </Routes>
      </main>
    </div>
  );
}

export default App; 