import { ref, watch } from "vue";
import { defineStore } from "pinia";
import type { User } from "@/types/user.type";
import userService from "@/service/user.service";

export const useUserStore = defineStore("user", () => {
  const users = ref<User[]>();
  const user = ref<User>();
  const searchQuery = ref<string>("");
  


  const getAllUsers = async () => {
    try {
      const response = await userService.getAllUsers();
      if (response.status === 200) {
        console.log('getAllUsers', response.data);
        users.value = response.data;
      }
    } catch (error) {
      console.error(error);
    }
  };

  //get User by id
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

  //create user
  const createUser = async (user: User) => {
    try {
      const response = await userService.createUser(user);
      if (response.status === 201) {
        users.value = response.data;
      }
    } catch (error) {
      console.error(error);
    }
  };

  //update user
  const updateUser = async (id: number, user: User) => {
    try {
      const response = await userService.updateUser(id, user);
      if (response.status === 200) {
        users.value = response.data;
      }
    } catch (error) {
      console.error(error);
    }
  };

  //delete user
  const deleteUser = async (id: number) => {
    try {
      const response = await userService.deleteUser(id);
      if (response.status === 200) {
        users.value = response.data;
      }
    } catch (error) {
      console.error(error);
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
  };
});
