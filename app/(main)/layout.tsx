import Layout from '@/layout/layout';
import { RoleBasedRoute } from '@/components/auth/RoleBasedRoute';
import InitialLoader from '@/components/InitialLoader';
import '@/styles/elements/elements.scss';
import '@/styles/pages/index.scss';
import '@/styles/layout/layout.scss';

interface AppLayoutProps {
    children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    return (
        <InitialLoader>
            <RoleBasedRoute>
                <Layout>{children}</Layout>
            </RoleBasedRoute>
        </InitialLoader>
    );
}
