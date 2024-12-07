<script lang="ts" setup>
import { useUserStore } from '@/stores/user.store';
import { computed, onMounted, ref } from 'vue';
import AddUserDialog from '@/components/user/AddUserDialog.vue';
import EditUserDialog from '@/components/user/EditUserDialog.vue';
import DetailUserDialog from '@/components/user/DetailUserDialog.vue';
import { watch } from 'vue';
import { useAuthorizeStore } from '@/stores/autorize.store';
import type { User } from '@/types/authentorize/user.type';

const userStore = useUserStore();
const authorizeStore = useAuthorizeStore();
watch(() => userStore.searchQuery, async (newQuery) => {
  await userStore.getAllUsers();
});

onMounted(async () => {
  await userStore.getAllUsers();
  await authorizeStore.getRoles();
});

const openEditUserDialog = (user: User) => {
  userStore.setUserForEdit(user);
  userStore.updateUserDialog = true;
};

const openDetailUserDialog = (user: User) => {
  console.log(user)
  userStore.user = user;
  userStore.detailUserDialog = true;
};

const handleSearchKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    // Optionally, you could trigger search here if needed
  }
};

const filteredUsers = computed(() => {
  let filtered = userStore.users;

  if (userStore.searchQuery) {
    filtered = filtered.filter(user =>
      user.userName.toLowerCase().includes(userStore.searchQuery.toLowerCase())
    );
  }

  const start = (userStore.currentPage - 1) * userStore.itemsPerPage;
  const end = start + userStore.itemsPerPage;

  return filtered.slice(start, end);
});
</script>

<template>
  <AddUserDialog v-model:dialog="userStore.createUserDialog"></AddUserDialog>
  <EditUserDialog v-model:dialog="userStore.updateUserDialog" :user="userStore.user"></EditUserDialog>
  <DetailUserDialog v-model:dialog="userStore.detailUserDialog" :user="userStore.user"></DetailUserDialog>

  <v-container>
    <v-card class="fit-content">
      <v-card-title>
        <v-row>
          <v-col cols="12" style="padding: 20px;">
            <h3>จัดการผู้ใช้งาน</h3>
          </v-col>
   
          <v-row class="mt-4 ml-2 mb-2">
            <v-col class="pa-2 mr-8" cols="12" sm="6" md="3">
              <v-text-field
                v-model="userStore.searchQuery"
                label="ค้นหาผู้ใช้งาน"
                append-inner-icon="mdi-magnify"
                dense hide-details variant="solo"
                outlined
                @keydown="handleSearchKeydown"
              ></v-text-field>
            </v-col>
            
            <v-spacer></v-spacer>
            <v-col class="mt-4" cols="12" sm="6" md="3">
              <v-btn color="success" @click="userStore.createUserDialog = true" style="font-size: 16px;">
                <v-icon left>mdi-plus</v-icon>
                เพิ่มผู้ใช้งาน
              </v-btn>
            </v-col>
          </v-row>
          
        </v-row>
        
        <v-spacer> </v-spacer>
      </v-card-title>

      <v-responsive>
        <v-table class="mx-auto" style="width: 97%;">
          <thead>
            <tr>
              <th class="text-center" style="font-size: 16px;font-weight: bold;">รหัสผู้ใช้งาน</th>
              <th class="text-center" style="font-size: 16px; font-weight: bold;">ชื่อผู้ใช้</th>
              <th class="text-center" style="font-size: 16px; font-weight: bold;">อีเมล</th>
              <th class="text-center" style="font-size: 16px; font-weight: bold;">สถานะผู้ใช้งาน</th>
              <th class="text-center" style="font-size: 16px; font-weight: bold;">ตำแหน่งผู้ใช้งาน</th>
              <th class="text-center" style="font-size: 16px; font-weight: bold;">การกระทำ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in filteredUsers" :key="index">
              <td class="text-center" style="font-size: 16px;">{{ index + 1 + (userStore.currentPage - 1) * userStore.itemsPerPage }}</td>
              <td class="text-center" style="font-size: 16px;">{{ item.userName }}</td>
              <td class="text-center" style="font-size: 16px;">{{ item.userEmail }}</td>
              <td class="text-center" style="font-size: 16px;">{{ item.userStatus }}</td>
              <td class="text-center" style="font-size: 16px;">{{ item.userRole }}</td>
              <td class="text-center" style="font-size: 16px;" >
                <v-btn color="#ed8731 " class="mr-2" icon="mdi-pencil"><v-icon
                  color="white" style="font-size: 20px;" @click="openDetailUserDialog(item)">mdi-eye-circle</v-icon></v-btn>
                <v-btn color="#FFDD83" icon="mdi-pencil" @click="openEditUserDialog(item)"></v-btn>
                
              </td>
            </tr>
            <tr v-if="!filteredUsers.length">
              <td colspan="6" class="text-center" style="font-size: 16px;">No data</td>
            </tr>
          </tbody>
        </v-table>
      </v-responsive>

      <v-pagination
        justify="center"
        v-model="userStore.currentPage"
        :length="Math.ceil(userStore.totalUsers / userStore.itemsPerPage)"
        rounded="circle"
      ></v-pagination>
    </v-card>
  </v-container>
</template>

<style scoped>
.flex-container {
  display: flex;
  flex-direction: column;
  height: 95vh;
}

@media (max-width: 768px) {
  .fit-content {
    width: 100%;
    overflow-x: auto;
  }

  v-table {
    font-size: 0.8rem;
  }

  v-btn {
    min-width: 32px;
    height: 32px;
  }

  h3 {
    font-size: 1.2rem;
  }
}
</style>
