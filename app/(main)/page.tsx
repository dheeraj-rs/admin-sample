'use client';
import DasboardError from '@/components/error-pages/DasboardError';
import SpinningLoader from '@/components/sample/Loader/SpinningLoader';
import AppFooter from '@/layout/AppFooter';
import { DashboardService } from '@/service/DashboardService';
import { DashboardData } from '@/types/dashboard';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<{ type: string; message: string } | null>(null);
    const [animationReady, setAnimationReady] = useState(false);
    const dashboardRef = useRef(null);
    const hasFetchedData = useRef(false);

    useEffect(() => {
        // Prevent duplicate API calls
        if (hasFetchedData.current) {
            return;
        }

        hasFetchedData.current = true;
        setLoading(true);

        DashboardService?.getDashboardData()
            .then((data) => {
                setDashboardData(data);
                setError(null);
                setLoading(false);

                // Delay animation start to ensure DOM is ready
                setTimeout(() => {
                    setAnimationReady(true);
                }, 100);
            })
            .catch((error) => {
                console.error('Error fetching dashboard data:', error);
                let errorMessage = 'Unable to load dashboard data. Please try again later.';
                let errorType = 'general';

                if (error instanceof SyntaxError && error.message.includes('JSON')) {
                    errorType = 'json';
                    errorMessage = 'Invalid data format received from server';
                } else if (error.message === 'Failed to fetch') {
                    errorType = 'network';
                    errorMessage = 'Network connection error. Please check your internet connection';
                } else if (error.status === 401) {
                    errorType = 'auth';
                    errorMessage = 'Authentication error. Please login again';
                }

                setError({ type: errorType, message: errorMessage });
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <SpinningLoader />;
    }

    if (error || !dashboardData) {
        return (
            <div className="dashboard-error-wrapper">
                <DasboardError error={error} />
            </div>
        );
    }

    const websiteData = dashboardData?.websiteInventory?.liveWebsites;
    const performanceData = dashboardData?.performanceAnalytics?.websiteTraffic;
    const userEngagement = dashboardData?.userEngagement;
    const systemNotifications = dashboardData?.systemMonitoring?.notifications?.recent;

    return (
        <div className="children__wrapper">
            <div className="dashboard-wrapper">
                <div className="dashboard" ref={dashboardRef}>
                    <div className={`dashboard__container ${animationReady ? 'animate-cards' : 'pre-animation'}`}>
                        {/* Website Inventory Overview */}
                        <Link href="/webconfig/live" className="dashboard-card" data-card-index="0">
                            <div className="card-header">
                                <div>
                                    <span className="card-label">Live Websites</span>
                                    <div className="card-value">{websiteData?.total}</div>
                                </div>
                                <div className="icon-container blue">
                                    <i className="pi pi-globe icon blue" />
                                </div>
                            </div>
                            <span className="highlight-text">{websiteData?.newSites} new </span>
                            <span className="secondary-text">Active: {websiteData?.activePercentage}%</span>
                        </Link>

                        {/* Performance Metrics */}
                        <div className="dashboard-card" data-card-index="1">
                            <div className="card-header">
                                <div>
                                    <span className="card-label">Total Visits</span>
                                    <div className="card-value">{performanceData?.overallMetrics?.totalVisits?.toLocaleString()}</div>
                                </div>
                                <div className="icon-container orange">
                                    <i className="pi pi-chart-line icon orange" />
                                </div>
                            </div>
                            <span className="highlight-text">{performanceData?.overallMetrics?.uniqueVisitors?.toLocaleString()} </span>
                            <span className="secondary-text">Unique Visitors</span>
                        </div>

                        {/* User Engagement */}
                        <Link href="/webconfig/portfolio" className="dashboard-card" data-card-index="2">
                            <div className="card-header">
                                <div>
                                    <span className="card-label">Portfolio</span>
                                    <div className="card-value">{userEngagement?.portfolio?.newSites}</div>
                                </div>
                                <div className="icon-container cyan">
                                    <i className="pi pi-clock icon cyan" />
                                </div>
                            </div>
                            <span className="secondary-text">Total Sites </span>
                            <span className="highlight-text">{userEngagement?.portfolio?.total?.toLocaleString()} </span>
                        </Link>

                        {/* System Notifications */}
                        <div className="dashboard-card" data-card-index="3">
                            <div className="card-header">
                                <div>
                                    <span className="card-label">Notifications</span>
                                    <div className="card-value">{systemNotifications?.length}</div>
                                </div>
                                <div className="icon-container purple">
                                    <i className="pi pi-bell icon purple" />
                                </div>
                            </div>
                            <span className="highlight-text">{systemNotifications?.filter((n) => n.priority === 'high').length} High Priority </span>
                            <span className="secondary-text">Recent Alerts</span>
                        </div>

                        {/* Website Categories */}
                        <div className="trend-card" data-card-index="4">
                            <div className="trend-card-header">
                                <div className="icon-container-alt blue">
                                    <i className="pi pi-bookmark icon blue" />
                                </div>
                                <div className="trend-meta">
                                    <span className="trend-label">Top Categories</span>
                                    <span className="trend-sublabel">{dashboardData?.websiteInventory?.templateLibrary?.total} Templates</span>
                                </div>
                            </div>
                            <div className="trend-value">{dashboardData?.websiteInventory?.templateLibrary?.topCategories?.slice(0, 2).join(', ')}</div>
                            <div className="trend-footer">
                                <i className="pi pi-arrow-up icon-small green" />
                                <span className="trend-status green">Growing Categories</span>
                            </div>
                        </div>

                        {/* Traffic Sources */}
                        <div className="trend-card" data-card-index="5">
                            <div className="trend-card-header">
                                <div className="icon-container-alt green">
                                    <i className="pi pi-chart-bar icon green" />
                                </div>
                                <div className="trend-meta">
                                    <span className="trend-label">Traffic Source</span>
                                    <span className="trend-sublabel">{performanceData?.overallMetrics?.trafficSources?.organic}% Organic</span>
                                </div>
                            </div>
                            <div className="trend-value">Organic Search</div>
                            <div className="trend-footer">
                                <i className="pi pi-arrow-up icon-small green" />
                                <span className="trend-status green">Leading Channel</span>
                            </div>
                        </div>

                        {/* Device Usage */}
                        <div className="trend-card" data-card-index="6">
                            <div className="trend-card-header">
                                <div className="icon-container-alt purple">
                                    <i className="pi pi-desktop icon purple" />
                                </div>
                                <div className="trend-meta">
                                    <span className="trend-label">Website Visited</span>
                                    <span className="trend-sublabel">{performanceData?.overallMetrics?.deviceBreakdown?.desktop}% Desktop</span>
                                </div>
                            </div>
                            <div className="trend-value">Desktop Dominant</div>
                            <div className="trend-footer">
                                <i className="pi pi-desktop icon-small purple" />
                                <span className="trend-status purple">Primary Platform</span>
                            </div>
                        </div>

                        {/* User Satisfaction */}
                        <div className="trend-card" data-card-index="7">
                            <div className="trend-card-header">
                                <div className="icon-container-alt orange">
                                    <i className="pi pi-star-fill icon orange" />
                                </div>
                                <div className="trend-meta">
                                    <span className="trend-label">Element Visited</span>
                                    <span className="trend-sublabel">{dashboardData?.systemMonitoring?.userSatisfaction?.recommendationRate}% Recommended</span>
                                </div>
                            </div>
                            <div className="trend-value">High Satisfaction</div>
                            <div className="trend-footer">
                                <i className="pi pi-thumbs-up icon-small orange" />
                                <span className="trend-status orange">Recommended</span>
                            </div>
                        </div>

                        {/* Left Column */}
                        <div className="dashboard-column" data-card-index="8">
                            {/* Download Activity */}
                            <div className="dashboard-panel">
                                <h5 className="panel-title">Download Activity</h5>
                                <ul className="activity-list">
                                    {userEngagement?.downloadActivity?.map((activity, index) => (
                                        <li key={index} className="download-item">
                                            <div className="download-type">{activity.type}</div>
                                            <div className="progress-container">
                                                <div className="progress-bar-bg">
                                                    <div className={`progress-bar ${activity.color}`} style={{ width: `${activity.percentage}%` }} />
                                                </div>
                                                <span className={`progress-value ${activity.color}`}>{activity.percentage}%</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Visited Cards Section */}
                            <div className="visited-cards">
                                <div className="visited-grid">
                                    {/* Website Visited Card */}
                                    <div className="visited-card">
                                        <div className="card-header">
                                            <div>
                                                <span className="card-label">Website Visited</span>
                                                <div className="card-value">{performanceData?.overallMetrics?.deviceBreakdown?.desktop}%</div>
                                            </div>
                                            <div className="icon-container purple">
                                                <i className="pi pi-desktop icon purple" />
                                            </div>
                                        </div>
                                        <span className="highlight-text">Desktop Dominant</span>
                                        <span className="secondary-text">Primary Platform</span>
                                    </div>

                                    {/* Element Visited Card */}
                                    <div className="visited-card">
                                        <div className="card-header">
                                            <div>
                                                <span className="card-label">Element Visited</span>
                                                <div className="card-value">{dashboardData?.systemMonitoring?.userSatisfaction?.recommendationRate}%</div>
                                            </div>
                                            <div className="icon-container orange">
                                                <i className="pi pi-star-fill icon orange" />
                                            </div>
                                        </div>
                                        <span className="highlight-text">High Satisfaction</span>
                                        <span className="secondary-text">Recommended</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="dashboard-column" data-card-index="9">
                            <div className="visited-cards">
                                <div className="visited-grid">
                                    {/* Website Visited Card */}
                                    <div className="visited-card">
                                        <div className="card-header">
                                            <div>
                                                <span className="card-label">Website Visited</span>
                                                <div className="card-value">{performanceData?.overallMetrics?.deviceBreakdown?.desktop}%</div>
                                            </div>
                                            <div className="icon-container purple">
                                                <i className="pi pi-desktop icon purple" />
                                            </div>
                                        </div>
                                        <span className="highlight-text">Desktop Dominant</span>
                                    </div>

                                    {/* Element Visited Card */}
                                    <div className="visited-card">
                                        <div className="card-header">
                                            <div>
                                                <span className="card-label">Element Visited</span>
                                                <div className="card-value">{dashboardData?.systemMonitoring?.userSatisfaction?.recommendationRate}%</div>
                                            </div>
                                            <div className="icon-container orange">
                                                <i className="pi pi-star-fill icon orange" />
                                            </div>
                                        </div>
                                        <span className="highlight-text">High Satisfaction</span>
                                    </div>
                                </div>
                            </div>

                            {/* Notifications */}
                            <div className="dashboard-panel">
                                <h5 className="panel-title">System Notifications</h5>
                                <ul className="activity-list">
                                    {systemNotifications && systemNotifications.length ? (
                                        systemNotifications.map((notification) => (
                                            <li key={notification.id} className="notification-item">
                                                <div className={`notification-icon-container ${notification.type === 'Error' ? 'red' : 'blue'}`}>
                                                    <i className={`pi ${notification.icon} icon ${notification.type === 'Error' ? 'red' : 'blue'}`} />
                                                </div>
                                                <span className="notification-content">
                                                    {notification.message}
                                                    <span className="notification-timestamp">{new Date(notification.timestamp).toLocaleString()}</span>
                                                </span>
                                            </li>
                                        ))
                                    ) : (
                                        <div className="no-data">
                                            <i className="pi pi-check-circle no-data-icon"></i>
                                            <span>No notifications at this time</span>
                                        </div>
                                    )}
                                </ul>
                            </div>
                        </div>

                        {/* Issue Tracking Overview */}
                        <div className="issue-tracking-section" data-card-index="10">
                            <div className="dashboard-panel">
                                {/* <h5 className="panel-title">Issue Tracking Overview</h5> */}
                                <div className="issue-grid">
                                    {/* Issue Status */}
                                    <div className="issue-card">
                                        <div className="issue-card-header">
                                            <div>
                                                <span className="issue-label">Total Issues</span>
                                                <div className="issue-value">{dashboardData?.performanceAnalytics?.issueTracking?.issueStatus?.total}</div>
                                            </div>
                                            <div className="icon-container red">
                                                <i className="pi pi-exclamation-circle icon red" />
                                            </div>
                                        </div>
                                        <span className="issue-highlight">
                                            {dashboardData?.performanceAnalytics?.issueTracking?.issueStatus?.resolved} Resolved
                                        </span>
                                    </div>

                                    {/* Critical Issues */}
                                    <div className="issue-card">
                                        <div className="issue-card-header">
                                            <div>
                                                <span className="issue-label">Critical Issues</span>
                                                <div className="issue-value">
                                                    {dashboardData?.performanceAnalytics?.issueTracking?.severityBreakdown?.critical}
                                                </div>
                                            </div>
                                            <div className="icon-container yellow">
                                                <i className="pi pi-bolt icon yellow" />
                                            </div>
                                        </div>
                                        <span className="issue-meta">
                                            Average Resolution: {dashboardData?.performanceAnalytics?.issueTracking?.resolutionTimeline?.average}
                                        </span>
                                    </div>

                                    {/* System Health */}
                                    <div className="issue-card">
                                        <div className="issue-card-header">
                                            <div>
                                                <span className="issue-label">System Uptime</span>
                                                <div className="issue-value">{dashboardData?.systemMonitoring?.healthMetrics?.uptime}</div>
                                            </div>
                                            <div className="icon-container green">
                                                <i className="pi pi-check-circle icon green" />
                                            </div>
                                        </div>
                                        <span className="issue-meta">Response Time: {dashboardData?.systemMonitoring?.healthMetrics?.responseTime}</span>
                                    </div>

                                    {/* Server Load */}
                                    <div className="issue-card">
                                        <div className="issue-card-header">
                                            <div>
                                                <span className="issue-label">Server Load</span>
                                                <div className="issue-value">{dashboardData?.systemMonitoring?.healthMetrics?.serverLoad}</div>
                                            </div>
                                            <div className="icon-container purple">
                                                <i className="pi pi-server icon purple" />
                                            </div>
                                        </div>
                                        <span className="issue-meta">Critical Alerts: {dashboardData?.systemMonitoring?.healthMetrics?.criticalAlerts}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <AppFooter />
            </div>
        </div>
    );
};

export default Dashboard;
