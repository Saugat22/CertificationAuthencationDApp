// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title CertificationAuthentication
 * @dev Contract for handling certification authentication with role-based access control
 */
contract CertificationAuthentication {
    address public owner;
    
    // Mapping of addresses that are authorized to issue certificates
    mapping(address => bool) public authorizedIssuers;
    
    // Structure for certificate data
    struct Certificate {
        string id;
        string studentName;
        string courseName;
        string issueDate;
        bool isValid;
        address issuer;
    }
    
    // Mapping from certificate ID to Certificate
    mapping(string => Certificate) public certificates;
    
    // Events
    event CertificateIssued(string id, string studentName, string courseName, string issueDate, address issuer);
    event CertificateRevoked(string id);
    event IssuerAuthorized(address issuer);
    event IssuerRevoked(address issuer);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }
    
    modifier onlyAuthorized() {
        require(msg.sender == owner || authorizedIssuers[msg.sender], "Not authorized to issue certificates");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        // Owner is automatically an authorized issuer
        authorizedIssuers[msg.sender] = true;
    }
    
    /**
     * @dev Authorize an address to issue certificates
     * @param issuer Address to authorize
     */
    function authorizeIssuer(address issuer) public onlyOwner {
        authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer);
    }
    
    /**
     * @dev Revoke an address's authorization to issue certificates
     * @param issuer Address to revoke authorization from
     */
    function revokeIssuer(address issuer) public onlyOwner {
        require(issuer != owner, "Cannot revoke owner's issuer rights");
        authorizedIssuers[issuer] = false;
        emit IssuerRevoked(issuer);
    }
    
    /**
     * @dev Check if an address is authorized to issue certificates
     * @param issuer Address to check
     * @return bool True if authorized, false otherwise
     */
    function isAuthorizedIssuer(address issuer) public view returns (bool) {
        return (issuer == owner || authorizedIssuers[issuer]);
    }
    
    /**
     * @dev Issue a new certificate - only authorized issuers can do this
     * @param id Certificate unique ID
     * @param studentName Name of the student
     * @param courseName Name of the course
     * @param issueDate Date when certificate was issued
     */
    function issueCertificate(
        string memory id,
        string memory studentName,
        string memory courseName,
        string memory issueDate
    ) public onlyAuthorized {
        require(bytes(certificates[id].id).length == 0, "Certificate ID already exists");
        
        certificates[id] = Certificate({
            id: id,
            studentName: studentName,
            courseName: courseName,
            issueDate: issueDate,
            isValid: true,
            issuer: msg.sender
        });
        
        emit CertificateIssued(id, studentName, courseName, issueDate, msg.sender);
    }
    
    /**
     * @dev Revoke a certificate - only the owner or the issuer can revoke
     * @param id Certificate ID to revoke
     */
    function revokeCertificate(string memory id) public {
        require(bytes(certificates[id].id).length != 0, "Certificate doesn't exist");
        require(certificates[id].isValid, "Certificate already revoked");
        require(
            msg.sender == owner || certificates[id].issuer == msg.sender, 
            "Only the owner or the issuer can revoke certificates"
        );
        
        certificates[id].isValid = false;
        
        emit CertificateRevoked(id);
    }
    
    /**
     * @dev Verify if a certificate is valid
     * @param id Certificate ID to verify
     * @return bool whether the certificate is valid
     */
    function verifyCertificate(string memory id) public view returns (bool) {
        return certificates[id].isValid;
    }
    
    /**
     * @dev Get certificate details
     * @param id Certificate ID
     * @return Certificate details including issuer address
     */
    function getCertificateDetails(string memory id) public view returns (
        string memory,
        string memory,
        string memory,
        string memory,
        bool,
        address
    ) {
        require(bytes(certificates[id].id).length != 0, "Certificate doesn't exist");
        
        Certificate memory cert = certificates[id];
        return (
            cert.id,
            cert.studentName,
            cert.courseName,
            cert.issueDate,
            cert.isValid,
            cert.issuer
        );
    }
} 