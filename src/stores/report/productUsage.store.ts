// Store สำหรับจัดการข้อมูลการใช้งานสินค้าและวัตถุดิบ
// ประกอบด้วยฟังก์ชันหลักๆ ดังนี้:

// 1. loadProductsUsage() - ดึงข้อมูลการใช้งานสินค้าตามช่วงเวลาและประเภทใบเสร็จ
// 2. loadIngredientsUsage() - ดึงข้อมูลการใช้งานวัตถุดิบตามช่วงเวลา

import { ref } from 'vue';
import { defineStore } from 'pinia';
import financeService from '@/service/report/finance.service';
import type { ProductUsage } from '@/types/report/productUsage.type';
import type { IngredientUsage } from '@/types/report/ingredientUsage.type';

export const useProductUsageStore = defineStore('productUsage', () => {
  // ตัวแปรเก็บข้อมูลการใช้งานสินค้า
  const productsUsage = ref<ProductUsage[]>([]);
  // ตัวแปรเก็บข้อมูลการใช้งานวัตถุดิบ  
  const ingredientsUsage = ref<IngredientUsage[]>([]);

  // ฟังก์ชันดึงข้อมูลการใช้งานสินค้า
  const loadProductsUsage = async (startDate?: string, endDate?: string, receiptType?: string) => {
    try {
      const res = await financeService.getProductsUsage(startDate, endDate, receiptType);
      console.log('Products Usage API response:', res);
      if (res.data) {
        productsUsage.value = res.data.productsUsage;
      }
    } catch (error) {
      console.error('Failed to load products usage', error);
    }
  };

  // ฟังก์ชันดึงข้อมูลการใช้งานวัตถุดิบ
  const loadIngredientsUsage = async (startDate?: string, endDate?: string) => {
    try {
      const res = await financeService.getIngradientsUsage(startDate, endDate);
      console.log('Ingredients Usage API response:', res);
      if (res.data && res.data.ingredients) {
        ingredientsUsage.value = res.data.ingredients;
      } else {
        console.error('Invalid data structure:', res);
      }
    } catch (error) {
      console.error('Failed to load ingredients usage', error);
    }
  };
  
  return {
    productsUsage,
    ingredientsUsage, 
    loadProductsUsage,
    loadIngredientsUsage
  };
});
