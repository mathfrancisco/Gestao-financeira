import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    maxPagesToShow?: number;
    showFirstLast?: boolean;
    className?: string;
}

export const Pagination = ({
                               currentPage,
                               totalPages,
                               onPageChange,
                               maxPagesToShow = 5,
                               showFirstLast = true,
                               className = '',
                           }: PaginationProps) => {
    // Calcula quais páginas mostrar
    const getPageNumbers = (): (number | string)[] => {
        const pages: (number | string)[] = [];
        const halfMax = Math.floor(maxPagesToShow / 2);

        let startPage = Math.max(1, currentPage - halfMax);
        let endPage = Math.min(totalPages, currentPage + halfMax);

        // Ajusta se estiver no início
        if (currentPage <= halfMax) {
            endPage = Math.min(maxPagesToShow, totalPages);
        }

        // Ajusta se estiver no final
        if (currentPage >= totalPages - halfMax) {
            startPage = Math.max(1, totalPages - maxPagesToShow + 1);
        }

        // Adiciona primeira página e ellipsis
        if (startPage > 1) {
            pages.push(1);
            if (startPage > 2) {
                pages.push('...');
            }
        }

        // Adiciona páginas do meio
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        // Adiciona ellipsis e última página
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push('...');
            }
            pages.push(totalPages);
        }

        return pages;
    };

    const pages = getPageNumbers();

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            onPageChange(page);
        }
    };

    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className={`flex items-center justify-center gap-1 ${className}`}>
            {/* First Page Button */}
            {showFirstLast && (
                <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Primeira página"
                >
                    <ChevronsLeft className="h-4 w-4" />
                </button>
            )}

            {/* Previous Button */}
            <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Página anterior"
            >
                <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
                {pages.map((page, index) => {
                    if (page === '...') {
                        return (
                            <span
                                key={`ellipsis-${index}`}
                                className="px-3 py-2 text-gray-500"
                            >
                ...
              </span>
                        );
                    }

                    const pageNumber = page as number;
                    const isActive = pageNumber === currentPage;

                    return (
                        <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                isActive
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                            aria-label={`Página ${pageNumber}`}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            {pageNumber}
                        </button>
                    );
                })}
            </div>

            {/* Next Button */}
            <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Próxima página"
            >
                <ChevronRight className="h-4 w-4" />
            </button>

            {/* Last Page Button */}
            {showFirstLast && (
                <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Última página"
                >
                    <ChevronsRight className="h-4 w-4" />
                </button>
            )}
        </div>
    );
};

interface PaginationInfoProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    className?: string;
}

export const PaginationInfo = ({
                                   currentPage,
                                   totalItems,
                                   itemsPerPage,
                                   className = '',
                               }: PaginationInfoProps) => {
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className={`text-sm text-gray-600 ${className}`}>
            Mostrando <span className="font-medium text-gray-900">{start}</span> a{' '}
            <span className="font-medium text-gray-900">{end}</span> de{' '}
            <span className="font-medium text-gray-900">{totalItems}</span> registros
        </div>
    );
};

// Componente wrapper completo
interface PaginationWrapperProps extends PaginationProps {
    totalItems: number;
    itemsPerPage: number;
    showInfo?: boolean;
}

export const PaginationWrapper = ({
                                      totalItems,
                                      itemsPerPage,
                                      showInfo = true,
                                      ...paginationProps
                                  }: PaginationWrapperProps) => {
    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            {showInfo && (
                <PaginationInfo
                    currentPage={paginationProps.currentPage}
                    totalPages={paginationProps.totalPages}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                />
            )}
            <Pagination {...paginationProps} />
        </div>
    );
};