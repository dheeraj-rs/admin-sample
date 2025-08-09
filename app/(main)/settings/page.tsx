'use client';

import { useState, useEffect } from 'react';
import {
    User,
    LogOut,
    Palette,
    Layout,
    Bell,
    Monitor,
    Moon,
    Sun,
    Smartphone,
    Tablet,
    EyeOff,
    Code,
    Zap,
    Database,
    Shield,
    Globe,
    Layers,
    Type,
    ChevronDown,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { RoleAccessInfo } from '@/components/auth/RoleAccessInfo';

type CustomSelectOption = {
    value: string;
    label: string;
    icon?: React.ComponentType<{ size?: number | string }>;
};

interface CustomSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: CustomSelectOption[];
    label: string;
}

const SettingsPage = () => {
    const router = useRouter();

    // User state
    const [user, setUser] = useState({
        name: 'Dheeraj',
        email: 'drjsde@gmail.com',
        avatar: '/api/placeholder/80/80',
        role: 'Full Stack Developer',
    });

    // Theme state
    const [theme, setTheme] = useState('dark');
    const [customTheme, setCustomTheme] = useState(false);
    const [accentColor, setAccentColor] = useState('#3b82f6');

    // Layout state
    const [layout, setLayout] = useState({
        sidebar: 'left',
        headerStyle: 'fixed',
        contentWidth: 'full',
        viewMode: 'desktop',
        navigationStyle: 'horizontal',
        footerStyle: 'sticky',
    });

    // Notifications state
    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        desktop: true,
        marketing: false,
        updates: true,
        comments: true,
        errors: true,
        deployment: true,
    });

    // Website controls
    const [websiteControls, setWebsiteControls] = useState({
        autoGenerate: true,
        showElementsPanel: true,
        developerMode: true,
        previewMode: false,
        autoSave: true,
        codeEditor: true,
        responsivePreview: true,
        gridSystem: true,
    });

    // Advanced settings
    const [advanced, setAdvanced] = useState({
        animationSpeed: 'normal',
        language: 'en',
        timezone: 'UTC',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: 'decimal',
        codeTheme: 'dark',
        fontSize: 'medium',
        compactMode: false,
    });

    // SEO & Performance
    const [seoSettings, setSeoSettings] = useState({
        metaGeneration: true,
        sitemap: true,
        robotsTxt: true,
        imageOptimization: true,
        lazyLoading: true,
        minification: true,
        caching: true,
        analytics: false,
    });

    // Auto-save functionality
    useEffect(() => {
        const saveTimeout = setTimeout(() => {}, 1000);

        return () => clearTimeout(saveTimeout);
    }, [theme, layout, notifications, websiteControls, advanced, seoSettings]);

    const handleLogout = () => {
        // Clear cookies
        document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'user_data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

        // Redirect to login page
        router.push('/auth/pin');
    };

    const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, options, label }) => {
        const [isOpen, setIsOpen] = useState(false);

        return (
            <div className="custom-select-container">
                <label className="control-label">{label}</label>
                <div className="custom-select" onClick={() => setIsOpen(!isOpen)}>
                    <div className="select-value">
                        {options.find((opt) => opt.value === value)?.label || value}
                        <ChevronDown size={16} className={`chevron ${isOpen ? 'open' : ''}`} />
                    </div>
                    {isOpen && (
                        <div className="select-options">
                            {options.map((option) => (
                                <div
                                    key={option.value}
                                    className={`select-option ${value === option.value ? 'selected' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                >
                                    {option.icon && <option.icon size={16} />}
                                    {option.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="children__wrapper settings-container__wrapper">
            <div className="settings-grid">
                {/* User Profile Card */}
                <div className="settings-card">
                    <div className="card-header">
                        <div className="card-title">
                            <User size={20} />
                            <span>User Profile</span>
                        </div>
                        <div className="card-badge">Account</div>
                    </div>

                    <div className="user-profile">
                        <div className="user-avatar">
                            <User size={32} color="white" style={{ zIndex: 1 }} />
                        </div>
                        <div className="user-info">
                            <h3>{user.name}</h3>
                            <p>{user.email}</p>
                            <p>{user.role}</p>
                        </div>
                    </div>

                    <div className="control-group">
                        <label className="control-label">Display Name</label>
                        <input className="control-input" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} />
                    </div>

                    <div className="control-group">
                        <label className="control-label">Email</label>
                        <input className="control-input" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} />
                    </div>

                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
                        {/* Role Access Information */}
                <div className="settings-card">
                    <div className="card-header">
                        <div className="card-title">
                            <Shield size={20} />
                            <span>Role Access</span>
                        </div>
                        <div className="card-badge">Security</div>
                    </div>
                    <RoleAccessInfo />
                </div>

                {/* Theme Controls */}
                <div className="settings-card">
                    <div className="card-header">
                        <div className="card-title">
                            <Palette size={20} />
                            <span>Theme & Appearance</span>
                        </div>
                        <div className="card-badge">Visual</div>
                    </div>

                    <div className="control-group">
                        <label className="control-label">Theme Mode</label>
                        <div className="toggle-group">
                            <button className={`toggle-btn ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}>
                                <Sun size={14} />
                                Light
                            </button>
                            <button className={`toggle-btn ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}>
                                <Moon size={14} />
                                Dark
                            </button>
                            <button className={`toggle-btn ${theme === 'auto' ? 'active' : ''}`} onClick={() => setTheme('auto')}>
                                <Monitor size={14} />
                                Auto
                            </button>
                        </div>
                    </div>

                    <div className="control-group">
                        <label className="control-label">Accent Color</label>
                        <div className="color-picker-group">
                            <input type="color" className="color-picker" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} />
                            <span style={{ color: accentColor, fontWeight: 500 }}>{accentColor}</span>
                        </div>
                    </div>

                    <div className="notification-item">
                        <div className="notification-content">
                            <div className="notification-title">Custom Theme</div>
                            <div className="description">Enable advanced theme customization</div>
                        </div>
                        <label className="switch">
                            <input type="checkbox" checked={customTheme} onChange={(e) => setCustomTheme(e.target.checked)} />
                            <span className="slider"></span>
                        </label>
                    </div>

                    <CustomSelect
                        label="Code Editor Theme"
                        value={advanced.codeTheme}
                        onChange={(value) => setAdvanced({ ...advanced, codeTheme: value })}
                        options={[
                            { value: 'dark', label: 'Dark Theme', icon: Moon },
                            { value: 'light', label: 'Light Theme', icon: Sun },
                            { value: 'monokai', label: 'Monokai', icon: Code },
                            { value: 'github', label: 'GitHub', icon: Code },
                            { value: 'dracula', label: 'Dracula', icon: Code },
                        ]}
                    />
                </div>

                {/* Layout Controls */}
                <div className="settings-card">
                    <div className="card-header">
                        <div className="card-title">
                            <Layout size={20} />
                            <span>Layout & Navigation</span>
                        </div>
                        <div className="card-badge">Structure</div>
                    </div>

                    <div className="control-group">
                        <label className="control-label">Sidebar Position</label>
                        <div className="toggle-group">
                            <button
                                className={`toggle-btn ${layout.sidebar === 'left' ? 'active' : ''}`}
                                onClick={() => setLayout({ ...layout, sidebar: 'left' })}
                            >
                                <Layers size={14} />
                                Left
                            </button>
                            <button
                                className={`toggle-btn ${layout.sidebar === 'right' ? 'active' : ''}`}
                                onClick={() => setLayout({ ...layout, sidebar: 'right' })}
                            >
                                <Layers size={14} />
                                Right
                            </button>
                            <button
                                className={`toggle-btn ${layout.sidebar === 'hidden' ? 'active' : ''}`}
                                onClick={() => setLayout({ ...layout, sidebar: 'hidden' })}
                            >
                                <EyeOff size={14} />
                                Hidden
                            </button>
                        </div>
                    </div>

                    <div className="control-group">
                        <label className="control-label">Navigation Style</label>
                        <div className="toggle-group">
                            <button
                                className={`toggle-btn ${layout.navigationStyle === 'horizontal' ? 'active' : ''}`}
                                onClick={() => setLayout({ ...layout, navigationStyle: 'horizontal' })}
                            >
                                Horizontal
                            </button>
                            <button
                                className={`toggle-btn ${layout.navigationStyle === 'vertical' ? 'active' : ''}`}
                                onClick={() => setLayout({ ...layout, navigationStyle: 'vertical' })}
                            >
                                Vertical
                            </button>
                        </div>
                    </div>

                    <CustomSelect
                        label="Header Style"
                        value={layout.headerStyle}
                        onChange={(value) => setLayout({ ...layout, headerStyle: value })}
                        options={[
                            { value: 'fixed', label: 'Fixed Header' },
                            { value: 'sticky', label: 'Sticky Header' },
                            { value: 'static', label: 'Static Header' },
                            { value: 'floating', label: 'Floating Header' },
                        ]}
                    />

                    <CustomSelect
                        label="Footer Style"
                        value={layout.footerStyle}
                        onChange={(value) => setLayout({ ...layout, footerStyle: value })}
                        options={[
                            { value: 'sticky', label: 'Sticky Footer' },
                            { value: 'static', label: 'Static Footer' },
                            { value: 'minimal', label: 'Minimal Footer' },
                            { value: 'hidden', label: 'Hidden Footer' },
                        ]}
                    />

                    <div className="control-group">
                        <label className="control-label">Responsive Preview</label>
                        <div className="toggle-group">
                            <button
                                className={`toggle-btn ${layout.viewMode === 'desktop' ? 'active' : ''}`}
                                onClick={() => setLayout({ ...layout, viewMode: 'desktop' })}
                            >
                                <Monitor size={14} />
                                Desktop
                            </button>
                            <button
                                className={`toggle-btn ${layout.viewMode === 'tablet' ? 'active' : ''}`}
                                onClick={() => setLayout({ ...layout, viewMode: 'tablet' })}
                            >
                                <Tablet size={14} />
                                Tablet
                            </button>
                            <button
                                className={`toggle-btn ${layout.viewMode === 'mobile' ? 'active' : ''}`}
                                onClick={() => setLayout({ ...layout, viewMode: 'mobile' })}
                            >
                                <Smartphone size={14} />
                                Mobile
                            </button>
                        </div>
                    </div>
                </div>

                {/* Website Generation Controls */}
                <div className="settings-card">
                    <div className="card-header">
                        <div className="card-title">
                            <Zap size={20} />
                            <span>Website Generation</span>
                        </div>
                        <div className="card-badge">AI Tools</div>
                    </div>

                    <div className="notification-item">
                        <div className="notification-content">
                            <div className="notification-title">Auto Generate Elements</div>
                            <div className="description">Automatically generate website components using AI</div>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={websiteControls.autoGenerate}
                                onChange={(e) => setWebsiteControls({ ...websiteControls, autoGenerate: e.target.checked })}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>

                    <div className="notification-item">
                        <div className="notification-content">
                            <div className="notification-title">Elements Panel</div>
                            <div className="description">Show the drag-and-drop elements panel</div>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={websiteControls.showElementsPanel}
                                onChange={(e) => setWebsiteControls({ ...websiteControls, showElementsPanel: e.target.checked })}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>

                    <div className="notification-item">
                        <div className="notification-content">
                            <div className="notification-title">Developer Mode</div>
                            <div className="description">Enable advanced development features and code editing</div>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={websiteControls.developerMode}
                                onChange={(e) => setWebsiteControls({ ...websiteControls, developerMode: e.target.checked })}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>

                    <div className="notification-item">
                        <div className="notification-content">
                            <div className="notification-title">Live Preview</div>
                            <div className="description">Show real-time preview of changes</div>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={websiteControls.previewMode}
                                onChange={(e) => setWebsiteControls({ ...websiteControls, previewMode: e.target.checked })}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>

                    <div className="notification-item">
                        <div className="notification-content">
                            <div className="notification-title">Grid System</div>
                            <div className="description">Enable visual grid system for layout alignment</div>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={websiteControls.gridSystem}
                                onChange={(e) => setWebsiteControls({ ...websiteControls, gridSystem: e.target.checked })}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>

                    <div className="notification-item">
                        <div className="notification-content">
                            <div className="notification-title">Code Editor</div>
                            <div className="description">Integrated code editor with syntax highlighting</div>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={websiteControls.codeEditor}
                                onChange={(e) => setWebsiteControls({ ...websiteControls, codeEditor: e.target.checked })}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>

                {/* SEO & Performance */}
                <div className="settings-card">
                    <div className="card-header">
                        <div className="card-title">
                            <Globe size={20} />
                            <span>SEO & Performance</span>
                        </div>
                        <div className="card-badge">Optimization</div>
                    </div>

                    <div className="notification-item">
                        <div className="notification-content">
                            <div className="notification-title">Meta Tags Generation</div>
                            <div className="description">Auto-generate SEO meta tags for pages</div>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={seoSettings.metaGeneration}
                                onChange={(e) => setSeoSettings({ ...seoSettings, metaGeneration: e.target.checked })}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>

                    <div className="notification-item">
                        <div className="notification-content">
                            <div className="notification-title">Sitemap Generation</div>
                            <div className="description">Automatically create and update XML sitemap</div>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={seoSettings.sitemap}
                                onChange={(e) => setSeoSettings({ ...seoSettings, sitemap: e.target.checked })}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>

                    <div className="notification-item">
                        <div className="notification-content">
                            <div className="notification-title">Image Optimization</div>
                            <div className="description">Compress and optimize images automatically</div>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={seoSettings.imageOptimization}
                                onChange={(e) => setSeoSettings({ ...seoSettings, imageOptimization: e.target.checked })}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>

                    <div className="notification-item">
                        <div className="notification-content">
                            <div className="notification-title">Lazy Loading</div>
                            <div className="description">Load images and content as user scrolls</div>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={seoSettings.lazyLoading}
                                onChange={(e) => setSeoSettings({ ...seoSettings, lazyLoading: e.target.checked })}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>

                    <div className="notification-item">
                        <div className="notification-content">
                            <div className="notification-title">Code Minification</div>
                            <div className="description">Minify CSS, JS and HTML for faster loading</div>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={seoSettings.minification}
                                onChange={(e) => setSeoSettings({ ...seoSettings, minification: e.target.checked })}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>

                    <div className="notification-item">
                        <div className="notification-content">
                            <div className="notification-title">Browser Caching</div>
                            <div className="description">Enable intelligent browser caching</div>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={seoSettings.caching}
                                onChange={(e) => setSeoSettings({ ...seoSettings, caching: e.target.checked })}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>

                {/* Notifications */}
                <div className="settings-card">
                    <div className="card-header">
                        <div className="card-title">
                            <Bell size={20} />
                            <span>Notifications</span>
                        </div>
                        <div className="card-badge">Alerts</div>
                    </div>

                    <div className="notification-item">
                        <div className="notification-content">
                            <div className="notification-title">Email Notifications</div>
                            <div className="description">Receive notifications via email</div>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={notifications.email}
                                onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>

                    <div className="notification-item">
                        <div className="notification-content">
                            <div className="notification-title">Push Notifications</div>
                            <div className="description">Browser push notifications</div>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={notifications.push}
                                onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>

                    <div className="notification-item">
                        <div className="notification-content">
                            <div className="notification-title">Desktop Alerts</div>
                            <div className="description">Show desktop notification alerts</div>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={notifications.desktop}
                                onChange={(e) => setNotifications({ ...notifications, desktop: e.target.checked })}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>

                    <div className="notification-item">
                        <div className="notification-content">
                            <div className="notification-title">Error Notifications</div>
                            <div className="description">Get notified about website errors</div>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={notifications.errors}
                                onChange={(e) => setNotifications({ ...notifications, errors: e.target.checked })}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>

                    <div className="notification-item">
                        <div className="notification-content">
                            <div className="notification-title">Deployment Alerts</div>
                            <div className="description">Notifications for successful deployments</div>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={notifications.deployment}
                                onChange={(e) => setNotifications({ ...notifications, deployment: e.target.checked })}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>

                {/* Advanced Settings */}
                <div className="settings-card">
                    <div className="card-header">
                        <div className="card-title">
                            <Database size={20} />
                            <span>Advanced Settings</span>
                        </div>
                        <div className="card-badge">System</div>
                    </div>

                    <CustomSelect
                        label="Animation Speed"
                        value={advanced.animationSpeed}
                        onChange={(value) => setAdvanced({ ...advanced, animationSpeed: value })}
                        options={[
                            { value: 'slow', label: 'Slow (0.5x)' },
                            { value: 'normal', label: 'Normal (1x)' },
                            { value: 'fast', label: 'Fast (1.5x)' },
                            { value: 'none', label: 'Disabled' },
                        ]}
                    />

                    <CustomSelect
                        label="Language"
                        value={advanced.language}
                        onChange={(value) => setAdvanced({ ...advanced, language: value })}
                        options={[
                            { value: 'en', label: 'English' },
                            { value: 'es', label: 'Español' },
                            { value: 'fr', label: 'Français' },
                            { value: 'de', label: 'Deutsch' },
                            { value: 'it', label: 'Italiano' },
                            { value: 'pt', label: 'Português' },
                            { value: 'ru', label: 'Русский' },
                            { value: 'ja', label: '日本語' },
                            { value: 'ko', label: '한국어' },
                            { value: 'zh', label: '中文' },
                        ]}
                    />

                    <CustomSelect
                        label="Timezone"
                        value={advanced.timezone}
                        onChange={(value) => setAdvanced({ ...advanced, timezone: value })}
                        options={[
                            { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
                            { value: 'EST', label: 'EST (Eastern Standard Time)' },
                            { value: 'PST', label: 'PST (Pacific Standard Time)' },
                            { value: 'GMT', label: 'GMT (Greenwich Mean Time)' },
                            { value: 'CET', label: 'CET (Central European Time)' },
                            { value: 'JST', label: 'JST (Japan Standard Time)' },
                            { value: 'IST', label: 'IST (Indian Standard Time)' },
                        ]}
                    />

                    <CustomSelect
                        label="Font Size"
                        value={advanced.fontSize}
                        onChange={(value) => setAdvanced({ ...advanced, fontSize: value })}
                        options={[
                            { value: 'small', label: 'Small (14px)', icon: Type },
                            { value: 'medium', label: 'Medium (16px)', icon: Type },
                            { value: 'large', label: 'Large (18px)', icon: Type },
                            { value: 'xlarge', label: 'Extra Large (20px)', icon: Type },
                        ]}
                    />

                    <div className="notification-item">
                        <div className="notification-content">
                            <div className="notification-title">Compact Mode</div>
                            <div className="description">Reduce spacing and padding for dense layouts</div>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={advanced.compactMode}
                                onChange={(e) => setAdvanced({ ...advanced, compactMode: e.target.checked })}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>

                    <div className="notification-item">
                        <div className="notification-content">
                            <div className="notification-title">Auto Save</div>
                            <div className="description">Automatically save changes every 30 seconds</div>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={websiteControls.autoSave}
                                onChange={(e) => setWebsiteControls({ ...websiteControls, autoSave: e.target.checked })}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>

                {/* Security & Privacy */}
                <div className="settings-card">
                    <div className="card-header">
                        <div className="card-title">
                            <Shield size={20} />
                            <span>Security & Privacy</span>
                        </div>
                        <div className="card-badge">Protection</div>
                    </div>

                    <div className="notification-item">
                        <div className="notification-content">
                            <div className="notification-title">Two-Factor Authentication</div>
                            <div className="description">Enable 2FA for enhanced account security</div>
                        </div>
                        <label className="switch">
                            <input type="checkbox" />
                            <span className="slider"></span>
                        </label>
                    </div>

                    <div className="notification-item">
                        <div className="notification-content">
                            <div className="notification-title">Activity Logging</div>
                            <div className="description">Log user activities and changes</div>
                        </div>
                        <label className="switch">
                            <input type="checkbox" defaultChecked />
                            <span className="slider"></span>
                        </label>
                    </div>

                    <div className="notification-item">
                        <div className="notification-content">
                            <div className="notification-title">Analytics Tracking</div>
                            <div className="description">Enable website analytics and visitor tracking</div>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={seoSettings.analytics}
                                onChange={(e) => setSeoSettings({ ...seoSettings, analytics: e.target.checked })}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>

                    <div className="notification-item">
                        <div className="notification-content">
                            <div className="notification-title">Cookie Consent</div>
                            <div className="description">Show cookie consent banner for GDPR compliance</div>
                        </div>
                        <label className="switch">
                            <input type="checkbox" defaultChecked />
                            <span className="slider"></span>
                        </label>
                    </div>

                    <div className="notification-item">
                        <div className="notification-content">
                            <div className="notification-title">SSL Certificate</div>
                            <div className="description">Automatic SSL certificate management</div>
                        </div>
                        <label className="switch">
                            <input type="checkbox" defaultChecked />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
