'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Key, Eye, EyeOff, AlertCircle, CheckCircle, Plus, ArrowLeft } from 'lucide-react';

export default function TokenKeys() {
  const router = useRouter();
  const [tokenKey, setTokenKey] = useState<string>('');
  const [keyName, setKeyName] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [role, setRole] = useState<string>('admin');
  const [isActive, setIsActive] = useState<boolean>(true);
  
  const validateForm = () => {
    setError(null);
    
    if (!keyName.trim()) {
      setError('Key name is required');
      return false;
    }

    if (!tokenKey.trim()) {
      setError('Token key is required');
      return false;
    }

    if (!expiryDate) {
      setError('Expiry date is required');
      return false;
    }

    if (!role) {
      setError('Role is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/admin-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: `${role}_${keyName}`,
          key: tokenKey,
          role,
          isActive,
          expiryDate: new Date(expiryDate).toISOString()
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Failed to store token key');
        return;
      }
      
      setSuccess('Token key stored successfully');
      
      // Clear form
      setKeyName('');
      setTokenKey('');
      setExpiryDate('');
      setRole('admin');
      setIsActive(true);
      
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="token-keys__wrapper">
      <main className="token-keys__container">
        <div className="token-keys__card">
          <h1 className="token-keys__title">
            <div className="token-keys__icon-wrapper">
              <Key size={22} color="var(--primary-color)" className="token-keys__icon" />
            </div>
            Token Key Generator
          </h1>
          
          {error && (
            <div className="token-keys__error">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          
          {success && (
            <div className="token-keys__success">
              <CheckCircle size={16} />
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="token-keys__form">
            <div className="token-keys__input-group">
              <label htmlFor="role" className="token-keys__label">Role</label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={isLoading}
                className="token-keys__select"
              >
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
                <option value="subadmin">Sub Admin</option>
                <option value="superuser">Super User</option>
              </select>
            </div>

            <div className="token-keys__input-group">
              <label htmlFor="keyName" className="token-keys__label">Key Name</label>
              <input
                id="keyName"
                type="text"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder="Enter key name"
                disabled={isLoading}
                className="token-keys__input"
              />
            </div>

            <div className="token-keys__input-group">
              <label htmlFor="tokenKey" className="token-keys__label">Token Key</label>
              <div className="token-keys__password-input">
                <input
                  id="tokenKey"
                  type={showKey ? 'text' : 'password'}
                  value={tokenKey}
                  onChange={(e) => setTokenKey(e.target.value)}
                  placeholder="Enter token key"
                  disabled={isLoading}
                  className="token-keys__input"
                />
                <button 
                  type="button" 
                  onClick={() => setShowKey(!showKey)}
                  className="token-keys__toggle-visibility"
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="token-keys__input-group">
              <label htmlFor="expiryDate" className="token-keys__label">Expiry Date</label>
              <input
                id="expiryDate"
                type="datetime-local"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                disabled={isLoading}
                className="token-keys__input"
              />
            </div>

            <div className="token-keys__input-group">
              <label htmlFor="isActive" className="token-keys__label">Status</label>
              <div className="token-keys__checkbox-input">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  disabled={isLoading}
                />
                <span>Active</span>
              </div>
            </div>
            
            <button
              type="submit"
              className="token-keys__submit-button"
              disabled={isLoading}
            >
              {isLoading ? 'Storing...' : 'Store Token Key'}
              <Plus size={16} />
            </button>
          </form>
          
          <button
            className="token-keys__back-button"
            onClick={() => router.push('/dashboard')}
            disabled={isLoading}
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}