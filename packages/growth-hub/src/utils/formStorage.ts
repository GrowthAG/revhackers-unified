
// Utility functions to store and retrieve form data across pages

// Type definition for the stored form data
export interface StoredFormData {
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  industry?: string;
  role?: string;
  message?: string;
  formType?: string;
  timestamp?: string;
}

// Save form data to localStorage
export const saveFormData = (data: StoredFormData): void => {
  try {
    localStorage.setItem('growthAgencyFormData', JSON.stringify(data));
    console.log('Form data saved to localStorage:', data);
  } catch (error) {
    console.error('Error saving form data to localStorage:', error);
  }
};

// Get form data from localStorage
export const getFormData = (): StoredFormData | null => {
  try {
    const storedData = localStorage.getItem('growthAgencyFormData');
    if (storedData) {
      return JSON.parse(storedData);
    }
    return null;
  } catch (error) {
    console.error('Error retrieving form data from localStorage:', error);
    return null;
  }
};

// Clear form data from localStorage
export const clearFormData = (): void => {
  try {
    localStorage.removeItem('growthAgencyFormData');
  } catch (error) {
    console.error('Error clearing form data from localStorage:', error);
  }
};
