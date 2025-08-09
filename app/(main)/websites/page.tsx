'use client';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import WebsiteListHeader from '../../../components/websites/WebsitesListHeader';
import WebsiteList from '../../../components/websites/WebsitesList';
import { ModalState, WebsiteFiltersState } from '@/types/website';
import SpinningLoader from '@/components/sample/Loader/SpinningLoader';
import ViewDetailsModal from '../../../components/websites/WebsitesListViewDetailsModal';
import { webService } from '@/service/WebService';
import NoMatchingData from '@/components/sample/NoMatching/NoMatchingData';
import '@/styles/pages/websites/index.scss';
import '@/styles/layout/layout.scss';
import Paginator from '@/components/ui/paginator/Paginator';

// Remove local interfaces as they are not needed for WebsiteFiltersState
// interface LocalFilterOption {
//     label: string;
//     value: string;
// }

// interface FilterOptionsResponse {
//     search: string;
//     category: LocalFilterOption;
//     type: LocalFilterOption;
//     tech: LocalFilterOption;
// }

// Correct the type definition for INITIAL_FILTERS to match WebsiteFiltersState
const INITIAL_FILTERS: WebsiteFiltersState = {
    page: 1,
    limit: 20, // Use a default limit matching the pagination initial state
    search: '',
    websiteType: '',
    paymentType: '',
};

export default function Websites() {
    const [filters, setFilters] = useState<WebsiteFiltersState>(INITIAL_FILTERS);
    const [isModalOpen, setIsModalOpen] = useState<ModalState>({ isVisible: false, type: '' });
    const [pagination, setPagination] = useState({
        first: 0,
        rows: 20,
        page: 1,
        totalRecords: 0,
        rowsPerPageOptions: [20, 30, 40, 50],
    });

    // Use the paginated fetch with React Query
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['websites', pagination.page, pagination.rows, filters.search, filters.websiteType, filters.paymentType],
        queryFn: () =>
            webService.getPaginatedWebsites(pagination.page, pagination.rows, {
                search: filters.search,
                // category: filters.category?.value, // Category filter is not in WebsiteFiltersState
                type: filters.websiteType, // Use websiteType
                technologies: filters.paymentType, // Use paymentType, assuming it maps to technologies in the service
            }),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Update pagination when data changes
    useEffect(() => {
        if (data?.pagination) {
            setPagination((prev) => ({
                ...prev,
                totalRecords: data?.pagination?.total || 0,
            }));
        }
    }, [data]);

    // Handle page change
    const onPageChange = (event: { first: number; rows: number }) => {
        const newPage = Math.floor(event.first / event.rows) + 1;

        setPagination((prev) => ({
            ...prev,
            first: event.first,
            rows: event.rows,
            page: newPage,
        }));
    };

    // Reset filters
    const resetFilters = () => {
        setFilters(INITIAL_FILTERS);
        setPagination((prev) => ({
            ...prev,
            page: 1,
            first: 0,
        }));
    };

    // Handle filter changes from WebsiteListHeader
    const handleFilterChange = (newFilters: WebsiteFiltersState) => {
        // When filters change, reset pagination to page 1
        setPagination((prev) => ({ ...prev, page: 1, first: 0 }));
        setFilters(newFilters);
    };

    // Convert pagination for Paginator component
    const paginatorData = {
        first: (pagination.page - 1) * pagination.rows, // Corrected to use pagination.rows
        rows: pagination.rows, // Use pagination.rows here
        totalRecords: pagination.totalRecords,
        rowsPerPageOptions: pagination.rowsPerPageOptions,
    };

    // Prepare filter options for the header component (assuming WebsiteListHeader expects these props)
    // Fetch filter options (types and technologies) - moved from commented out section if needed
    // const { data: filterOptions } = useQuery({ ... });
    // const typeFilterOptions = filterOptions?.typeOptions?.map(...) || [];
    // const techFilterOptions = filterOptions?.techOptions?.map(...) || [];

    // Note: WebsiteListHeader might need adjustment based on the actual options it expects
    // and how it handles filter changes, as the previous code was commented out.
    // Assuming it expects typeOptions and technologiesOptions based on its props.
    // For now, providing empty arrays or fetching them if necessary.

    const typeFilterOptions: { label: string; value: string }[] = []; // Replace with actual fetch if needed
    const techFilterOptions: { label: string; value: string }[] = []; // Replace with actual fetch if needed

    // Safely get items with fallback to empty array
    const items = data?.items || [];

    return (
        <div className="children__wrapper">
            <div className="websites__wrapper">
                <WebsiteListHeader
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    // Assuming WebsiteListHeader needs these options based on its props definition
                    typeOptions={typeFilterOptions} // Provide actual options if fetched
                    technologiesOptions={techFilterOptions} // Provide actual options if fetched
                />
                {isLoading ? (
                    <SpinningLoader />
                ) : items.length > 0 ? (
                    <WebsiteList
                        websites={items}
                        onSelect={(state) => setIsModalOpen({ isVisible: state.isVisible, type: state.type, website: state.website })}
                    />
                ) : (
                    <NoMatchingData />
                )}

                {/* View Details Modal */}
                {isModalOpen.isVisible && isModalOpen.type === 'view-details' && isModalOpen.website && (
                    <ViewDetailsModal
                        show={isModalOpen.isVisible}
                        onClose={() => setIsModalOpen({ isVisible: false, type: '' })}
                        viewDetails={isModalOpen.website}
                    />
                )}

                {/* Paginator */}
                {!isLoading && items.length > 0 && data?.pagination && <Paginator pageData={paginatorData} onPageChange={onPageChange} />}
            </div>
        </div>
    );
}
