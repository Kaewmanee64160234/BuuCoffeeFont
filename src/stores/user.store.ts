import { ref } from "vue";
import { defineStore } from "pinia";
import type { User } from "@/types/user.type";
import userService from "@/service/user.service";

export const useUserStore = defineStore("user", () => {
  const currentUser = ref<User>({
    userId: -1,
    userName: '',
    userPassword: '',
    userRole: '',
    userEmail: '',
    userStatus: '',
  });
  const users = ref<User[]>([]);
  const user = ref<User | null>(null);
  const searchQuery = ref<string>("");
  const updateUserDialog = ref(false);
  const createUserDialog = ref(false);
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
        users.value.push(response.data);
        await getAllUsers(); // Ensure that all users are fetched again
        user.value = null;
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
  };
});
