<script lang="ts" setup>
import { usePosStore } from '@/stores/pos.store';
import { useProductStore } from '@/stores/product.store';
import { useToppingStore } from '@/stores/topping.store';
import { ref, computed, watch, onMounted } from 'vue';
import type { Product } from '@/types/product.type';
import type { ProductType } from '@/types/productType.type';
import type { Topping } from '@/types/topping.type';
import type { ProductTypeTopping } from '@/types/productTypeTopping.type';

const props = defineProps<{ product: Product }>();
const posStore = usePosStore();
const productStore = useProductStore();
const toppingStore = useToppingStore();
const toppingMenu = ref(false);
const selectedType = ref<ProductType | null>(null);
const selectedSweetness = ref<number>(50);
const selectedToppings = ref<Array<{ topping: Topping; quantity: number }>>([]);
const productTypeToppings = ref<ProductTypeTopping[]>([]);
const quantity = ref<number>(1);
const showAlert = ref<boolean>(false);


const toppingGroups = computed(() => {
  const groups = [];
  for (let i = 0; i < toppingStore.toppings.length; i += 4) {
    groups.push(toppingStore.toppings.slice(i, i + 4));
  }
  return groups;
});

onMounted(() => {
  productStore.setSelectedProduct(props.product);
});

function selectType(type: ProductType) {
  selectedType.value = type;
  showAlert.value = false;
}

function selectSweetness(level: number) {
  selectedSweetness.value = level;
}

function toggleTopping(topping: Topping) {
  const index = selectedToppings.value.findIndex((t) => t.topping.toppingId === topping.toppingId);
  if (index === -1) {
    selectedToppings.value.push({ topping, quantity: 1 });
  } else {
    selectedToppings.value.splice(index, 1);
  }
}

function decreaseQuantity() {
  if (quantity.value > 1) {
    quantity.value--;
  }
}

function increaseQuantity() {
  quantity.value++;
}

function increaseToppingQuantity(topping: Topping) {
  const toppingItem = selectedToppings.value.find((t) => t.topping.toppingId === topping.toppingId);
  if (toppingItem) {
    toppingItem.quantity++;
  }
}

function decreaseToppingQuantity(topping: Topping) {
  const toppingItem = selectedToppings.value.find((t) => t.topping.toppingId === topping.toppingId);
  if (toppingItem && toppingItem.quantity > 1) {
    toppingItem.quantity--;
  }
  if (toppingItem && toppingItem.quantity === 1) {
    const index = selectedToppings.value.findIndex((t) => t.topping.toppingId === topping.toppingId);
    selectedToppings.value.splice(index, 1);
  }
}
function confirmSelection() {
  console.log(props.product.haveTopping);

  if (props.product.haveTopping === true) {


    if (!selectedType.value) {
      showAlert.value = true;
      return;
    }

    for (var i = 0; i < selectedToppings.value.length; i++) {
      productTypeToppings.value.push({
        productTypeToppingId: 0,
        productType: selectedType.value,
        topping: selectedToppings.value[i].topping,
        quantity: selectedToppings.value[i].quantity,
      });
    }



    console.log(selectedType.value);

    posStore.addToReceipt(
      props.product,
      selectedType.value,
      productTypeToppings.value,
      quantity.value,
      selectedSweetness.value
    );
    clearData();


  } else {
    if (props.product) {
      posStore.addToReceipt(props.product, null, [], 1, null);
      clearData();
    } else {
      console.error("Selected product is null or undefined.");
    }
  }

}


function clearData() {
  // selectedType.value = null;
  selectedSweetness.value = 50;
  selectedToppings.value = [];
  quantity.value = 1;
  productTypeToppings.value = [];
}
function increaseSweetness() {
  if (selectedSweetness.value < 150) {
    selectedSweetness.value += 25;
  }
}

function decreaseSweetness() {
  if (selectedSweetness.value > 0) {
    selectedSweetness.value -= 25;
  }
}

</script>

<template>
  <v-card class="product-card">
    <v-img class="product-image" :src="`http://localhost:3000/products/${props.product.productId}/image`"
      :lazy-src="`http://localhost:3000/products/${props.product.productId}/image`" />
    <v-card-title class="text-center">{{ props.product.productName }} {{ props.product.productPrice }} .-</v-card-title>

    <v-card-text>
      <v-alert v-if="showAlert" type="error" dismissible @input="showAlert = false">
        กรุณาเลือกประเภทสินค้า
      </v-alert>

      <v-row v-if="props.product.productTypes && props.product.productTypes.length > 0" class="mt-3">
        <div class="d-flex flex-column " v-if="props.product.haveTopping == true">
          <span>ตัวเลือก</span>
          <div class="d-flex flex-wrap">
            <v-chip v-for="type in props.product.productTypes" :key="type.productTypeId" variant="outlined"
              :color="selectedType === type ? '#f5a623' : 'gray'" @click="selectType(type)" class="chip">
              {{ type.productTypeName }} {{ type.productTypePrice }}
            </v-chip>
          </div>
        </div>
      </v-row>

      <div v-if="props.product.haveTopping" class="d-flex flex-column mt-4">
        <span>ระดับความหวาน</span>
        <div class="d-flex justify-start align-center">
          <v-btn variant="elevated" color="#C5C5C5" @click="decreaseSweetness" icon="mdi-minus"
            :disabled="selectedSweetness === 0"></v-btn>
          <span class="mx-2">{{ selectedSweetness }}%</span>
          <v-btn variant="elevated" color="#FF9642" @click="increaseSweetness" icon="mdi-plus"
            :disabled="selectedSweetness === 150"></v-btn>
        </div>
      </div>

      <div v-if="props.product.haveTopping" class="d-flex flex-column mt-4">
        <span>ท็อปปิ้ง</span>
        <v-btn variant="outlined" color="primary" @click="toppingMenu = !toppingMenu" small>
          {{ toppingMenu ? 'ซ้อนท็อปปิ้ง' : 'แสดงท็อปปิ้ง' }}
        </v-btn>
        <v-list v-if="toppingMenu" class="mt-2">
          <v-list-item v-for="(topping, index) in toppingStore.toppings" :key="topping.toppingId">
            <div class="d-flex justify-space-between align-center">
              <v-chip variant="outlined"
                :color="selectedToppings.some(t => t.topping.toppingId === topping.toppingId) ? '#f5a623' : 'gray'"
                class="chip" small @click="toggleTopping(topping)">
                {{ topping.toppingName }} {{ topping.toppingPrice }}
              </v-chip>
              <div v-if="selectedToppings.some(t => t.topping.toppingId === topping.toppingId)"
                class="quantity-controls d-flex align-center">
                <v-btn size="x-small" icon @click.stop="decreaseToppingQuantity(topping)">
                  <v-icon size="small">mdi-minus</v-icon>
                </v-btn>
                <span class="mx-1">{{ selectedToppings.find(t => t.topping.toppingId === topping.toppingId)?.quantity
                  }}</span>
                <v-btn size="x-small" icon @click.stop="increaseToppingQuantity(topping)">
                  <v-icon size="small">mdi-plus</v-icon>
                </v-btn>
              </div>
            </div>
          </v-list-item>
        </v-list>
      </div>

      <div class="quantity-container d-flex justify-space-between align-center mt-4" v-if="props.product.haveTopping == true" >
        <p class="pa-2">จำนวนสินค้า</p>
        <v-btn variant="elevated" color="#C5C5C5" @click="decreaseQuantity" icon="mdi-minus" size="x-small"></v-btn>
        <span class="mx-2">{{ quantity }}</span>
        <v-btn variant="elevated" color="#FF9642" @click="increaseQuantity" icon="mdi-plus" size="x-small"></v-btn>
      </div>
    </v-card-text>

    <v-card-actions style=" width: 100%;">
      <v-btn variant="elevated" color="#FF9642" rounded="xl" style="width: 100%;"
        @click="confirmSelection">ยืนยัน</v-btn>
    </v-card-actions>

  </v-card>
</template>


<style scoped>
.product-card {
  border-radius: 10px;
  width: 100%;
  max-width: 350px;
  padding: 10px;
  margin: 10px;
}

.product-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 10px;
}

.chip {
  margin: 5px;
}

.topping-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.quantity-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quantity-container span {
  margin: 0 10px;
  font-size: 20px;
}

.quantity-controls {
  display: flex;
  align-items: center;
}

.quantity-controls span {
  margin: 0 10px;
}
</style>