"use client";
import React, { useEffect, useState } from "react";
import SearchBar from "@/components/searchbar";
import DynamicTable from "@/components/table/transaksi";
import { toast } from "react-hot-toast";
import ProtectedRoute from "@/components/protectedRoutes";

type Employee = {
  pegawai_id?: number; // Primary Key dari Prisma Schema
  name: string; // Nama Pegawai
  username: string; // Username Pegawai (Unique)
  password: string; // Password Pegawai
  role_id: number; // Role ID Pegawai
  role_name?: string; // Nama Role (optional untuk tampilan)
  index?: number; // Untuk keperluan tampilan (No urut)
};

const PegawaiPage = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [newEmployee, setNewEmployee] = useState<Employee>({
    name: "",
    username: "",
    password: "",
    role_id: 1,
  });
  const [roles, setRoles] = useState<{ role_id: number; name: string }[]>([]); // List Role
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const employeeColumns = [
    { header: "No", accessor: "index" },
    { header: "Nama Pegawai", accessor: "name" },
    { header: "Username", accessor: "username" },
    { header: "Role", accessor: "role_name" },
  ];

  // Fetch data Pegawai dari API
  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/pegawai"); // Endpoint API Pegawai
      const data: Employee[] = await response.json();
      const employeesWithIndex = data.map((item, index) => ({
        ...item,
        index: index + 1,
      }));
      setEmployees(employeesWithIndex);
      setFilteredEmployees(employeesWithIndex);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    }
  };

  // Fetch data Role untuk Dropdown
  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/role"); // Endpoint API Role
      const data = await response.json();
      console.log(data);
      setRoles(data);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    }
  };

  // Trigger fetch saat komponen di-mount
  useEffect(() => {
    fetchEmployees();
    fetchRoles();
  }, []);

  // Filter berdasarkan query pencarian
  useEffect(() => {
    const filtered = employees.filter(
      (employee) =>
        employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredEmployees(filtered);
  }, [searchQuery, employees]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleAdd = () => {
    setIsModalOpen(true);
    setIsEditMode(false);
    setNewEmployee({
      name: "",
      username: "",
      password: "",
      role_id: roles[0]?.role_id || 1,
    });
  };

  const handleEdit = (pegawai_id: number) => {
    setSelectedId(pegawai_id);
    const employee = employees.find((e) => e.pegawai_id === pegawai_id);
    if (employee) {
      setIsEditMode(true);
      setNewEmployee(employee);
      setIsModalOpen(true);
    }
  };

  const handleDelete = (pegawai_id: number) => {
    setSelectedId(pegawai_id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedId !== null) {
      try {
        await fetch("/api/pegawai", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pegawai_id: selectedId }),
        });
        const updatedEmployees = employees
          .filter((employee) => employee.pegawai_id !== selectedId)
          .map((item, index) => ({ ...item, index: index + 1 }));
        setEmployees(updatedEmployees);
        setFilteredEmployees(updatedEmployees);
        setIsDeleteConfirmOpen(false);
        setSelectedId(null);
        toast.success("Pegawai berhasil dihapus!");
      } catch (error) {
        console.error("Failed to delete employee:", error);
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewEmployee({
      name: "",
      username: "",
      password: "",
      role_id: roles[0]?.role_id || 1,
    });
    setErrorMessage("");
  };

  const handleModalSubmit = async () => {
    const { name, username, password, role_id } = newEmployee;

    // Validasi
    if (!name.trim() || !username.trim() || !password.trim()) {
      setErrorMessage("Semua field harus diisi.");
      return;
    }

    try {
      if (isEditMode && selectedId !== null) {
        const response = await fetch("/api/pegawai", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pegawai_id: selectedId, ...newEmployee }),
        });
        const updatedEmployee = await response.json();
        const updatedEmployees = employees.map((employee) =>
          employee.pegawai_id === selectedId ? updatedEmployee : employee
        );
        setEmployees(updatedEmployees);
        setFilteredEmployees(updatedEmployees);
        toast.success("Pegawai berhasil diperbarui!");
      } else {
        const response = await fetch("/api/pegawai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newEmployee),
        });
        if (response.status === 409) {
          toast.error("Username harus unik!");
          return;
        }
        const newCreatedEmployee = await response.json();
        setEmployees([...employees, newCreatedEmployee]);
        setFilteredEmployees([...employees, newCreatedEmployee]);
        toast.success("Pegawai berhasil ditambahkan!");
      }
      handleModalClose();
    } catch (error) {
      console.error("Failed to save employee:", error);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["owner"]}>
      <div className="p-6">
        <SearchBar onSearch={handleSearch} onAdd={handleAdd} />
        <DynamicTable
          columns={employeeColumns}
          data={filteredEmployees}
          onEdit={handleEdit}
          onDelete={handleDelete}
          idAccessor="pegawai_id"
        />

        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-[600px] p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  {isEditMode ? "Edit Pegawai" : "Tambah Pegawai"}
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
                  Nama Pegawai
                </label>
                <input
                  type="text"
                  placeholder="Nama Pegawai"
                  className="border border-gray-300 rounded-md w-full p-2 mb-3"
                  value={newEmployee.name}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, name: e.target.value })
                  }
                />
                <label className="block text-sm font-medium mb-1">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Username"
                  className="border border-gray-300 rounded-md w-full p-2 mb-3"
                  value={newEmployee.username}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, username: e.target.value })
                  }
                />
                <label className="block text-sm font-medium mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Password"
                  className="border border-gray-300 rounded-md w-full p-2 mb-3"
                  value={newEmployee.password}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, password: e.target.value })
                  }
                />
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  className="border border-gray-300 rounded-md w-full p-2"
                  value={newEmployee.role_id}
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      role_id: parseInt(e.target.value),
                    })
                  }
                >
                  {roles.map((role) => (
                    <option key={role.role_id} value={role.role_id}>
                      {role.name}
                    </option>
                  ))}
                </select>
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
              <p>Are you sure you want to delete this employee?</p>
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
    </ProtectedRoute>
  );
};

export default PegawaiPage;
