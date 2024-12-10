"use client";

import React, { useEffect, useState } from "react";
import SearchBar from "@/components/searchbar";
import DynamicTable from "@/components/table/transaksi";
import { toast } from "react-hot-toast";

type LevelMember = {
  level_member_id?: number; // Primary Key dari Prisma Schema
  name: string; // Nama Level Member
  diskon: number; // Diskon (%)
  minimum_point: number; // Minimum Point untuk Level Member
  index?: number; // Untuk keperluan tampilan (No urut)
};

const LevelMemberPage = () => {
  const [levelMembers, setLevelMembers] = useState<LevelMember[]>([]);
  const [filteredLevelMembers, setFilteredLevelMembers] = useState<
    LevelMember[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [newLevelMember, setNewLevelMember] = useState<LevelMember>({
    name: "",
    diskon: 0,
    minimum_point: 0,
  });
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const levelMemberColumns = [
    { header: "No", accessor: "index" },
    { header: "Nama Level Member", accessor: "name" },
    { header: "Diskon (%)", accessor: "diskon" },
    { header: "Minimum Point", accessor: "minimum_point" },
  ];

  // Fetch data dari API
  const fetchData = async () => {
    try {
      const response = await fetch("/api/level_member");
      const data: LevelMember[] = await response.json();
      const levelMembersWithIndex = data.map((item, index) => ({
        ...item,
        index: index + 1,
      }));
      setLevelMembers(levelMembersWithIndex);
      setFilteredLevelMembers(levelMembersWithIndex);
    } catch (error) {
      console.error("Failed to fetch level members:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = levelMembers.filter((lm) =>
      lm.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredLevelMembers(filtered);
  }, [searchQuery, levelMembers]);

  const handleSearch = (query: string) => setSearchQuery(query);

  const handleAdd = () => {
    setIsModalOpen(true);
    setIsEditMode(false);
    setNewLevelMember({ name: "", diskon: 0, minimum_point: 0 });
  };

  const handleEdit = (level_member_id: number) => {
    setSelectedId(level_member_id);
    const levelMember = levelMembers.find(
      (lm) => lm.level_member_id === level_member_id
    );
    if (levelMember) {
      setIsEditMode(true);
      setNewLevelMember(levelMember);
      setIsModalOpen(true);
    }
  };

  const handleDelete = (level_member_id: number) => {
    setSelectedId(level_member_id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedId !== null) {
      try {
        await fetch("/api/level_member", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ level_member_id: selectedId }),
        });
        const updatedLevelMembers = levelMembers
          .filter((lm) => lm.level_member_id !== selectedId)
          .map((item, index) => ({ ...item, index: index + 1 }));
        setLevelMembers(updatedLevelMembers);
        setFilteredLevelMembers(updatedLevelMembers);
        setIsDeleteConfirmOpen(false);
        setSelectedId(null);
        toast.success("Level Member berhasil dihapus!");
      } catch (error) {
        console.error("Failed to delete level member:", error);
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewLevelMember({ name: "", diskon: 0, minimum_point: 0 });
    setErrorMessage("");
  };

  const handleModalSubmit = async () => {
    const { name, diskon, minimum_point } = newLevelMember;

    if (!name || diskon === undefined || minimum_point === undefined) {
      setErrorMessage("Semua field harus diisi.");
      return;
    }
    if (diskon < 0 || diskon > 100) {
      setErrorMessage("Diskon harus antara 0% hingga 100%.");
      return;
    }
    if (minimum_point < 0) {
      setErrorMessage("Minimum Point tidak boleh bernilai negatif.");
      return;
    }

    try {
      if (isEditMode && selectedId !== null) {
        const response = await fetch("/api/level_member", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            level_member_id: selectedId,
            ...newLevelMember,
          }),
        });
        const updatedLevelMember = await response.json();
        const updatedLevelMembers = levelMembers.map((lm) =>
          lm.level_member_id === selectedId ? updatedLevelMember : lm
        );
        setLevelMembers(updatedLevelMembers);
        setFilteredLevelMembers(updatedLevelMembers);
        toast.success("Level Member berhasil diperbarui!");
      } else {
        const response = await fetch("/api/level_member", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newLevelMember),
        });
        const newCreatedLevelMember = await response.json();
        setLevelMembers([...levelMembers, newCreatedLevelMember]);
        setFilteredLevelMembers([...levelMembers, newCreatedLevelMember]);
        toast.success("Level Member berhasil ditambahkan!");
      }
      handleModalClose();
    } catch (error) {
      console.error("Failed to save level member:", error);
    }
  };

  return (
    <div className="p-6">
      <SearchBar onSearch={handleSearch} onAdd={handleAdd} />
      <DynamicTable
        columns={levelMemberColumns}
        data={filteredLevelMembers}
        onEdit={handleEdit}
        onDelete={handleDelete}
        idAccessor="level_member_id"
      />

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-[600px] p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {isEditMode ? "Edit Level Member" : "Tambah Level Member"}
              </h2>
              <button
                onClick={handleModalClose}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            {errorMessage && (
              <p className="text-red-500 text-sm mb-3">{errorMessage}</p>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Nama Level Member
              </label>
              <input
                type="text"
                placeholder="Nama Level Member"
                className="border border-gray-300 rounded-md w-full p-2 mb-3"
                value={newLevelMember.name}
                onChange={(e) =>
                  setNewLevelMember({ ...newLevelMember, name: e.target.value })
                }
              />
              <label className="block text-sm font-medium mb-1">
                Diskon (%)
              </label>
              <input
                type="number"
                placeholder="Diskon"
                className="border border-gray-300 rounded-md w-full p-2 mb-3"
                value={newLevelMember.diskon}
                onChange={(e) =>
                  setNewLevelMember({
                    ...newLevelMember,
                    diskon: parseInt(e.target.value),
                  })
                }
              />
              <label className="block text-sm font-medium mb-1">
                Minimum Point
              </label>
              <input
                type="number"
                placeholder="Minimum Point"
                className="border border-gray-300 rounded-md w-full p-2"
                value={newLevelMember.minimum_point}
                onChange={(e) =>
                  setNewLevelMember({
                    ...newLevelMember,
                    minimum_point: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleModalClose}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleModalSubmit}
                className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
              >
                {isEditMode ? "Update" : "Tambah"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-[400px] p-6">
            <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete this Level Member?</p>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LevelMemberPage;
