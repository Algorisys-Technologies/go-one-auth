import { useSearchParams } from "react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({
  pages,
  currentPage,
  totalCount,
  tableInfo,
  currentLength
}: {
  pages: number;
  currentPage: number;
  totalCount?: number;
  tableInfo?: boolean;
  currentLength?: number;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const maxButtons = 5;
  const halfMax = Math.floor(maxButtons / 2);
  let startPage = Math.max(0, currentPage - halfMax);
  let endPage = Math.min(pages - 1, startPage + maxButtons - 1);

  if (endPage === pages - 1) {
    startPage = Math.max(0, endPage - maxButtons + 1);
  }

  const setCurrentPage = (index: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", index.toString());
    setSearchParams(params);
  };

  const startItem = currentPage * currentLength + 1;
  const endItem = startItem + currentLength - 1;

  return (
    <div className="flex flex-col md:flex-row justify-between items-center pt-6 gap-4">
      {/* Table Info */}
      {tableInfo && (
        <div className="text-sm text-gray-600">
          Showing <span className="font-medium">{startItem}</span> to{" "}
          <span className="font-medium">{endItem}</span> out of{" "}
          <span className="font-medium">{totalCount}</span> results
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center w-full md:w-auto">
        <nav aria-label="Pagination">
          <ul className="flex items-center gap-1 text-sm">
            {/* Previous Button */}
            <li>
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage <= 0}
                className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronLeft size={16} className="mr-1" />
                <span>Previous</span>
              </button>
            </li>

            {/* First Page + Ellipsis */}
            {startPage > 0 && (
              <>
                <li>
                  <button
                    onClick={() => setCurrentPage(0)}
                    className={`px-3 py-1.5 rounded-md border ${
                      currentPage === 0
                        ? "bg-blue-600 text-white"
                        : "border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    1
                  </button>
                </li>
                <li>
                  <span className="px-2 text-gray-400">...</span>
                </li>
              </>
            )}

            {/* Middle Pages */}
            {Array.from({ length: pages }, (_, index) => {
              if (index < startPage || index > endPage) return null;
              return (
                <li key={index}>
                  <button
                    onClick={() => setCurrentPage(index)}
                    className={`px-3 py-1.5 rounded-md border ${
                      currentPage === index
                        ? "bg-blue-600 text-white"
                        : "border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {index + 1}
                  </button>
                </li>
              );
            })}

            {/* Last Page + Ellipsis */}
            {endPage < pages - 1 && (
              <>
                <li>
                  <span className="px-2 text-gray-400">...</span>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPage(pages - 1)}
                    className={`px-3 py-1.5 rounded-md border ${
                      currentPage === pages - 1
                        ? "bg-blue-600 text-white"
                        : "border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {pages}
                  </button>
                </li>
              </>
            )}

            {/* Next Button */}
            <li>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= pages - 1}
                className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                <span>Next</span>
                <ChevronRight size={16} className="ml-1" />
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Pagination;
