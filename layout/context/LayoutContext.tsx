'use client';
import { ChildContainerProps, LayoutConfig, LayoutContextProps, LayoutState } from '@/types';
import { createContext, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const LayoutContext = createContext({} as LayoutContextProps);

export const LayoutProvider = ({ children }: ChildContainerProps) => {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
                refetchOnWindowFocus: false,
            },
        },
    }));

    const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>({
        ripple: false,
        inputStyle: 'outlined',
        menuMode: 'static',
        colorScheme: 'dark',
        theme: 'd-admin-dark',
        scale: 14,
        secretKey: '',
    });

    const [layoutState, setLayoutState] = useState<LayoutState>({
        staticMenuDesktopInactive: false,
        staticConfigDesktopInactive: true,
        staticBottombarDesktopInactive: true,
        overlayMenuActive: false,
        overlayConfigActive: false,
        overlayBottombarActive: false,
        profileSidebarVisible: false,
        configSidebarVisible: false,
        topbarAutoHide: false,
        staticMenuMobileActive: false,
        staticConfigMobileActive: false,
        staticBottombarMobileHide: false,
        menuHoverActive: false,
        sidebarAutoOverlayActive: true,
        searchSidebarItems: [],
        navbarStickyToggle: false,
        bottombarStickyToggle: true,
    });

    const onMenuToggle = () => {
        if (isOverlay()) {
            setLayoutState((prevLayoutState) => ({ ...prevLayoutState, overlayMenuActive: !prevLayoutState.overlayMenuActive }));
        }

        if (isDesktop()) {
            setLayoutState((prevLayoutState) => ({ ...prevLayoutState, staticMenuDesktopInactive: !prevLayoutState.staticMenuDesktopInactive }));
        } else {
            setLayoutState((prevLayoutState) => ({ ...prevLayoutState, staticMenuMobileActive: !prevLayoutState.staticMenuMobileActive }));
        }
    };

    const onConfigToggle = () => {
        if (isOverlay()) {
            setLayoutState((prevLayoutState) => ({ ...prevLayoutState, overlayConfigActive: !prevLayoutState.overlayConfigActive }));
        }

        if (isDesktop()) {
            setLayoutState((prevLayoutState) => ({ ...prevLayoutState, staticConfigDesktopInactive: !prevLayoutState.staticConfigDesktopInactive }));
        } else {
            setLayoutState((prevLayoutState) => ({ ...prevLayoutState, staticConfigMobileActive: !prevLayoutState.staticConfigMobileActive }));
        }
    };

    const onBottombarToggle = () => {
        if (isOverlay()) {
            setLayoutState((prevLayoutState) => ({ ...prevLayoutState, overlayBottombarActive: !prevLayoutState.overlayBottombarActive }));
        }

        if (isDesktop()) {
            setLayoutState((prevLayoutState) => ({ ...prevLayoutState, staticBottombarDesktopInactive: !prevLayoutState.staticBottombarDesktopInactive }));
        } else {
            setLayoutState((prevLayoutState) => ({ ...prevLayoutState, staticBottombarMobileHide: !prevLayoutState.staticBottombarMobileHide }));
        }
    };

    const onTopbarToggle = () => {
        setLayoutState((prevLayoutState) => ({ ...prevLayoutState, topbarAutoHide: !prevLayoutState.topbarAutoHide }));
    };

    const onNavbarStickyToggle = () => {
        setLayoutState((prevLayoutState) => ({ ...prevLayoutState, navbarStickyToggle: !prevLayoutState.navbarStickyToggle }));
    };

    const onBottombarStickyToggle = () => {
        setLayoutState((prevLayoutState) => ({ ...prevLayoutState, bottombarStickyToggle: !prevLayoutState.bottombarStickyToggle }));
    };

    const onSidebarAutoOverlayToggle = () => {
        setLayoutState((prevLayoutState) => ({ ...prevLayoutState, sidebarAutoOverlayActive: !prevLayoutState.sidebarAutoOverlayActive }));
    };

    const showProfileSidebar = () => {
        setLayoutState((prevLayoutState) => ({ ...prevLayoutState, profileSidebarVisible: !prevLayoutState.profileSidebarVisible }));
    };

    const isOverlay = () => {
        return layoutConfig.menuMode === 'overlay';
    };

    const isDesktop = () => {
        return window.innerWidth > 991;
    };

    useEffect(() => {
        if (layoutConfig.secretKey === 'q1') {
            setLayoutState((prevLayoutState) => ({ ...prevLayoutState, staticConfigDesktopInactive: !prevLayoutState.staticConfigDesktopInactive }));
        }
        if (layoutConfig.secretKey === '1q') {
            setLayoutState((prevLayoutState) => ({ ...prevLayoutState, staticConfigDesktopInactive: !prevLayoutState.staticConfigDesktopInactive }));
        }
    }, [layoutConfig.secretKey]);

    useEffect(() => {
        if (!isDesktop()) {
            setLayoutConfig((prevState: LayoutConfig) => ({
                ...prevState,
                menuMode: 'overlay',
            }));
        }
    }, []);

    const value: LayoutContextProps = {
        layoutConfig,
        setLayoutConfig,
        layoutState,
        setLayoutState,
        onMenuToggle,
        showProfileSidebar,
        onConfigToggle,
        onBottombarToggle,
        onTopbarToggle,
        onSidebarAutoOverlayToggle,
        onNavbarStickyToggle,
        onBottombarStickyToggle,
    };

    return (
        <QueryClientProvider client={queryClient}>
            <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
        </QueryClientProvider>
    );
};
