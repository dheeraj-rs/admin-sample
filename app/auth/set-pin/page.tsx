'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, AlertCircle, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const MAX_PIN_LENGTH = 4;

function SetPinPage() {
    const router = useRouter();
    const [newPin, setNewPin] = useState<string>('');
    const [confirmPin, setConfirmPin] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [adminKey, setAdminKey] = useState<string>('');
    const [stage, setStage] = useState<'new' | 'confirm'>('new');
    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [autoProgressBlocked, setAutoProgressBlocked] = useState(false);

    const resetToNewPin = useCallback(() => {
        setStage('new');
        setNewPin('');
        setConfirmPin('');
        setError(null);
        setAutoProgressBlocked(false);
    }, []);

    const handleNumberClick = useCallback(
        (number: string) => {
            setError(null);
            if (stage === 'new' && newPin.length < MAX_PIN_LENGTH) {
                setNewPin((prev) => prev + number);
            } else if (stage === 'confirm' && confirmPin.length < MAX_PIN_LENGTH) {
                setConfirmPin((prev) => prev + number);
            }
        },
        [stage, newPin, confirmPin]
    );

    const handleDelete = useCallback(() => {
        setError(null);
        if (stage === 'new') {
            setNewPin((prev) => prev.slice(0, -1));
        } else {
            setConfirmPin((prev) => prev.slice(0, -1));
        }
    }, [stage]);

    const submitForm = useCallback(async () => {
        if (!username.trim()) {
            setError('Username is required');
            return;
        }
        if (newPin.length !== MAX_PIN_LENGTH) {
            setError('PIN must be 4 digits');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/setup-pin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    newPin,
                    username: username.trim(),
                    adminKey: adminKey || undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to setup PIN');
                // Reset everything and go back to new PIN stage
                resetToNewPin();
                return;
            }

            // Validate user data before setting cookies
            if (data.user && data.token) {
                // Show success message first
                setShowSuccess(true);
                setError(null);
                setIsLoading(false);

                // Store token in cookie instead of localStorage
                document.cookie = `auth_token=${data.token}; path=/; max-age=${60 * 60 * 24}`; // 24 hours
                
                // Ensure user data is valid and properly encoded before setting cookie
                try {
                    const userDataString = JSON.stringify(data.user);
                    if (userDataString && userDataString !== 'undefined' && userDataString !== 'null' && userDataString !== '""') {
                        // Properly encode the JSON string for cookie storage
                        const encodedUserData = encodeURIComponent(userDataString);
                        document.cookie = `user_data=${encodedUserData}; path=/; max-age=${60 * 60 * 24}`;
                    } else {
                        console.error('Invalid user data received:', data.user);
                        setError('Invalid user data received. Please try again.');
                        return;
                    }
                } catch (encodeError) {
                    console.error('Error encoding user data:', encodeError);
                    setError('Error processing user data. Please try again.');
                    return;
                }

                // Clear any cached data and force fresh auth state
                if (typeof window !== 'undefined') {
                    // Clear any cached data
                    localStorage.removeItem('dashboardData');
                    
                    // Add a small delay to ensure cookies are set and show success message
                    setTimeout(() => {
                        // Use window.location.href for a full page reload to ensure fresh auth state
                        window.location.href = '/?login=success';
                    }, 2000); // Increased delay to show success message
                } else {
                    // Fallback to router push
                    setTimeout(() => {
                        router.push('/');
                    }, 2000);
                }
            } else {
                setError('Invalid response from server. Please try again.');
            }
        } catch (error) {
            console.error('Error creating PIN:', error);
            setError('Error creating PIN. Please try again.');
            resetToNewPin();
        } finally {
            setIsLoading(false);
        }
    }, [newPin, username, adminKey, router, resetToNewPin]);

    const validatePins = useCallback(() => {
        if (newPin !== confirmPin) {
            setError('PINs do not match. Please try again.');
            setAutoProgressBlocked(true);
            setTimeout(() => {
                resetToNewPin();
            }, 1500);
            return;
        }
        submitForm();
    }, [newPin, confirmPin, submitForm, resetToNewPin]);

    useEffect(() => {
        if (autoProgressBlocked || isLoading || showSuccess) return;
        if (stage === 'new' && newPin.length === MAX_PIN_LENGTH) {
            const timer = setTimeout(() => {
                setStage('confirm');
            }, 300);
            return () => clearTimeout(timer);
        } else if (stage === 'confirm' && confirmPin.length === MAX_PIN_LENGTH) {
            const timer = setTimeout(() => {
                validatePins();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [newPin, confirmPin, stage, validatePins, autoProgressBlocked, isLoading, showSuccess]);

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement;
            const isInputFocused =
                target && (target.tagName === 'INPUT' || (target as HTMLInputElement).type === 'text' || (target as HTMLInputElement).type === 'password');
            if (isInputFocused || isLoading || showSuccess) {
                return;
            }
            if (/^[0-9]$/.test(event.key)) {
                event.preventDefault();
                handleNumberClick(event.key);
            } else if (event.key === 'Backspace' || event.key === 'Delete') {
                event.preventDefault();
                handleDelete();
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleNumberClick, handleDelete, isLoading, showSuccess]);

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value);
        setError(null);
    };

    const handleAdminKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAdminKey(e.target.value);
        setError(null);
    };

    const handleBackAction = useCallback(() => {
        if (showSuccess) {
            // If success, redirect to main page
            window.location.href = '/?login=success';
            return;
        }
        
        if (stage === 'confirm') {
            setStage('new');
            setNewPin('');
            setConfirmPin('');
            setError(null);
            setAutoProgressBlocked(true);
            setTimeout(() => {
                setAutoProgressBlocked(false);
            }, 500);
        } else {
            router.push('/auth/pin');
        }
    }, [stage, router, showSuccess]);

    const renderKeypad = () => {
        const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', ''];
        const currentPin = stage === 'new' ? newPin : confirmPin;
        return digits.map((digit, index) => {
            if (digit === '') {
                if (index === 9) return <div key={index} className="pin-auth__keypad-spacer" />;
                if (index === 11) {
                    return (
                        <button
                            key={index}
                            className="pin-auth__keypad-button pin-auth__keypad-button--backspace"
                            onClick={handleDelete}
                            disabled={currentPin.length === 0 || isLoading || showSuccess}
                            aria-label="Delete"
                        >
                            <ChevronLeft size={20} />
                        </button>
                    );
                }
            }

            return (
                <button
                    key={index}
                    className="pin-auth__keypad-button"
                    onClick={() => handleNumberClick(digit)}
                    disabled={currentPin.length >= MAX_PIN_LENGTH || isLoading || showSuccess}
                >
                    {digit}
                </button>
            );
        });
    };

    const getCurrentPin = () => (stage === 'new' ? newPin : confirmPin);

    return (
        <div className="pin-auth__wrapper">
            <div className="pin-auth__back-button-container">
                <Link href="/" className="pin-auth__back-link">
                    <ChevronLeft size={18} />
                </Link>
            </div>
            <div className="pin-auth__container">
                <div className="pin-auth__card">
                    <div className="pin-auth__logo">
                        <div className="pin-auth__logo-circle">
                            <div className="pin-auth__logo-icon">
                                <Image src={`/layout/logo-dark.svg`} width={45} height={45} alt="logo" className="logo-img" />
                            </div>
                        </div>
                    </div>

                    <h1 className="pin-auth__title">
                        {showSuccess ? 'PIN Set Successfully!' : (stage === 'new' ? 'Create New PIN' : 'Confirm Your PIN')}
                    </h1>
                    
                    {stage === 'new' && !showSuccess && (
                        <div className="pin-auth__form-fields">
                            <div className="pin-auth__input-group">
                                <input
                                    type="text"
                                    value={username}
                                    onChange={handleUsernameChange}
                                    placeholder="Enter name"
                                    className="pin-auth__text-input"
                                    disabled={isLoading || showSuccess}
                                    required
                                />
                            </div>
                            <div className="pin-auth__input-group">
                                <input
                                    type="password"
                                    value={adminKey}
                                    onChange={handleAdminKeyChange}
                                    placeholder="Admin access key (optional)"
                                    className="pin-auth__text-input"
                                    disabled={isLoading || showSuccess}
                                />
                            </div>
                        </div>
                    )}
                    
                    <div className="pin-auth__display">
                        {error && (
                            <div className="pin-auth__error">
                                <AlertCircle size={14} />
                                <span>{error}</span>
                            </div>
                        )}

                        {showSuccess && (
                            <div className="pin-auth__success">
                                <CheckCircle size={16} />
                                <span>Redirecting to dashboard...</span>
                            </div>
                        )}

                        {isLoading && !showSuccess && (
                            <div className="pin-auth__loading-inline">
                                <div className="pin-auth__loading-spinner-small"></div>
                                <span>checking...</span>
                            </div>
                        )}

                        {!showSuccess && (
                            <div className="pin-auth__dots">
                                {Array(MAX_PIN_LENGTH)
                                    .fill(0)
                                    .map((_, index) => {
                                        const currentPin = getCurrentPin();
                                        const isActive = index < currentPin.length;

                                        return <div key={index} className={`pin-auth__dot ${isActive ? 'pin-auth__dot--active' : ''}`} />;
                                    })}
                            </div>
                        )}
                    </div>
                    
                    {!showSuccess && (
                        <div className="pin-auth__keypad">{renderKeypad()}</div>
                    )}
                    
                    <div className="pin-auth__actions">
                        <button 
                            className="pin-auth__set-pin-link" 
                            onClick={handleBackAction} 
                            disabled={isLoading}
                        >
                            {showSuccess ? 'Go to Dashboard' : 
                             ( !isLoading && stage === 'new' && !showSuccess ? 'Back to Login' : 'Back to Create PIN')}
                            {!isLoading && !showSuccess && 'Setting up your PIN...'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SetPinPage;
