import React from 'react';

type SearchBarProps = {
    onSearch: (query: string) => void;
    onAdd: () => void;
};

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onAdd }) => {
    return (
        <div className="flex items-center space-x-2 p-4 bg-[#fbf9ee] rounded-md shadow-md">
            <h2 className="text-lg font-semibold">Kelola Transaksi</h2>
            <input
                type="text"
                placeholder="Cari barang"
                className="flex-grow p-2 border border-gray-300 rounded-md"
                onChange={(e) => onSearch(e.target.value)}
            />
            <button
                onClick={onAdd}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
                Tambah
            </button>
        </div>
    );
};

export default SearchBar;
