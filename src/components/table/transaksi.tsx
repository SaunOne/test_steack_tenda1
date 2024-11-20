import React from 'react';

type TableColumn = {
    header: string;
    accessor: string;
    render?: (row: any) => React.ReactNode;
};

type DynamicTableProps = {
    columns: TableColumn[];
    data: Record<string, any>[];
    onEdit?: (id: number) => void;
    onDelete?: (id: number) => void;
    idAccessor: string;
};

const DynamicTable: React.FC<DynamicTableProps> = ({ columns, data, onEdit, onDelete, idAccessor }) => {
    return (
        <div className="p-4 bg-white rounded-md shadow-md">
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col.accessor} className="p-2 border-b text-center">
                                {col.header}
                            </th>
                        ))}
                        <th className="p-2 border-b text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row) => (
                        <tr key={row[idAccessor]} className="odd:bg-gray-100 even:bg-white">
                            {columns.map((col) => (
                                <td key={col.accessor} className="p-2 border-b text-center">
                                    {col.render ? col.render(row) : row[col.accessor]}
                                </td>
                            ))}
                            <td className="p-2 border-b text-center space-x-2">
                                <button
                                    onClick={() => onEdit && onEdit(row[idAccessor])}
                                    disabled={!onEdit}
                                    className={`px-2 py-1 rounded-md ${
                                        onEdit
                                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => onDelete && onDelete(row[idAccessor])}
                                    disabled={!onDelete}
                                    className={`px-2 py-1 rounded-md ${
                                        onDelete
                                            ? 'bg-red-500 text-white hover:bg-red-600'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DynamicTable;
