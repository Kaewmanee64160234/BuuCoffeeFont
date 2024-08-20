<script lang="ts" setup></script>
<template>
      <v-container fluid style="padding-left: 80px;">
    <v-card-title>
      <v-row>
        <v-col cols="9" style="padding: 20px;">
          <h3>วัตถุดิบหมดอายุ</h3>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="auto">
          <v-btn color="success" :to="{ name: 'ingredients' }">
            รายการวัตถุดิบ
          </v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn color="warning" :to="{ name: 'checkingredientHistory' }">
            ประวัติวัตถุดิบหมดอายุ
          </v-btn>
        </v-col>


      </v-row>
      <v-spacer></v-spacer>

    </v-card-title>
    </v-container>

</template>