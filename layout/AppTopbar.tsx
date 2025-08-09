import { classNames } from '@/lib/utils';
import { AppTopbarRef } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { LayoutContext } from './context/LayoutContext';
import { useAuth } from '@/hooks/useAuth';

const AppTopbar = forwardRef<AppTopbarRef>((props, ref) => {
    const { layoutConfig, layoutState, onMenuToggle, onConfigToggle, onBottombarToggle, showProfileSidebar, onTopbarToggle } = useContext(LayoutContext);
    const { logout } = useAuth();
    const topbarRef = useRef<HTMLDivElement>(null);
    const menubuttonRef = useRef<HTMLButtonElement>(null);
    const profileMenuButtonRef = useRef<HTMLButtonElement>(null);
    const topbarmenuRef = useRef<HTMLDivElement>(null);
    const topbarmenubuttonRef = useRef<HTMLButtonElement>(null);
    const pathname = usePathname();
    const pathSegments = pathname?.split('/').filter(Boolean) || [];
    const [showMessageDropdown, setShowMessageDropdown] = useState(false);
    const messageDropdownRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
        topbarElement: topbarRef.current,
        menubutton: menubuttonRef.current,
        profileMenuButton: profileMenuButtonRef.current,
        topbarmenu: topbarmenuRef.current,
        topbarmenubutton: topbarmenubuttonRef.current,
    }));

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (messageDropdownRef.current && !messageDropdownRef.current.contains(event.target as Node) && showMessageDropdown) {
                setShowMessageDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMessageDropdown]);

    return (
        <React.Fragment>
            <nav ref={topbarRef} className="layout-topbar-main">
                <div className="topbar-start">
                    <Link href="/" className="logo-row">
                        <Image
                            src={`/layout/logo-${layoutConfig.colorScheme === 'dark' ? 'dark' : 'white'}.svg`}
                            width={40}
                            height={40}
                            alt="logo"
                            className="logo-img"
                        />
                        <span className="logo-text">
                            {'D-Admin'.split('').map((letter, index) => (
                                <span className="logo-text-content" key={index}>
                                    {letter}
                                </span>
                            ))}
                        </span>
                    </Link>
                    <div className="breadcrumb">
                        <Link href="/" className="breadcrumb-link">
                            Pages
                        </Link>
                        {pathSegments.map((segment, index) => (
                            <React.Fragment key={index}>
                                <span className="breadcrumb-separator">/</span>
                                <Link href={'/' + pathSegments.slice(0, index + 1).join('/')} className="breadcrumb-segment">
                                    {segment.charAt(0).toUpperCase() + segment.slice(1)}
                                </Link>
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <div className="topbar-center">
                    <div ref={messageDropdownRef}>
                        <div className="topbar-message" onClick={() => setShowMessageDropdown(!showMessageDropdown)}>
                            <i className="pi pi-bell" />
                            <span>You have 4 new messages</span>
                        </div>
                        {showMessageDropdown && (
                            <div className="topbar-message-dropdown">
                                <div className="message-header">
                                    <h3>Recent Messages</h3>
                                    <button className="clear-all">Clear All</button>
                                </div>
                                <div className="message-list">
                                    <div className="message-item">
                                        <i className="pi pi-envelope" />
                                        <div className="message-content">
                                            <span className="message-title">New Order Received</span>
                                            <span className="message-desc">Order #2023-456 needs processing</span>
                                            <span className="message-time">2 mins ago</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="topbar-end">
                    <div
                        ref={topbarmenuRef}
                        className={classNames('layout-topbar-menu', {
                            'layout-topbar-menu-mobile-active': layoutState.profileSidebarVisible,
                        })}
                    >
                        <div className="layout-button-container">
                            <button ref={menubuttonRef} type="button" className="p-link layout-topbar-button" onClick={onMenuToggle}>
                                <svg viewBox="0 0 32 32" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                                    <title>open-panel-left</title>
                                    <path
                                        d="M28,4H4A2,2,0,0,0,2,6V26a2,2,0,0,0,2,2H28a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V6A2,2,0,0,0,28,4ZM28,26H12V6H28Z"
                                        fill="currentColor"
                                    ></path>
                                    <path
                                        d="M4,6h6V26H4Z"
                                        fill={layoutState.staticMenuDesktopInactive === false && layoutConfig.menuMode === 'static' ? 'transparent' : ''}
                                    ></path>
                                </svg>
                                <span>Menu</span>
                            </button>
                            <button ref={menubuttonRef} type="button" className="p-link layout-topbar-button" onClick={onTopbarToggle}>
                                <svg viewBox="0 0 32 32" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                                    <title>open-panel-top</title>
                                    <path
                                        d="M28,4H4A2,2,0,0,0,2,6V26a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V6A2,2,0,0,0,28,4ZM28,26H4V14H28Z"
                                        fill="currentColor"
                                    ></path>
                                    <path d="M4,6h24v6H4Z" fill={layoutState.topbarAutoHide === false ? 'currentColor' : ''}></path>
                                </svg>
                                <span>Header</span>
                            </button>
                            <button ref={menubuttonRef} type="button" className="p-link layout-topbar-button" onClick={onBottombarToggle}>
                                <svg viewBox="0 0 32 32" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                                    <title>open-panel-bottom</title>
                                    <path
                                        d="M28,4H4A2,2,0,0,0,2,6V26a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V6A2,2,0,0,0,28,4ZM28,18H4V6H28Z"
                                        fill="currentColor"
                                    ></path>
                                    <path d="M4,20h24v6H4Z" fill={layoutState.staticBottombarDesktopInactive === false ? 'currentColor' : ''}></path>
                                </svg>
                                <span>Footer</span>
                            </button>
                            <button ref={menubuttonRef} type="button" className="p-link layout-topbar-button" onClick={onConfigToggle}>
                                <svg viewBox="0 0 32 32" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                                    <title>open-panel-right</title>
                                    <path
                                        d="M28,4H4A2,2,0,0,0,2,6V26a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V6A2,2,0,0,0,28,4ZM20,26H4V6H20Z"
                                        fill="currentColor"
                                    ></path>
                                    <path
                                        d="M22,6h6V26H22Z"
                                        fill={layoutState.staticConfigDesktopInactive === false && layoutConfig.menuMode === 'static' ? 'currentColor' : ''}
                                    ></path>
                                </svg>
                                <span>Config</span>
                            </button>
                        </div>

                        <div className="topbar-actions">
                            <Link href="/settings">
                                <button ref={menubuttonRef} type="button" className="p-link layout-topbar-button" title="Settings">
                                    <i className="pi pi-cog"></i>
                                    <span>Settings</span>
                                </button>
                            </Link>
                            <button type="button" className="p-link layout-topbar-button" onClick={logout} title="Logout">
                                <i className="pi pi-sign-out"></i>
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>

                <button ref={topbarmenubuttonRef} type="button" className="p-link layout-topbar-button layout-topbar-menu-button" onClick={onConfigToggle}>
                    <i className="pi pi-palette" />
                </button>
                <button ref={topbarmenubuttonRef} type="button" className="p-link layout-topbar-button layout-topbar-menu-button" onClick={onMenuToggle}>
                    <i className="pi pi-bars" />
                </button>
            </nav>
            <div className="layout-topbar-mask" />
        </React.Fragment>
    );
});

AppTopbar.displayName = 'AppTopbar';

export default AppTopbar;
