import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { Customer } from '@/types/customer.type';
import customerService from '@/service/customer.service';
import { usePosStore } from './pos.store';

export const useCustomerStore = defineStore('customer', () => {
  const customers = ref<Customer[]>([]);
  const customer = ref<Customer | null>(null);
  const searchQuery = ref<string>('');
  const updateCustomerDialog = ref(false);
  const openCreateCustomerDialog = ref(false);
  const openDialogFindCustomer = ref(false);
  const openDialogRegisterCustomer = ref(false);
  const currentPage = ref(1); // Current page number
  const itemsPerPage = ref(5); // Number of items per page
  const totalCustomers = ref(0); // Total number of customers
  const posStore = usePosStore();

  const getAllCustomers = async () => {
    try {
      const response = await customerService.getAllCustomers();
      if (response.status === 200) {
        customers.value = response.data;
        totalCustomers.value = customers.value.length; // Update total customers count
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const getCustomerById = async (id: number) => {
    try {
      const response = await customerService.getCustomerById(id);
      if (response.status === 200) {
        customer.value = response.data;
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
    }
  };

  const createCustomer = async (newCustomer: Customer) => {
    try {
      const response = await customerService.createCustomer(newCustomer);
      if (response.status === 201) {
        customers.value.push(response.data); // Add new customer locally
        totalCustomers.value += 1; // Update total customers count
        posStore.receipt.customer = response.data;
        console.log('Customer created:', response.data);
  
        // If current page is the last page and adding a new customer causes overflow, adjust currentPage
        if (customers.value.length > currentPage.value * itemsPerPage.value) {
          currentPage.value = Math.ceil(customers.value.length / itemsPerPage.value);
        }
      }
    } catch (error) {
      console.error('Error creating customer:', error);
    }
  };
  

  const updateCustomer = async (id: number, updatedCustomer: any) => {
    try {
      const response = await customerService.updateCustomer(id, updatedCustomer);
      if (response.status === 200) {
        const updatedCustomer = response.data;
        const index = customers.value.findIndex(customer => customer.customerId === id);
        if (index !== -1) {
          customers.value[index] = updatedCustomer;
        }
        return updatedCustomer;
      }
    } catch (error) {
      console.error('Failed to update customer:', error);
      throw error;
    }
  };

  const deleteCustomer = async (id: number) => {
    try {
      const response = await customerService.deleteCustomer(id);
      if (response.status === 200) {
        customers.value = customers.value.filter(customer => customer.customerId !== id);
        totalCustomers.value = customers.value.length; // Update total customers count
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const setCustomerForEdit = (customerToEdit: Customer) => {
    customer.value = customerToEdit;
  };

  const setCustomerInReceipt = (customer: Customer) => {
    posStore.receipt.customer = customer;
    openDialogFindCustomer.value = false;
  };

  return {
    customers,
    customer,
    getAllCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    setCustomerForEdit,
    updateCustomerDialog,
    searchQuery,
    openCreateCustomerDialog,
    openDialogFindCustomer,
    setCustomerInReceipt,
    openDialogRegisterCustomer,
    currentPage,
    itemsPerPage,
    totalCustomers
  };
});
