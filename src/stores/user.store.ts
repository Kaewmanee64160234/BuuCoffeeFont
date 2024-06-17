import { ref } from "vue";
import { defineStore } from "pinia";
import type { User } from "@/types/user.type";
import userService from "@/service/user.service";

export const useUserStore = defineStore("user", () => {
  const currentUser = ref<User>({
    userId: -1,
    userName: "",
    userPassword: "",
    userRole: "",
    userEmail: "",
    userStatus: "",
  });
  const users = ref<User[]>([]);
  const user = ref<User | null>(null);
  const searchQuery = ref<string>("");
  const updateUserDialog = ref(false);
  const userRole = ref("พนักงานขายข้าว");
  // const userRole = ref("พนักงานขายกาแฟ");
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
      }
    } catch (error) {
      console.error(error);
    }
  };

  const setUserForEdit = (userToEdit: User) => {
    user.value = userToEdit;
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
    setUserForEdit,
    currentUser,
    setUser, 
    getUser,
    userRole
  };
});
