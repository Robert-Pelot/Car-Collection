const fs = require('fs');
const path = require('path');

// Reading the certificate content
const certPath = path.join('C:/Git_Repos/Car_Collection/server/DigiCertGlobalRootCA.crt.pem');
const certContent = fs.readFileSync(certPath, 'utf-8');

// Function to check if certificate format is valid
function checkCertificate(certContent) {
  let errors = [];

  // Check if certificate starts and ends correctly
  if (!certContent.startsWith('-----BEGIN CERTIFICATE-----')) {
    errors.push('Certificate does not start with "-----BEGIN CERTIFICATE-----".');
  }
  if (!certContent.endsWith('-----END CERTIFICATE-----')) {
    errors.push('Certificate does not end with "-----END CERTIFICATE-----".');
  }

  // Remove the BEGIN/END lines and trim any extra whitespace
  const base64Content = certContent.replace('-----BEGIN CERTIFICATE-----', '').replace('-----END CERTIFICATE-----', '').trim();

  // Check for empty content between BEGIN/END lines
  if (base64Content.length === 0) {
    errors.push('The certificate content between BEGIN and END lines is empty.');
  }

  // Check if base64 content has any invalid characters
  if (!/^[A-Za-z0-9+/=]+$/.test(base64Content)) {
    errors.push('The certificate contains invalid characters or unexpected whitespace in the base64 content.');
  }

  // Check for excessive whitespace in the middle of the base64 content
  if (/\s{2,}/.test(base64Content)) {
    errors.push('The base64 content has excessive whitespace (two or more consecutive spaces).');
  }

  // Check if the base64 content is the correct length (base64-encoded data should be a multiple of 4)
  if (base64Content.length % 4 !== 0) {
    errors.push('The base64 content is not a multiple of 4 characters. This indicates an issue with padding or invalid base64 encoding.');
  }

  if (errors.length === 0) {
    console.log('Certificate format is valid.');
  } else {
    errors.forEach((error) => {
      console.error(error);
    });
  }
}

// Perform the certificate validation
checkCertificate(certContent);



