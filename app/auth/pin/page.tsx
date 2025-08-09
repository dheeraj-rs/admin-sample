'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle, ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const MAX_PIN_LENGTH = 4;

function PinPage() {
    const router = useRouter();
    const [pin, setPin] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Handle number button clicks
    const handleNumberClick = useCallback(
        (number: string) => {
            if (pin.length < MAX_PIN_LENGTH) {
                setPin((prev) => prev + number);
                setError(null);
            }
        },
        [pin]
    );

    // Handle delete button click
    const handleDelete = useCallback(() => {
        setPin((prev) => prev.slice(0, -1));
        setError(null);
    }, []);

    // Validate PIN
    const validatePin = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ pin }),
            });

            const data = await response.json();

            if (response.ok) {
                setShowSuccess(true);

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

                    // Add a small delay to ensure cookies are set
                    setTimeout(() => {
                        // Use window.location.href for a full page reload to ensure fresh auth state
                        window.location.href = '/?login=success';
                    }, 1500);
                } else {
                    // Fallback to router push
                    setTimeout(() => {
                        router.push('/');
                    }, 1500);
                }
            } else {
                setError(data.error || 'Incorrect PIN. Please try again.');
                setTimeout(() => {
                    setPin('');
                }, 800);
            }
        } catch (error) {
            setError('Error validating PIN. Please try again.');
            setTimeout(() => {
                setPin('');
            }, 800);
        } finally {
            setIsLoading(false);
        }
    }, [pin, router]);

    // Check PIN when it reaches the maximum length
    useEffect(() => {
        if (pin.length === MAX_PIN_LENGTH) {
            validatePin();
        }
    }, [pin, validatePin]);

    useEffect(() => {
        const handleKeyPress = (event: { key: string }) => {
            if (/^[0-9]$/.test(event.key)) {
                handleNumberClick(event.key);
            } else if (event.key === 'Backspace' || event.key === 'Delete') {
                handleDelete();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleNumberClick, handleDelete]);

    // Render numeric keypad
    const renderKeypad = useCallback(() => {
        const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', ''];

        return digits.map((digit, index) => {
            if (digit === '') {
                // Empty button for position 9 (left of 0)
                if (index === 9) return <div key={index} />;

                // Backspace button for position 11 (right of 0)
                if (index === 11) {
                    return (
                        <button
                            key={index}
                            className="pin-auth__keypad-button pin-auth__keypad-button--backspace"
                            onClick={handleDelete}
                            disabled={pin.length === 0}
                            aria-label="Delete"
                        >
                            <i className="pi pi-chevron-left" />
                        </button>
                    );
                }
            }

            return (
                <button
                    key={index}
                    className="pin-auth__keypad-button"
                    onClick={() => handleNumberClick(digit)}
                    disabled={pin.length >= MAX_PIN_LENGTH}
                >
                    {digit}
                </button>
            );
        });
    }, [handleNumberClick, handleDelete, pin.length]);

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
                                <Image src={`/layout/logo-dark.svg`} width={55} height={55} alt="logo" className="logo-img" />
                            </div>
                        </div>
                    </div>

                    <h1 className="pin-auth__title">Enter PIN</h1>

                    <div className="pin-auth__display">
                        {error && (
                            <div className="pin-auth__error">
                                <AlertCircle size={14} />
                                <span>{error}</span>
                            </div>
                        )}

                        {!isLoading && showSuccess && (
                            <div className="pin-auth__success">
                                <CheckCircle size={16} />
                                <span>Success! Redirecting...</span>
                            </div>
                        )}

                        {isLoading && (
                            <div className="pin-auth__loading-inline">
                                <div className="pin-auth__loading-spinner-small"></div>
                                <span>checking...</span>
                            </div>
                        )}

                        <div className="pin-auth__dots">
                            {Array(MAX_PIN_LENGTH)
                                .fill(0)
                                .map((_, index) => (
                                    <div key={index} className={`pin-auth__dot ${index < pin.length ? 'pin-auth__dot--active' : ''}`} />
                                ))}
                        </div>
                    </div>

                    <div className="pin-auth__keypad">{renderKeypad()}</div>

                    <div className="pin-auth__actions">
                        <Link href="/auth/set-pin" className="pin-auth__set-pin-link">
                            Set PIN
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PinPage;
