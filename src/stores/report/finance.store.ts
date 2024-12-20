// Store สำหรับจัดการข้อมูลการเงินและรายงานต่างๆ
// ประกอบด้วยฟังก์ชันหลักๆ ดังนี้:

// 1. getAll() - ดึงข้อมูลประวัติการทำรายการเงินสดทั้งหมด
// 2. deleteCashier() - ลบรายการเงินสด
// 3. getSumType() - ดึงยอดรวมตามประเภทการชำระเงิน (เงินสด/QR)
// 4. getDailyReport() - ดึงรายงานประจำวันของร้านกาแฟ
// 5. getcoffeeSummary() - ดึงสรุปยอดขายร้านกาแฟ
// 6. getDailyReportFood() - ดึงรายงานประจำวันของร้านอาหาร
// 7. fetchGroupedFinance() - ดึงข้อมูลการเงินแบบจัดกลุ่มตามวัน/เดือน/ปีของร้านกาแฟ
// 8. fetchGroupedFinanceFood() - ดึงข้อมูลการเงินแบบจัดกลุ่มตามวัน/เดือน/ปีของร้านอาหาร
// 9. getTopSellingProduct() - ดึงข้อมูลสินค้าขายดี
// 10. checkCashierToday() - ตรวจสอบการทำรายการเงินสดของวันนี้
// 11. getCateringReport() - ดึงรายงานการจัดเลี้ยง

import { ref ,reactive} from "vue";
import { defineStore } from "pinia";
import financeService from "@/service/report/finance.service";
import type { Cashier } from "@/types/report/cashier.type";
import type { TopSellingProduct } from "@/types/report/top-selling-product.type";
import type { CateringReport} from "@/types/report/catering.type"
export const useReportFinnceStore = defineStore("cashier", () => {
  const cashiers = ref<Cashier[]>([]);
  const createCashierDialog = ref(false);
  const closeCashierDialog = ref(false);
  const createHistoryCashierDialog = ref(false);
  const historycashiers = ref<Cashier[]>([]);
  const selectedType = ref<string | null>(null);
  const sumType = ref<{ cash: string; qrcode: string }>({ cash: "", qrcode: "" });
  const topSellingProduct = ref<TopSellingProduct[]>([]);
  const dailyReport = ref<{ totalSales: number; totalDiscount: number ; totalTransactions: number}>({ totalSales: 0, totalDiscount: 0, totalTransactions:0});
  const coffeeSummary = ref<{ totalSales: number; totalCost: number ; totalDiscount: number ; totalOrders:number}>({ totalSales: 0, totalCost: 0, totalDiscount:0,totalOrders:0});
  const dailyReportFood = ref<{ totalSales: number; totalDiscount: number ; totalTransactions: number}>({ totalSales: 0, totalDiscount: 0, totalTransactions:0});
  const checkTodayCoffee = ref(false);
  const reportcatering = ref<CateringReport>({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    totalEvents: 0,
    pendingEvents: 0,
    completedEvents: 0,
    totalProfit: 0
  });
  const checkTodayRice = ref(false);
  const state = reactive({
    groupedByDay: {},
    groupedByMonth: {},
    groupedByYear: {},
  });
  const stateFood = reactive({
    groupedByDay: {},
    groupedByMonth: {},
    groupedByYear: {},
  });



  const getAll = async () => {
    try {
      const res = await financeService.getAll();
      if (res.data) {
        historycashiers.value = res.data;
      }
    } catch (error) {
      console.error(error);
    }
  };
  const deleteCashier = async (id: number) => {
    try {
      await financeService.deleteCashier(id);
      cashiers.value = cashiers.value.filter((c) => c.cashierId !== id);
    } catch (error) {
      console.error(error);
    }
  };
  const getSumType = async () => {
    try {
      const res = await financeService.getSumType();
      if (res.data) {
        sumType.value = res.data;
      }
    } catch (error) {
      console.error(error);
    }
  };
  const getDailyReport = async () => {
    try {
      const res = await financeService.getDailyReport();
      if (res.data) {
        dailyReport.value = res.data;
      }
    } catch (error) {
      console.error(error);
    }
  };
  const getcoffeeSummary = async () => {
    try {
      const res = await financeService.getcoffeeSummary();
      if (res.data) {
        coffeeSummary.value = res.data.toFixed(2);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const getDailyReportFood = async () => {
    try {
      const res = await financeService.getDailyReportFood();
      console.log('res',res);
      if (res.data) {
        dailyReportFood.value = res.data;
      }
    } catch (error) {
      console.error(error);
    }
  };
  const fetchGroupedFinance = async (startDate: string, endDate: string) => {
    try {
      const response = await financeService.getGroupedFinance(startDate, endDate);
      if (response.data) {
        state.groupedByDay = response.data.groupedByDay;
        state.groupedByMonth = response.data.groupedByMonth;
        state.groupedByYear = response.data.groupedByYear;
      }
    } catch (error) {
      console.error("Error fetching grouped finance:", error);
    }
  };
  const fetchGroupedFinanceFood = async (startDate: string, endDate: string) => {
    try {
      const response = await financeService.getGroupedFinanceFood(startDate, endDate);
      if (response.data) {
        stateFood.groupedByDay = response.data.groupedByDay;
        stateFood.groupedByMonth = response.data.groupedByMonth;
        stateFood.groupedByYear = response.data.groupedByYear;
      }
    } catch (error) {
      console.error("Error fetching grouped finance:", error);
    }
  };
  const getTopSellingProduct = async (date: string) => {
    try {
      const res = await financeService.getTopSellingProducts(date);
      if (res.data) {
        topSellingProduct.value = res.data;
      }
    } catch (error) {
      console.error('Error fetching top selling product:', error);
    }
  };
  // checkToday
  const checkCashierToday = async () => {
    try {
      const res = await financeService.checkToday();
      if (res.data) {
        if(res.data.coffee.closedDate== false && res.data.coffee.createdToday ==true){
        checkTodayCoffee.value = true;
        }else{
          checkTodayCoffee.value = false;
        }
        if(res.data.rice.closedDate== false && res.data.rice.createdToday ==true){
          checkTodayRice.value = true;
        }
        else{
          checkTodayRice.value = false;
        }
        
      
      }

    } catch (error) {
      console.error(error);
    }
  };
  const getCateringReport = async () => {
    try {
      const res = await financeService.getCatering();
      if (res.data) {
        reportcatering.value = res.data;
      }
    } catch (error) {
      console.error('Error fetching catering report:', error);
    }
  };

  return {
    cashiers,
    createCashierDialog,
    closeCashierDialog,
    createHistoryCashierDialog,
    historycashiers,
    sumType,
    dailyReport,
    dailyReportFood,
    coffeeSummary,
    state,
    stateFood,
    topSellingProduct,
    selectedType,
    reportcatering,
    getAll,
    deleteCashier,
    getSumType,
    getDailyReport,
    getDailyReportFood,
    getcoffeeSummary,
    fetchGroupedFinanceFood,
    fetchGroupedFinance,
    getTopSellingProduct,
    checkTodayCoffee,
    checkTodayRice,
    checkCashierToday,
    getCateringReport
    
  };
});
