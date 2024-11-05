import Axios from 'axios'
import jsonwebtoken from 'jsonwebtoken'
import jwksClient from 'jwks-rsa'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('auth')

const client = jwksClient({
  jwksUri: 'https://dev-rubl4mdf6daaitdt.us.auth0.com/.well-known/jwks.json'
})

// Main handler function to authorize the request
export async function handler(event) {
  try {
    const jwtToken = await verifyToken(event.authorizationToken)

    return generatePolicy(jwtToken.sub, 'Allow')
  } catch (e) {
    logger.error('Authorization failed', { error: e.message })
    return generatePolicy('user', 'Deny')
  }
}

// Helper function to generate IAM policy
function generatePolicy(principalId, effect) {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: '*'
        }
      ]
    }
  }
}

// Function to verify the JWT token using JWKS
async function verifyToken(authHeader) {
  const token = extractToken(authHeader)
  
  if (!token) {
    throw new Error('Invalid authentication token')
  }

  // Decode the JWT header to get the 'kid' (Key ID)
  const decodedHeader = jsonwebtoken.decode(token, { complete: true })?.header
  if (!decodedHeader?.kid) {
    throw new Error('Token does not contain a valid kid')
  }

  // Fetch the JWKS and verify the token with the corresponding public key
  const signingKey = await getSigningKey(decodedHeader.kid)
  if (!signingKey) {
    throw new Error('Unable to retrieve signing key')
  }

  // Verify the JWT with the retrieved key
  const decodedJwt = await new Promise((resolve, reject) => {
    jsonwebtoken.verify(token, signingKey, { algorithms: ['RS256'] }, (error, decoded) => {
      if (error) {
        reject(new Error('Token verification failed'))
      } else {
        resolve(decoded)
      }
    })
  })

  return decodedJwt
}

// Function to extract the token from the Authorization header
function extractToken(authHeader) {
  if (!authHeader) {
    throw new Error('Authorization header is missing')
  }

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    throw new Error('Invalid token format')
  }

  return parts[1]
}

// Function to fetch the signing key from JWKS endpoint using the key ID
async function getSigningKey(kid) {
  return new Promise((resolve, reject) => {
    client.getSigningKey(kid, (err, key) => {
      if (err) {
        logger.error('Error fetching signing key', { error: err.message })
        reject(err)
      } else {
        resolve(key.publicKey || key.rsaPublicKey)
      }
    })
  })
}
