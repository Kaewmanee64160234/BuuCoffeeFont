<script lang="ts" setup>
import { ref } from 'vue';
import ReportFinanceComponant from '@/components/reports/ReportFinanceComponant.vue';
import ReportIngredientComponant from '@/components/reports/ReportIngredientComponant.vue';
import ReportProductComponant from '@/components/reports/ReportProductComponant.vue';
import ReportTypeFinanceComponant from '@/components/reports/ReportTypeFinanceComponant.vue';
const activeComponent = ref<string | null>(null);
const showFinanceMenu = ref(false);

function showComponent(component: string) {
  activeComponent.value = component;
}
activeComponent.value = 'finance'; 

function reloadData() {
}
</script>

<template>
  <v-container class="d-flex justify-center align-center fill-height">
    <v-card class="fill-width scrollable-card" max-width="1400px">
      <v-card-title class="text-center">
        <h3>Dashboard</h3>
      </v-card-title>
      <v-card-text>
        <v-row class="d-flex justify-center">
          <v-col cols="12" md="3" class="my-1">
            <v-menu offset-y>
              <template v-slot:activator="{ props }">
                <v-btn
                  color="success"
                  class="button-full-width"
                  block
                  style="font-size: 16px;"
                  v-bind="props"
                  @click="showComponent('finance')"
                >
                  <v-icon left size="30">mdi-store</v-icon>
                  ยอดขาย
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="showComponent('typefinance')">
                  <v-list-item-title>
                    <v-icon left size="25">mdi-cart-percent</v-icon>
                    ประเภทยอดขาย
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-col>
          <v-col cols="12" md="3" class="my-1">
            <v-btn
              color="success"
              class="button-full-width"
              block
              style="font-size: 16px;"
              @click="showComponent('ingredient')"
            >
              <v-icon left size="25">mdi-cart-arrow-down</v-icon>
              วัตถุดิบ
            </v-btn>
          </v-col>
          <v-col cols="12" md="3" class="my-1">
            <v-btn
              color="success"
              class="button-full-width"
              block
              style="font-size: 16px;"
              @click="showComponent('product')"
            >
              <v-icon left size="25">mdi-cart-percent</v-icon>
              สินค้าขายดี
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
            <component
              :is="activeComponent === 'typefinance' ? ReportTypeFinanceComponant : null"
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

.scrollable-card {
  max-height: 90vh; /* Set max height for the card */
  overflow-y: auto; /* Add vertical scrollbar inside the card */
  padding: 16px;
}

</style>
