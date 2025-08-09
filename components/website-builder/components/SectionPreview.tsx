'use client';
import { useRef } from 'react';
import { ArrowUp, ArrowDown, Copy, Trash, Edit2 } from 'lucide-react';
import HtmlPreview from '@/components/code-preview/HtmlPreview';
import websiteBuilderStore from '../store/websiteBuilderStore';
import WebsitePreview from '@/components/code-preview/WebsitePreview';

interface SectionCodeProps {
    id: string;
    name: string;
    type: string;
    snippet: string;
    language: string;
    version: string;
    props: Record<string, any>;
}

const SectionPreview = ({ Section }: { Section: SectionCodeProps }) => {
console.log('Section :', Section);
console.log('Section :', Section);
    const { activeSection, deleteSection,page1SectionCodes, isPropertiesPanelOpen, moveSection, duplicateSection, setActiveSection, togglePropertiesPanel } =
        websiteBuilderStore();
    const isSelected = activeSection?.id === Section?.id;
    const dragRef = useRef<HTMLDivElement>(null);

    const handleSectionClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isSelected) {
            setActiveSection(null);
            togglePropertiesPanel(false);
            return;
        }
        setActiveSection(Section);
    };

    const handleMoveUp = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        moveSection(Section.id, 'up');
    };

    const handleMoveDown = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        moveSection(Section.id, 'down');
    };

    const handleDuplicate = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        duplicateSection(Section.id);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        deleteSection(Section.id);
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isPropertiesPanelOpen) {
            togglePropertiesPanel(false);
            return;
        }
        setActiveSection(Section);
        togglePropertiesPanel(true);
    };

    const getComponentClass = () => {
        let classes = 'component';
        if (isSelected) classes += ' component--selected';
        return classes;
    };



    return (
        <div className={getComponentClass()} onClick={handleSectionClick} ref={dragRef} data-section-id={Section.id}>
            {isSelected && (
                <div className="component__controls" onClick={(e) => e.stopPropagation()} style={{ zIndex: 1000 }}>
                    <button title="Edit Properties" onClick={handleEdit} className="component__control-btn">
                        <Edit2 size={16} />
                    </button>
                    <button title="Move Up" onClick={handleMoveUp} className="component__control-btn">
                        <ArrowUp size={16} />
                    </button>
                    <button title="Move Down" onClick={handleMoveDown} className="component__control-btn">
                        <ArrowDown size={16} />
                    </button>
                    <button title="Duplicate" onClick={handleDuplicate} className="component__control-btn">
                        <Copy size={16} />
                    </button>
                    <button title="Delete" onClick={handleDelete} className="component__control-btn component__control-btn--danger">
                        <Trash size={16} />
                    </button>
                </div>
            )}
            <div className="html-preview">
                {/* <HtmlPreview key={`${Section.type}-${Section.id}`} htmlString={Section?.snippet} previewScope={`editor-preview-${Section.type}`} /> */}
                <WebsitePreview component={Section} />

            </div>
        </div>
    );
};

export default SectionPreview;
