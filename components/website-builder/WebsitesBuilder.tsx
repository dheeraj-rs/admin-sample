'use client';
import { useEffect, useRef, useState } from 'react';
import WebsiteBuilderHeader from './WebsiteBuilderHeader';
import WebsitesBuilderSidebar from './WebsitesBuilderSidebar';
import EditorCanvas from './EditorCanvas';
import ReactFlowCanvas from './ReactFlowCanvas';
import websiteBuilderStore from './store/websiteBuilderStore';
import '@/styles/pages/websites/index.scss';
import '@/styles/pages/website-builder/index.scss';
import WebsiteBuilderPropertys from './WebsiteBuilderPropertys';
import WebSiteSaveModal from './WebSiteSaveModal';
import { useGetWebsite } from '@/service/SnippetService';
import SpinningLoader from '../sample/Loader/SpinningLoader';
import FileManagerPage from '@/app/(main)/folder/page';
import FolderImporter from './Importing-project/page';

interface WebsitesBuilderProps {
    id?: string;
}

const WebsitesBuilder = ({ id }: WebsitesBuilderProps) => {
    const { canvasType, isSaveProject, isImportPanelOpen, isProjectFilesPanelOpen, setPage1SectionCodes } = websiteBuilderStore();
    const { data, isLoading, isError, error } = useGetWebsite(id || '');

    useEffect(() => {
        setPage1SectionCodes([]);
        if (id && data?.data?.snippet) {
            const { snippet } = data.data;
            if (snippet && snippet.length > 0) {
                setPage1SectionCodes(snippet);
            }
        }
    }, [data, id, setPage1SectionCodes]);

    return (
        <div className="children__fixed-h-wrapper">
            <div className="websites-builder__wrapper">
                <WebsiteBuilderHeader websiteId={id} />
                <div className="websites-builder-content">
                    <div className="sidebar-container">
                        <WebsitesBuilderSidebar />
                    </div>
                    {isLoading && id ? (
                        <div className="canvas-wrapper">
                            <SpinningLoader />
                        </div>
                    ) : isError ? (
                        <div className="error-message">{error.message}</div>
                    ) : (
                        <div className="canvas-wrapper canvas__wrapper">
                            {!isProjectFilesPanelOpen && canvasType === 'classic' && <EditorCanvas />}
                            {!isProjectFilesPanelOpen && canvasType === 'flow' && <ReactFlowCanvas />}
                            {!isImportPanelOpen && isProjectFilesPanelOpen && <FileManagerPage />}
                            {isImportPanelOpen && <FolderImporter />}
                        </div>
                    )}

                    <div className="property-sidebar-container">
                        <WebsiteBuilderPropertys />
                    </div>
                </div>
                {isSaveProject && <WebSiteSaveModal websiteId={id} />}
            </div>
        </div>
    );
};

export default WebsitesBuilder;
