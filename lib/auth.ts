import { jwtVerify, SignJWT } from 'jose';

const COOKIE_NAME = 'user_data';

export const verifyAuth = async (token: string) => {
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'drjadmin'
    );
    const { payload } = await jwtVerify(token, secret);
    return { authenticated: true, payload };
  } catch (error) {
    return { authenticated: false };
  }
};

export const createToken = async (userId: string) => {
  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || 'drjadmin'
  );
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(secret);
  return token;
};

export const getUserRole = () => {
  const getCookie = (cookieName: string): string | null => {
    if (typeof document === 'undefined') return null;
    
    try {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${cookieName}=`);
      
      if (parts.length === 2) {
        const cookiePart = parts.pop();
        if (cookiePart) {
          const cookieValue = cookiePart.split(';').shift();
          return cookieValue || null;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting cookie:', error);
      return null;
    }
  };

  try {
    const cookieValue = getCookie(COOKIE_NAME);
    
    // Check if cookie exists and is not empty
    if (!cookieValue || cookieValue.trim() === '' || cookieValue === 'undefined') {
      return null;
    }

    // Try to decode and parse the cookie value
    const decodedValue = decodeURIComponent(cookieValue);
    
    // Additional check after decoding
    if (!decodedValue || decodedValue.trim() === '' || decodedValue === 'undefined') {
      return null;
    }

    const userData = JSON.parse(decodedValue);
    
    // Validate that userData is an object and has a role property
    if (userData && typeof userData === 'object' && userData.role) {
      return userData.role;
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing user role from cookie:', error);
    // Clear the invalid cookie
    if (typeof document !== 'undefined') {
      document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
    return null;
  }
};

export const getUserData = () => {
  const getCookie = (cookieName: string): string | null => {
    if (typeof document === 'undefined') return null;
    
    try {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${cookieName}=`);
      
      if (parts.length === 2) {
        const cookiePart = parts.pop();
        if (cookiePart) {
          const cookieValue = cookiePart.split(';').shift();
          return cookieValue || null;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting cookie:', error);
      return null;
    }
  };

  try {
    const cookieValue = getCookie(COOKIE_NAME);
    
    if (!cookieValue || cookieValue.trim() === '' || cookieValue === 'undefined') {
      return null;
    }

    const decodedValue = decodeURIComponent(cookieValue);
    
    if (!decodedValue || decodedValue.trim() === '' || decodedValue === 'undefined') {
      return null;
    }

    const userData = JSON.parse(decodedValue);
    
    if (userData && typeof userData === 'object') {
      return userData;
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing user data from cookie:', error);
    // Clear the invalid cookie
    if (typeof document !== 'undefined') {
      document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
    return null;
  }
};

export const clearUserData = () => {
  if (typeof document !== 'undefined') {
    document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    document.cookie = `auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
};