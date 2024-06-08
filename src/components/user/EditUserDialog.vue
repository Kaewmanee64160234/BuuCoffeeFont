<script lang="ts" setup>
import { useUserStore } from '@/stores/user.store';
import { computed, onMounted, ref, watch } from 'vue';
import AddUserDialog from '@/components/user/AddUserDialog.vue';

const userStore = useUserStore();
const addUserDialog = ref(false);
const currentUserId = ref<number | null>(null);

const openDialog = async (userId: number) => {
  currentUserId.value = userId;
  await userStore.getUserById(userId);
  addUserDialog.value = true;
};

onMounted(async () => {
  await userStore.getAllUsers();
});

const filteredUsers = computed(() => {
  let users = userStore.users;
  // Add any filtering logic here if needed
  return users;
});

const saveUser = async () => {
  if (currentUserId.value !== null) {
    await userStore.updateUser(currentUserId.value, userStore.user);
    addUserDialog.value = false;
    await userStore.getAllUsers();
  }
};

</script>

<template>
  <AddUserDialog v-model:dialog="addUserDialog" :user="userStore.user" @save="saveUser"></AddUserDialog>

  <v-container>
    <v-card class="flex-container">
      <v-card-title>
        <v-row>
          <v-col cols="9" style="font-size: 35px;">
            จัดการผู้ใช้งาน
          </v-col>
          <v-row style="margin-left: 6%;">
            <v-col class="pa-2 ma-2" cols="3">
              <v-text-field
                v-model="userStore.searchQuery"
                label="ค้นหาผู้ใช้งาน"
                append-inner-icon="mdi-magnify"
                hide-details
                dense
              ></v-text-field>
            </v-col>
            <v-col class="pa-2 mt-2" cols="3">
              <v-select
                v-model="sortOrder"
                class="placeholder-color forumSize0"
                style="font-size: 35px; margin-left: 5%;"
                label="จัดเรียงตาม/สถานะผู้ใช้งาน"
                :items="[
                  { label: 'ข้อมูลล่าสุด -> เก่าสุด', value: 'latest' },
                  { label: 'ข้อมูลเก่าสุด -> ล่าสุด', value: 'oldest' },
                  { label: 'ผู้ใช้งานที่ลาออกแล้ว', value: 'resigned' },
                  { label: 'ผู้ใช้งานที่ยังไม่ลาออก', value: 'active' }
                ]"
                item-text="label"
                item-value="value"
              ></v-select>
            </v-col>
            <v-spacer></v-spacer>
            <v-col class="mt-4" cols="3" width="30%">
              <v-btn color="success" @click="addUserDialog = true">
                <v-icon left>mdi-plus</v-icon>
                Add New User
              </v-btn>
            </v-col>
          </v-row>
        </v-row>
        <v-spacer></v-spacer>
      </v-card-title>
      <v-card width="90%" style="margin-left: 5%; margin-top: 3%;">
        <v-table class="text-center">
          <thead>
            <tr>
              <th class="text-center"></th>
              <th class="text-center">ชื่อผู้ใช้</th>
              <th class="text-center">อีเมลล์</th>
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
                <v-btn color="#FFDD83" icon="mdi-pencil" @click="openDialog(item.userId)"></v-btn>
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

<style>
.flex-container {
  display: flex;
  flex-direction: column;
  height: 95vh;
}
</style>
