<script lang="ts" setup>
import { useUserStore } from '@/stores/user.store';
import { computed, onMounted, ref } from 'vue';
import AddUserDialog from '@/components/user/AddUserDialog.vue';
import EditUserDialog from '@/components/user/EditUserDialog.vue';
import type { User } from '@/types/user.type';

const userStore = useUserStore();
const addUserDialog = ref(false);

onMounted(async () => {
  await userStore.getAllUsers();
});

const openEditUserDialog = (user: User) => {
  userStore.setUserForEdit(user);
  userStore.updateUserDialog = true;
};

const handleSearchKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    // Optionally, you could trigger search here if needed
  }
};

const filteredUsers = computed(() => {
  if (!userStore.searchQuery) {
    return userStore.users;
  }
  return userStore.users.filter(user =>
    user.userName.toLowerCase().includes(userStore.searchQuery.toLowerCase())
  );
});

</script>

<template>
  <AddUserDialog v-model:dialog="addUserDialog"></AddUserDialog>
  <EditUserDialog v-model:dialog="userStore.updateUserDialog" :user="userStore.user"></EditUserDialog>

  <v-container>
    <v-card class="flex-container">
      <v-card-title>
        <v-row>
          <v-col cols="9" style="padding: 20px;">
          <h3>จัดการผู้ใช้งาน</h3>
          </v-col>
   
          <v-row style="margin-left: 6%;">
            <v-col class="pa-2 ma-2" cols="3">
              <v-text-field
                v-model="userStore.searchQuery"
                label="ค้นหาผู้ใช้งาน"
                append-inner-icon="mdi-magnify"
                hide-details
                dense
                @keydown="handleSearchKeydown"
              ></v-text-field>
            </v-col>
            
            <v-spacer></v-spacer>
            <v-col class="mt-4" cols="3" width="30%">
              <v-btn color="success" @click="addUserDialog = true">
                <v-icon left>mdi-plus</v-icon>
                เพิ่มผู้ใช้งาน
              </v-btn>
            </v-col>
          </v-row>
          
        </v-row>
        
        <v-spacer> </v-spacer>
      </v-card-title>
      <v-card width="90%" style="margin-left: 5%; margin-top: 3%;">
        <v-table class="text-center">
          <thead>
            <tr>
              <th class="text-center"></th>
              <th class="text-center">ชื่อผู้ใช้</th>
              <th class="text-center">อีเมล</th>
              <th class="text-center">สถานะผู้ใช้งาน</th>
              <th class="text-center">ตำแหน่งผู้ใช้งาน</th>
              <th class="text-center">Operations</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in filteredUsers" :key="index">
              <td class="text-center">{{ index + 1 }}</td>
              <td class="text-center">{{ item.userName }}</td>
              <td class="text-center">{{ item.userEmail }}</td>
              <td class="text-center">{{ item.userStatus }}</td>
              <td class="text-center">{{ item.userRole }}</td>
              <td class="text-center">
                <v-btn color="#FFDD83" icon="mdi-pencil" @click="openEditUserDialog(item)"></v-btn>
              </td>
            </tr>
          </tbody>
          <tbody v-if="!filteredUsers.length">
            <tr>
              <td colspan="6" class="text-center">No data</td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
    </v-card>
  </v-container>
</template>

<style scoped>
.flex-container {
  display: flex;
  flex-direction: column;
  height: 95vh;
}
</style>
