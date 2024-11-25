import { ref, watch } from "vue";
import { defineStore } from "pinia";
import type { Role } from "@/types/authentorize/role.type";
import userService from "@/service/user.service";
import { mapToUser, type User } from "@/types/authentorize/user.type";

export const useUserStore = defineStore("user", () => {
  const currentUser = ref<User>({
    userId: -1,
    userName: '',
    userPassword: '',
    userRole: '',
    userEmail: '',
    userStatus: '',
    role: '' as Role,      // เพิ่ม property นี้
    groups: []     // เพิ่ม property นี้
  });
  const users = ref<User[]>([]);
  const user = ref<User | null>(null);
  const searchQuery = ref<string>("");
  const updateUserDialog = ref(false);
  const createUserDialog = ref(false);
  const detailUserDialog = ref(false);
  const userRole = ref("พนักงานขายกาแฟ");

  const currentPage = ref(1); // Current page number
  const itemsPerPage = ref(5); // Number of items per page
  const totalUsers = ref(0); // Total number of users

  function setUser(user: User) {
    currentUser.value = { ...user };
    localStorage.setItem('user', JSON.stringify(user));
  }

  function getUser() {
    const userString = localStorage.getItem('user');
    if (userString) {
      return JSON.parse(userString) as User;
    }
    return currentUser.value;
  }

  const getAllUsers = async () => {
    try {
      const response = await userService.getAllUsers();
      if (response.status === 200) {
        users.value = response.data;
        totalUsers.value = users.value.length; // Update total users count
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getUserById = async (id: number) => {
    try {
      const response = await userService.getUserById(id);
      if (response.status === 200) {
        user.value = response.data;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const createUser = async (newUser: User) => {
    try {
      const response = await userService.createUser(newUser);
      if (response.status === 201) {
        users.value.push(response.data); // เพิ่มผู้ใช้ใหม่เข้าในลิสต์โดยตรง
        totalUsers.value += 1; // อัปเดตจำนวนผู้ใช้ทั้งหมด
  
        // ตรวจสอบว่ามีผู้ใช้เกินจำนวนที่แสดงต่อหน้าได้หรือไม่
        const totalPages = Math.ceil(totalUsers.value / itemsPerPage.value);
        if (currentPage.value < totalPages) {
          currentPage.value = totalPages; // เปลี่ยนไปยังหน้าสุดท้าย
        }
  
        // ตรวจสอบถ้าเราอยู่ในหน้าสุดท้าย ให้เรียกเพจจิเนชันเพื่อโหลดข้อมูลผู้ใช้ทั้งหมดใหม่
        if (users.value.length > currentPage.value * itemsPerPage.value) {
          await getUserPaginate();
        }
      }
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  

  const updateUser = async (id: number, updatedUser: User) => {
    try {
      const response = await userService.updateUser(id, updatedUser);
      if (response.status === 200) {
        const updatedUser = response.data;
        const index = users.value.findIndex((user) => user.userId === id);
        if (index !== -1) {
          users.value[index] = updatedUser;
        }
        user.value = null;
        return updatedUser;
      }
      await getUserPaginate();
    } catch (error) {
      console.error("Failed to update user:", error);
      throw error;
    }
  };

  const deleteUser = async (id: number) => {
    try {
      const response = await userService.deleteUser(id);
      if (response.status === 200) {
        users.value = users.value.filter((user) => user.userId !== id);
        totalUsers.value = users.value.length; // Update total users count
      }
    } catch (error) {
      console.error(error);
    }
  };

  const setUserForEdit = (userToEdit: User) => {
    user.value = userToEdit;
  };

  const getCurrentUser = async () => {
    try {
      const user = localStorage.getItem('user');
      if (user) {
        currentUser.value = JSON.parse(user);
      }
    } catch (error) { 
      console.error('Error getting current user:', error);
    }
  };

  const resetUserForm = () => {
    user.value = null;
    userRole.value = "พนักงานขายกาแฟ"; // Default role
  };

  // watch productStore.currentPage
  watch([currentPage, itemsPerPage, searchQuery], () => {
    getUserPaginate();
  });

  // getuser pageginate
  const getUserPaginate = async () => {
    try {
      const response = await userService.getUserPaginate(
        currentPage.value,
        itemsPerPage.value,
        searchQuery.value
      );
      console.log("getUserPaginate", response.data);
      if (response.status === 200) {
        users.value = response.data.data.map((user: any) =>
          mapToUser(user)
        );
        console.log("users", users.value);
        totalUsers.value = response.data.total;
      }
    } catch (error) {
      // console.error(error);
      console.log("error", error);
    }
  };
  return {
    users,
    user,
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    searchQuery,
    updateUserDialog,
    createUserDialog,
    setUserForEdit,
    currentUser,
    setUser, 
    getUser,
    userRole,
    getCurrentUser,
    resetUserForm,
    currentPage,
    itemsPerPage,
    totalUsers,
    detailUserDialog,
    getUserPaginate
  };
});
