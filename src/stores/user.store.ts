import { ref, watch } from "vue";
import { defineStore } from "pinia";
import type { User } from "@/types/user.type";
import userService from "@/service/user.service";
import AddUserDialog from "@/components/user/AddUserDialog.vue";

export const useUserStore = defineStore("user", () => {
  const users = ref<User[]>([]);
  const user = ref<User | null>(null);
  const searchQuery = ref<string>("");
  const updateUserDialog = ref(false);


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
  const createUser = async (newUser: User) => {
    try {
      const response = await userService.createUser(newUser);
      if (response.status === 201) {
        console.log('createUser', response.data);
        users.value.push(response.data);
        await getAllUsers();
      }
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  //update user
  const updateUser = async (id: number, updatedUser: User) => {
    try {
      const response = await userService.updateUser(id, updatedUser);
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

  const sortUsers = (order: string) => {
    if (order === 'latest') {
      users.value.sort((a, b) => b.userId - a.userId);
    } else if (order === 'oldest') {
      users.value.sort((a, b) => a.userId - b.userId);
    }
  };

  const filterUsers = (status: string) => {
    if (status === 'resigned') {
      return users.value.filter(user => user.userStatus === 'ลาออกแล้ว');
    } else if (status === 'active') {
      return users.value.filter(user => user.userStatus === 'ยังไม่ลาออก');
    }
    return users.value;
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
    sortUsers,
    filterUsers,
    updateUserDialog
  };
});
