import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { hasPermission } from '@/lib/roles';

const publicPaths = ['/', '/auth/pin', '/auth/set-pin'];

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const token = request.cookies.get('auth_token')?.value;

    const isPublicPath = publicPaths.includes(path);

    // If no token and trying to access protected route, redirect to login
    if (!isPublicPath && !token) {
        return NextResponse.redirect(new URL('/auth/pin', request.url));
    }

    // If token exists, validate it
    if (token) {
        try {
            const { authenticated, payload } = await verifyAuth(token);
            
            // If token is invalid and trying to access protected route, redirect to login
            if (!authenticated && !isPublicPath) {
                return NextResponse.redirect(new URL('/auth/pin', request.url));
            }
            
            // If token is valid, check role-based permissions
            if (authenticated && payload) {
                // Get user data from cookie to check role
                const userDataCookie = request.cookies.get('user_data')?.value;
                
                if (userDataCookie) {
                    try {
                        const userData = JSON.parse(decodeURIComponent(userDataCookie));
                        
                        // Check if user has permission for this route
                        if (!isPublicPath && !hasPermission(path, userData.role)) {
                            // Redirect to dashboard if user doesn't have permission
                            return NextResponse.redirect(new URL('/', request.url));
                        }
                    } catch (error) {
                        console.error('Error parsing user data:', error);
                        // If user data is invalid, redirect to login
                        if (!isPublicPath) {
                            return NextResponse.redirect(new URL('/auth/pin', request.url));
                        }
                    }
                }
                
                // If token is valid and trying to access auth pages, redirect to home
                if (isPublicPath && path !== '/') {
                    return NextResponse.redirect(new URL('/', request.url));
                }
            }
        } catch (error) {
            console.error('Token validation error in middleware:', error);
            // If validation fails and trying to access protected route, redirect to login
            if (!isPublicPath) {
                return NextResponse.redirect(new URL('/auth/pin', request.url));
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next|_vercel|static|.*\\..*|_next/static|_next/image|favicon.ico).*)'],
};
