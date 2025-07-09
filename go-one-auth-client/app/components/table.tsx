import React, { useState } from "react";
import Pagination from "./pagination";
import { useSearchParams } from "react-router";
import { ArrowDownUpIcon, ArrowUpNarrowWide, ArrowDownNarrowWide, Search } from "lucide-react";

interface Header {
  key: string;
  label: string;
  sort?: boolean;
  isDate?: boolean;
  search?: boolean;
  highlight?: boolean;
}

interface FilterOption {
  label: string;
  value: string;
}

interface FilterProp {
  label: string;
  key: string;
  values: FilterOption[];
}

interface TableProps {
  customHeaders: Header[];
  rows: Array<{ [key: string]: any }>;
  displayActions?: (row: { [key: string]: any }) => JSX.Element;
  pages?: number;
  currentPage?: number;
  search?: boolean;
  tableInfo?: boolean;
  totalCount?: number;
  filters?: FilterProp[];
}

const Table: React.FC<TableProps> = ({
  customHeaders,
  rows,
  displayActions,
  pages = 1,
  currentPage = 0,
  search,
  tableInfo,
  totalCount,
  filters
}) => {
  const [searchParam, setSearchParam] = useSearchParams();
  const [searchValue, setSearchValue] = useState<string>("");
  const [editingFilter, setEditingFilter] = useState<string | null>(null);
  const [filterInputs, setFilterInputs] = useState<Record<string, string>>({});

  const getSortMap = () => {
    const sortString = searchParam.get("sort") || "";
    const sortMap: Record<string, "asc" | "desc"> = {};
    sortString.split(",").forEach((s) => {
      const [field, direction] = s.split(":");
      if (field && direction) sortMap[field] = direction as "asc" | "desc";
    });
    return sortMap;
  };

  const getFilterMap = () => {
    const filterString = searchParam.get("filters") || "";
    const filterMap: Record<string, string> = {};
    filterString.split(",").forEach((f) => {
      const [key, value] = f.split(":");
      if (key && value) filterMap[key] = value;
    });
    return filterMap;
  };

  const updateFilterParam = (key: string, value: string) => {
    const filterMap = getFilterMap();
    if (value.trim()) filterMap[key] = value;
    else delete filterMap[key];

    const newFilterString = Object.entries(filterMap)
      .map(([k, v]) => `${k}:${v}`)
      .join(",");

    const params = new URLSearchParams(searchParam);
    if (newFilterString) params.set("filters", newFilterString);
    else params.delete("filters");
    setSearchParam(params);
  };

  const toggleSort = (key: string) => {
    const sortMap = getSortMap();
    const current = sortMap[key];

    if (!current) sortMap[key] = "asc";
    else if (current === "asc") sortMap[key] = "desc";
    else delete sortMap[key];

    const newSortString = Object.entries(sortMap)
      .map(([field, dir]) => `${field}:${dir}`)
      .join(",");

    const params = new URLSearchParams(searchParam);
    if (newSortString) params.set("sort", newSortString);
    else params.delete("sort");
    setSearchParam(params);
  };

  const sortMap = getSortMap();
  const filterMap = getFilterMap();

  return (
    <div className="w-full px-4 pb-8 overflow-x-auto">
      {/* Top controls: search + filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        {search && (
          <div className="flex gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Global Search..."
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full md:w-64"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setSearchParam((prev) => {
                    const p = new URLSearchParams(prev);
                    if (searchValue.trim()) p.set("search", searchValue);
                    else p.delete("search");
                    return p;
                  });
                }
              }}
            />
            <button
              type="button"
              onClick={() =>
                setSearchParam((prev) => {
                  const p = new URLSearchParams(prev);
                  if (searchValue.trim()) p.set("search", searchValue);
                  else p.delete("search");
                  return p;
                })
              }
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            >
              <Search size={16} /> Search
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {filters?.map((filter, i) => (
            <select
              key={filter.key}
              value={filterMap[filter.key] || ""}
              onChange={(e) => updateFilterParam(filter.key, e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white min-w-[200px]"
            >
              <option value="">{filter.label}</option>
              {filter.values.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full text-sm border-collapse">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              {customHeaders.map(({ label, key, sort, search }, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-left font-semibold border-b border-gray-300 whitespace-nowrap"
                >
                  <div
                    className={`flex items-center gap-2 ${search ? "cursor-pointer" : ""}`}
                    onClick={() => search && setEditingFilter(editingFilter === key ? null : key)}
                  >
                    {editingFilter === key ? (
                      <input
                        autoFocus
                        type="text"
                        value={filterInputs[key] ?? filterMap[key] ?? ""}
                        onChange={(e) =>
                          setFilterInputs((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                        placeholder={label}
                        onBlur={() => {
                          updateFilterParam(key, filterInputs[key] ?? "");
                          setEditingFilter(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            updateFilterParam(key, filterInputs[key] ?? "");
                            setEditingFilter(null);
                          }
                        }}
                        className="border border-gray-300 px-2 py-1 rounded-md text-sm"
                      />
                    ) : (
                      <>
                        <span>{label}</span>
                        {search && <Search size={14} className="text-gray-500" />}
                        {search && filterMap[key] && (
                          <span className="text-gray-500">({filterMap[key]})</span>
                        )}
                      </>
                    )}
                    {sort && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSort(key);
                        }}
                        className="text-gray-600 hover:text-black"
                      >
                        {sortMap[key] === "asc" && <ArrowUpNarrowWide size={16} />}
                        {sortMap[key] === "desc" && <ArrowDownNarrowWide size={16} />}
                        {!sortMap[key] && <ArrowDownUpIcon size={16} />}
                      </button>
                    )}
                  </div>
                </th>
              ))}
              {displayActions && (
                <th className="px-4 py-3 text-left font-semibold border-b border-gray-300">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={customHeaders.length + (displayActions ? 1 : 0)}
                  className="text-center py-6 text-gray-500"
                >
                  No data available
                </td>
              </tr>
            ) : (
              rows.map((row, rowIndex) => (
                <tr
                  key={row._id || rowIndex}
                  className="hover:bg-gray-50 transition"
                >
                  {customHeaders.map(({ key, isDate, highlight }, colIndex) => {
                    const raw = row[key];
                    const display = isDate && raw
                      ? new Date(raw).toDateString()
                      : raw ?? "";

                    return (
                      <td
                        key={colIndex}
                        className="px-4 py-3 border-b border-gray-200 max-w-sm whitespace-pre-wrap"
                      >
                        {highlight ? (
                          <span className="bg-gray-100 px-3 py-1 rounded-lg text-sm">
                            {display}
                          </span>
                        ) : (
                          display
                        )}
                      </td>
                    );
                  })}
                  {displayActions && (
                    <td className="px-4 py-3 border-b border-gray-200 whitespace-nowrap">
                      {displayActions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        pages={pages}
        currentPage={currentPage}
        totalCount={totalCount}
        tableInfo={tableInfo}
        currentLength={rows.length}
      />
    </div>
  );
};

export default Table;
