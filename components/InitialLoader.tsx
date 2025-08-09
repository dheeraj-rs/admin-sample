'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Loader from './sample/loading/loader';

interface InitialLoaderProps {
    children: React.ReactNode;
}

const InitialLoader: React.FC<InitialLoaderProps> = ({ children }) => {
    const { isAuthenticated, isLoading, user, error, checkAuth } = useAuth();
    const router = useRouter();
    const [showLoader, setShowLoader] = useState(true);
    const [authChecked, setAuthChecked] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [animationStarted, setAnimationStarted] = useState(false);
    const hasHandledAuth = useRef(false);

    useEffect(() => {
        // Start the animation immediately
        if (!animationStarted) {
            setAnimationStarted(true);
        }
    }, []);

    useEffect(() => {
        // Handle auth completion only once
        if (!isLoading && !authChecked && !hasHandledAuth.current) {
            hasHandledAuth.current = true;
            setAuthChecked(true);

            if (error) {
                router.push('/auth/pin');
                return;
            }

            if (isAuthenticated && user) {
                // Wait for animation to complete, then show content
                setTimeout(() => {
                    setShowLoader(false);
                }, 1700); // Match animation duration (1400ms + 400ms)
            } else {
                router.push('/auth/pin');
            }
        }
    }, [isLoading, authChecked, error, isAuthenticated, user, router]);

    // Handle timeout for authentication check - only if still loading
    useEffect(() => {
        if (!isLoading) return; // Don't set timeout if auth is complete

        const timeout = setTimeout(() => {
            if (isLoading && retryCount < 3) {
                setRetryCount((prev) => prev + 1);
                checkAuth();
            } else if (isLoading && retryCount >= 3) {
                setAuthChecked(true);
                router.push('/auth/pin');
            }
        }, 10000); // 10 second timeout

        return () => clearTimeout(timeout);
    }, [isLoading, retryCount, checkAuth, router]);

    // Handle page reload after login
    useEffect(() => {
        const handleStorageChange = () => {
            // Check if we're coming from a login redirect
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('login') === 'success') {
                // Clear the URL parameter
                window.history.replaceState({}, document.title, window.location.pathname);
                // Force a fresh auth check
                checkAuth();
            }
        };

        // Listen for storage events (in case of login from another tab)
        window.addEventListener('storage', handleStorageChange);

        // Check URL parameters on mount
        handleStorageChange();

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [checkAuth]);

    const handleLoaderFinish = () => {
        // Animation completed, but we'll let the timeout handle the transition
        // This prevents double animation
    };

    // Show loader during initial load or while checking authentication
    if (showLoader || isLoading) {
        return (
            <div className="initial-loader-wrapper">
                <Loader finishLoading={handleLoaderFinish} />
            </div>
        );
    }

    // Show error state if authentication failed
    if (error && authChecked) {
        return (
            <div className="initial-loader-error">
                <div className="initial-loader-error-content">
                    <div className="initial-loader-error-icon">
                        <i className="pi pi-exclamation-triangle"></i>
                    </div>
                    <h1>Authentication Error</h1>
                    <p>{error}</p>
                    <div className="initial-loader-error-actions">
                        <button
                            onClick={() => {
                                setRetryCount(0);
                                setAuthChecked(false);
                                setShowLoader(true);
                                setAnimationStarted(false);
                                hasHandledAuth.current = false;
                                checkAuth();
                            }}
                            className="initial-loader-retry-btn"
                        >
                            Retry
                        </button>
                        <button onClick={() => router.push('/auth/pin')} className="initial-loader-login-btn">
                            Go to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (isAuthenticated && authChecked && !showLoader) {
        return <>{children}</>;
    }
    return null;
};

export default InitialLoader;
