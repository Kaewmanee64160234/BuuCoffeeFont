<template>
  <v-dialog
    v-model="productStore.createProductDialog"
    persistent
    max-width="1024"
  >
    <v-card>
      <v-form ref="form" v-model="valid">
        <v-card-text>
          <v-row>
            <h3>เพิ่มสินค้า</h3>
          </v-row>
          <!-- Product Information Form -->
          <v-row>
            <v-col cols="12" sm="12" class="d-flex justify-center align-center">
              <v-img
                v-if="imagePreview"
                :src="imagePreview"
                max-height="100"
                class="rounded-circle"
              />
              <!-- if not have file show null image -->
              <v-img
                v-else
                src="https://via.placeholder.com/200"
                width="180"
                height="180"
              ></v-img>
            </v-col>

            <v-col cols="12" sm="12">
              <v-file-input
                v-model="productImage"
                label="รูปภาพสินค้า"
                prepend-icon="mdi-camera"
                accept="image/*"
                variant="solo"
                @change="handleImageUpload"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-select
                v-model="storeName"
                :items="storeNames"
                label="เลือกชื่อร้าน"
                dense
                variant="solo"
                :error-messages="!storeName ? ['กรุณาเลือก'] : []"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                variant="solo"
                v-model="productName"
                label="ชื่อสินค้า"
                :rules="nameRules"
                :error-messages="!productName ? ['กรุณากรอกชื่อสินค้า'] : []"
                required
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-select
                v-model="selectedCategory"
                :items="
                  categoryStore.categoriesForCreate.map(
                    (category) => category.categoryName
                  )
                "
                label="เลือกหมวดหมู่"
                dense
                variant="solo"
                :error-messages="!selectedCategory ? ['กรุณาเลือก'] : []"
              />
            </v-col>

            <v-row class="d-flex align-center">
              <v-col cols="6">
                <v-checkbox
                  label="เครื่องดื่มที่สามารถชงได้"
                  v-if="storeName !== 'ร้านข้าว'"
                  v-model="haveTopping"
                />
              </v-col>
              <v-col :cols="storeName !== 'ร้านข้าว' ? 6 : 12">
                <v-checkbox label="นับแต้ม" v-model="countingPoint" />
              </v-col>
            </v-row>

            <v-col cols="12" sm="6" v-if="!haveTopping">
              <v-text-field
                variant="solo"
                v-model="productPrice"
                label="ราคา"
                type="number"
                :rules="priceRules"
                :error-messages="!productPrice ? ['กรุณากรอกราคาเริ่มต้น'] : []"
                required
              />
            </v-col>

            <v-row class="d-flex align-center">
              <v-col cols="4" v-if="haveTopping && storeName !== 'ร้านข้าว'">
                <v-checkbox
                  label="ร้อน"
                  v-model="productTypes.hot"
                  @change="handleProductTypeChange('ร้อน', productTypes.hot)"
                />
              </v-col>
              <v-col cols="4" v-if="haveTopping && storeName !== 'ร้านข้าว'">
                <v-checkbox
                  label="เย็น"
                  v-model="productTypes.cold"
                  @change="handleProductTypeChange('เย็น', productTypes.cold)"
                />
              </v-col>
              <v-col cols="4" v-if="haveTopping && storeName !== 'ร้านข้าว'">
                <v-checkbox
                  label="ปั่น"
                  v-model="productTypes.blend"
                  @change="handleProductTypeChange('ปั่น', productTypes.blend)"
                />
              </v-col>
            </v-row>

            <v-col cols="12" sm="6">
              <v-text-field variant="solo" v-model="barcode" label="บาร์โค้ด" />
            </v-col>
          </v-row>
          <v-row v-if="!haveTopping">
            <!-- add checkbox for need Ingerdian -->
            <v-col cols="12" sm="6">
              <v-checkbox
                label="ต้องการเชื่อมวัตถุดิบ"
                v-model="needLinkIngredient"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-form>
      <v-card-text v-if="needLinkIngredient && !haveTopping">
        <v-form ref="form">
          <v-container>
            <v-row>
              <h4>เพิ่มวัตถุดิบ</h4>
            </v-row>
            <v-row>
              ตัวอย่าง :
              <strong>เนสกาแฟ เบลนด์ แอนด์ บรู กาแฟปรุงสำเร็จ ริช อโรมา </strong
              ><strong>1 ถุง มี 27 ซอง</strong> ขั้นต่ำในคลัง
              <strong>100 ซอง</strong>
            </v-row>

            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  disabled
                  label="ชื่อวัตถุดิบ (ตัวอย่าง : เนสกาแฟ เบลนด์ แอนด์ บรู กาแฟปรุงสำเร็จ ริช อโรมา)"
                  required
                  v-model="productName"
                  :rules="[
                    (v:any) => !!v || 'กรุณากรอกชื่อวัตถุดิบ',
                    (v:any) => v.length >= 3 || 'ความยาวต้องมากกว่า 3 ตัวอักษร',
                  ]"
                  dense
                  hide-details
                  variant="solo"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  label="ชื่อแบรนด์ (ตัวอย่าง : เนสกาแฟ)"
                  required
                  v-model="ingredientStore.editedIngredient.ingredientSupplier"
                  :rules="[(v:any) => !!v || 'กรุณากรอกชื่อแบรนด์']"
                  dense
                  hide-details
                  variant="solo"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  label="จุดสั่งซื้อขั้นต่ำ (ตัวอย่าง : 100) สำหรับแจ้งเตือน"
                  v-model.number="
                    ingredientStore.editedIngredient.ingredientMinimun
                  "
                  :rules="[
                    (v:any) => !!v || 'กรุณากรอกขั้นต่ำ',
                    (v:any) => v >= 0 || 'ขั้นต่ำต้องมากกว่า 0',
                  ]"
                  dense
                  hide-details
                  variant="solo"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-autocomplete
                  label="หน่วยใหญ่ (ตัวอย่าง : ถุง)"
                  v-model="ingredientStore.editedIngredient.ingredientUnit"
                  :items="units"
                  dense
                  hide-details
                  variant="solo"
                ></v-autocomplete>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  label="ปริมาณหน่วยย่อย (ตัวอย่าง : 27)"
                  v-model.number="
                    ingredientStore.editedIngredient.ingredientQuantityPerUnit
                  "
                  :rules="[
                    (v:any) => !!v || 'กรุณากรอกปริมาณต่อหน่วย',
                    (v:any) => v > 0 || 'ปริมาณต้องมากกว่า 0',
                  ]"
                  dense
                  hide-details
                  variant="solo"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-autocomplete
                  label="หน่วย/ย่อย (ตัวอย่าง : ซอง ) "
                  v-model.number="
                    ingredientStore.editedIngredient
                      .ingredientQuantityPerSubUnit
                  "
                  :items="subunits"
                  dense
                  hide-details
                  variant="solo"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  label="ปริมาณ"
                  v-model.number="
                    ingredientStore.editedIngredient.ingredientVolumeUnit
                  "
                  dense
                  hide-details
                  variant="solo"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  label="บาร์โคด"
                  v-model.number="
                    ingredientStore.editedIngredient.ingredientBarcode
                  "
                  dense
                  hide-details
                  variant="solo"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <!-- save abd cancel -->
        <v-spacer></v-spacer>
        <v-btn color="error" @click="clearData">ยกเลิก</v-btn>

        <v-btn color="primary" @click="completeProcess">บันทึก</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { useCategoryStore } from "@/stores/category.store";
import { useProductStore } from "@/stores/product.store";
import { useIngredientStore } from "@/stores/Ingredient.store";
import Swal from "sweetalert2";
import type { Product } from "@/types/product.type";

const step = ref(1); // Track the current step
const valid = ref(false);
const haveTopping = ref(false);
const needLinkIngredient = ref(false);
const productName = ref("");
const productPrice = ref(0);
const barcode = ref("");
const productImage = ref(new File([], ""));
const imagePreview = ref<string | null>(null);
const selectedCategory = ref(null);
const storeName = ref("");
const storeNames = ["ร้านข้าว", "ร้านกาแฟ"];
const countingPoint = ref(false);

const ingredientStore = useIngredientStore();
const productStore = useProductStore();
const categoryStore = useCategoryStore();

const productTypes = reactive({ hot: false, cold: false, blend: false });
const productTypesPrice = reactive({ hot: 0, cold: 0, blend: 0 });
const units = [
  "กล่อง",
  "แพ็ค",
  "ถุง",

];
const subunits = [
  "กระปุก",
  "กระป๋อง",
  "แก้ว",
  "ขวด",
  "ชิ้น",
  "โหล",
  "ถาด",
  "ถ้วย",
  "จาน",
  "ชาม",
  "ซอง",
  "ถุง",
];
const handleProductTypeChange = (type: string, isChecked: boolean) => {
  if (!isChecked) {
    if (type === "ร้อน") productTypesPrice.hot = 0;
    if (type === "เย็น") productTypesPrice.cold = 0;
    if (type === "ปั่น") productTypesPrice.blend = 0;
  }
};

const nameRules = [(v: string) => !!v || "ชื่อสินค้าจำเป็นต้องระบุ"];
const priceRules = [(v: number) => !!v || "ราคาสินค้าจำเป็นต้องระบุ"];

const nextStep = () => (step.value = 2);
const prevStep = () => (step.value = 1);

const handleImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    productImage.value = input.files[0];
    imagePreview.value = URL.createObjectURL(productImage.value);
  }
};

const completeProcess = async () => {
  try {
    const productData: Product = {
      productName: productName.value,
      productPrice: productPrice.value,
      barcode: barcode.value,
      productImage: productImage.value,
      categoryId: categoryStore.categories.find(
        (c) => c.categoryName === selectedCategory.value
      )?.categoryId,
      storeType: storeName.value,
      category: categoryStore.categories.find(
        (c) => c.categoryName === selectedCategory.value
      )!,
      haveTopping: haveTopping.value,
      productTypes: [],
      file: productImage.value,
      countingPoint: countingPoint.value,
      needLinkIngredient: needLinkIngredient.value,
      ingredient: needLinkIngredient.value
        ? { ...ingredientStore.editedIngredient }
        : undefined,
    };
    console.log("Product data to save:", productData);
    // Add selected product types and their prices
    if (productTypes.hot) {
      productData.productTypes.push({
        productTypeName: "ร้อน",
        productTypePrice: productTypesPrice.hot,
      });
    }
    if (productTypes.cold) {
      productData.productTypes.push({
        productTypeName: "เย็น",
        productTypePrice: productTypesPrice.cold,
      });
    }
    if (productTypes.blend) {
      productData.productTypes.push({
        productTypeName: "ปั่น",
        productTypePrice: productTypesPrice.blend,
      });
    }
    productStore.product = { ...productData };
    await productStore.createProduct(productData);
    clearData();
    Swal.fire({
      title: "เสร็จสิ้น!",
      text: "สินค้าถูกสร้างและวัตถุดิบถูกเพิ่มเรียบร้อยแล้ว!",
      icon: "success",
    });
    productStore.createProductDialog = false;
  } catch (error) {
    Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถบันทึกสินค้าได้", "error");
  }
};

const clearData = () => {
    productName.value = '';
  productPrice.value = 0;
  barcode.value = '';
  productImage.value = new File([], '');
  imagePreview.value = null;
  selectedCategory.value = null;
  productTypes.hot = false;
  productTypes.cold = false;
  productTypes.blend = false;
  productTypesPrice.hot = 0;
  productTypesPrice.cold = 0;
  productTypesPrice.blend = 0;
  storeName.value = '';
  productStore.createProductDialog = false;
  haveTopping.value = false; 
  countingPoint.value = false;
  needLinkIngredient.value = false;
  step.value = 1; // Reset to the first step
};

onMounted(async () => {
  await categoryStore.getAllCategories();
});
</script>

<style scoped>
.v-dialog {
  max-width: 100%;
  margin: 0 auto;
}
.v-card {
  width: 100%;
  max-width: 1024px;
}
</style>
