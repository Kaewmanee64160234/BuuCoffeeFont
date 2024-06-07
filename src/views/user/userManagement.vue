<script lang="ts" setup>
import {useUserStore} from '@/stores/user.store';
import { computed, onMounted, ref, watch } from 'vue'
import AddUserDialog from '@/components/user/AddUserDialog.vue';

const userStore = useUserStore()
const url = import.meta.env.VITE_URL_PORT
const paginate = ref(true)
const addUserDialog = ref(false)
onMounted(async () => {
    await userStore.getAllUsers()
})


</script>
<template>
  <!-- <ConfirmDialog ref="confirmDlg"></ConfirmDialog> -->
  <AddUserDialog v-model:dialog="addUserDialog"></AddUserDialog>

  <v-container >
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
              
              <v-col cols="3" class="pa-2 mt-2">
                <v-flex>
                  <!-- <input type="text" placeholder="หลักสูตร" class="placeholder-color forumSize0" /> -->
                  <v-select
                    class="placeholder-color forumSize0"
                    style="font-size: 35px; margin-left: 5%;"
                    label="จัดเรียงตาม" 
                    :items="[
                      'ข้อมูลล่าสุด -> เก่าสุด',
                      'ผู้ใช้งานที่ลาออกแล้ว',
                      'ผู้ใช้งานที่ยังไม่ลาออก',
                    ]"
                  >
                  </v-select>
                  
                </v-flex>
                
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

          <v-spacer> </v-spacer>
      </v-card-title>
      <v-card width="90%" style="margin-left: 5%; margin-top: 3%;">
        <v-table class="text-center">
          <thead>
            <tr>
              <th></th>
              <th>ชื่อผู้ใช้</th>
              <th>อีเมลล์</th>
              <th>สถานะผู้ใช้งาน</th>
              <th>ตำแหน่งผู้ใช้งาน</th>
              <th>Operations</th>
            </tr>
          </thead>
          <tbody>
            <tr style="text-align: center" v-for="(item, index) in userStore.users" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{item.userName}}</td>
              <td>{{item.userEmail}}</td>
              <td>{{item.userStatus}}</td>
              <td>{{item.userRole}}</td>
              <td>
                <v-btn color="#FFDD83" class="mr-5" icon="mdi-pencil" ></v-btn>
              </td>
            </tr>
          </tbody>
  
          <tbody v-if="!userStore.users">
            <tr>
              <td colspan="7" class="text-center">No data</td>
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
  flex-direction: column; /* ปรับให้เนื้อหาวางแนวตั้ง */
  height: 95vh; /* ปรับความสูงให้เต็มหน้าจอ */
}
</style>