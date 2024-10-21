<script lang="ts" setup>
import { ref } from 'vue';
import ReportFinanceComponant from '@/components/reports/ReportFinanceComponant.vue';
import ReportIngredientComponant from '@/components/reports/ReportIngredientComponant.vue';
import ReportProductComponant from '@/components/reports/ReportProductComponant.vue';

const activeComponent = ref<string | null>(null);

function showComponent(component: string) {
  activeComponent.value = component;
}
activeComponent.value = 'finance'; 

function reloadData() {
}
</script>

<template>
  <v-container class="d-flex justify-center align-center fill-height">
    <v-card class="fill-width" max-width="1200px">
      <v-card-title class="text-center">
        <h3>Dashboard</h3>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4" class="my-1">
            <v-btn
              color="success"
              class="button-full-width"
              block
              @click="showComponent('finance')"
            >
              <v-icon left size="30">mdi-store</v-icon>
              รายงานยอดขาย
            </v-btn>
          </v-col>
          <v-col cols="12" md="4" class="my-1">
            <v-btn
              color="success"
              class="button-full-width"
              block
              @click="showComponent('ingredient')"
            >
              <v-icon left size="25">mdi-cart-arrow-down</v-icon>
              รายงานวัตถุดิบ
            </v-btn>
          </v-col>
          <v-col cols="12" md="4" class="my-1">
            <v-btn
              color="success"
              class="button-full-width"
              block
              @click="showComponent('product')"
            >
              <v-icon left size="25">mdi-cart-percent</v-icon>
              รายงานสินค้า และ โปรโมชั่น
            </v-btn>
          </v-col>
        </v-row>

        <v-row class="mt-1">
          <!-- <v-col> -->
            <component 
              :is="activeComponent === 'finance' ? ReportFinanceComponant : null" 
              @reloadData="reloadData" 
            />
            <component
              :is="activeComponent === 'ingredient' ? ReportIngredientComponant : null"
            />
            <component
              :is="activeComponent === 'product' ? ReportProductComponant : null"
            />
          <!-- </v-col> -->
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<style scoped>
.fill-height {
  min-height: 100vh;
}

.fill-width {
  width: 100%;
}

.button-full-width {
  width: 100%;
}

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}

@media (max-width: 768px) {
  .button-full-width {
    font-size: 0.8rem;
    padding: 12px;
  }

  h3 {
    font-size: 1.2rem;
  }
}
</style>
