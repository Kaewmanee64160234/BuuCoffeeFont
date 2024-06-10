import { ref } from "vue";
import { defineStore } from "pinia";
import type { User } from "@/types/user.type";
import userService from "@/service/user.service";

export const useUserStore = defineStore("user", () => {
  const users = ref<User[]>([]);
  const user = ref<User | null>(null);
  const searchQuery = ref<string>("");
  const updateUserDialog = ref(false);

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
        await getAllUsers();
      }
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const updateUser = async (id: number, updatedUser: User) => {
    try {
      const response = await userService.updateUser(id, updatedUser);
      if (response.status === 200) {
        const index = users.value.findIndex(user => user.userId === id);
        if (index !== -1) {
          users.value[index] = response.data;
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deleteUser = async (id: number) => {
    try {
      const response = await userService.deleteUser(id);
      if (response.status === 200) {
        users.value = users.value.filter(user => user.userId !== id);
      }
    } catch (error) {
      console.error(error);
    }
  };


  const setUserForEdit = (selectedUser: User) => {
    user.value = selectedUser;
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
    setUserForEdit
  };
});
