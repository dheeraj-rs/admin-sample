import React from 'react';
import HtmlPreview from './HtmlPreview';
import websiteBuilderStore from '../website-builder/store/websiteBuilderStore';
import WebsitePreview from './WebsitePreview';

interface Section {
    id: string;
    name: string;
    type: string;
    snippet: string;
    language: string;
    version: string;
    props: Record<string, unknown>;
}

interface HtmlWebsitePreviewProps {
    sections: Section[];
    enableTailwind?: boolean;
    onClose?: () => void;
}

const HtmlWebsitePreview: React.FC<HtmlWebsitePreviewProps> = ({ sections, enableTailwind = true, onClose }) => {
console.log('sections :', sections);
    // const generateHtmlFromSections = () => {
    //     if (!sections || sections.length === 0) {
    //         return '';
    //     }
    //     return sections.map((section) => section.snippet).join('\n');
    // };

    const { page1SectionCodes } = websiteBuilderStore();


    return (
        <div className="preview-container website-preview-container">
            {onClose && (
                <button className="close-preview-button" onClick={onClose}>
                    <i className="pi pi-times" />
                </button>
            )}
            <WebsitePreview components={page1SectionCodes} />
        </div>
    );
};

export default HtmlWebsitePreview;
