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
  const posStore = usePosStore();

  const getAllCustomers = async () => {
    try {
      const response = await customerService.getAllCustomers();
      if (response.status === 200) {
        customers.value = response.data;
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
        customers.value.push(response.data);
        posStore.receipt.customer = response.data;
        console.log('Customer created:', response.data);
        await getAllCustomers(); // Ensure that all customers are fetched again
      }
    } catch (error) {
      console.error('Error creating customer:', error);
    }
  };


  const updateCustomer = async (id: number, updatedCustomer: Customer) => {
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
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const setCustomerForEdit = (customerToEdit: Customer) => {
    customer.value = customerToEdit;
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
    openCreateCustomerDialog
  };
});
