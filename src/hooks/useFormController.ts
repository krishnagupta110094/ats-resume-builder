import { useState, useCallback, useEffect } from 'react';
import { ZodError } from 'zod';
import type { ResumeData, SectionVisibility } from '../utils/validationSchemas';
import { validateSection, validateCompleteResume, createFlexibleResumeSchema } from '../utils/validationSchemas';

// Form validation errors interface
export interface FormErrors {
  [key: string]: string | FormErrors | string[];
}

// Form controller hook
export const useFormController = (initialData: ResumeData, sectionVisibility?: SectionVisibility) => {
  const [formData, setFormData] = useState<ResumeData>(initialData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isValid, setIsValid] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [isDirty, setIsDirty] = useState(false);

  // Update field value
  const updateField = useCallback((section: string, index: number | string, field: string | null, value: any) => {
    setFormData(prev => {
      const newData = { ...prev };
      
      if (section === 'basicdetails' && field) {
        (newData.basicdetails as any)[field] = value;
      } else if (section === 'about') {
        newData.about = value;
      } else if (typeof index === 'number' && field === null) {
        // Handle direct array item updates (like skills)
        const sectionArray = (newData as any)[section] as any[];
        if (sectionArray && typeof sectionArray[index] !== 'undefined') {
          sectionArray[index] = value;
        }
      } else if (typeof index === 'number' && field) {
        // Handle object property updates in arrays
        const sectionArray = (newData as any)[section] as any[];
        if (sectionArray && sectionArray[index]) {
          sectionArray[index][field] = value;
        }
      } else if (field) {
        ((newData as any)[section] as any)[field] = value;
      }
      
      return newData;
    });
    
    setIsDirty(true);
    
    // Mark field as touched
    const fieldPath = field ? `${section}.${index}.${field}` : `${section}.${index}`;
    setTouchedFields(prev => new Set(prev).add(fieldPath));
  }, []);

  // Patch update for array operations
  const patchArray = useCallback((section: string, operation: 'add' | 'remove', index?: number, newItem?: any) => {
    setFormData(prev => {
      const newData = { ...prev };
      const sectionArray = (newData as any)[section] as any[];
      
      if (operation === 'add' && newItem) {
        sectionArray.push(newItem);
      } else if (operation === 'remove' && typeof index === 'number') {
        sectionArray.splice(index, 1);
      }
      
      return newData;
    });
    
    setIsDirty(true);
  }, []);

  // Validate specific section
  const validateSectionData = useCallback((section: string, data: any) => {
    try {
      validateSection(section, data);
      
      // Clear errors for this section
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[section];
        return newErrors;
      });
      
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const sectionErrors: FormErrors = {};
        
        error.issues.forEach((err: any) => {
          const path = err.path.join('.');
          sectionErrors[path] = err.message;
        });
        
        setErrors(prev => ({
          ...prev,
          [section]: sectionErrors
        }));
      }
      
      return false;
    }
  }, []);

  // Validate entire form
  const validateForm = useCallback(() => {
    try {
      // Use flexible schema if section visibility is provided
      if (sectionVisibility) {
        const flexibleSchema = createFlexibleResumeSchema(sectionVisibility);
        flexibleSchema.parse(formData);
      } else {
        validateCompleteResume(formData);
      }
      
      setErrors({});
      setIsValid(true);
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const formErrors: FormErrors = {};
        
        error.issues.forEach((err: any) => {
          const path = err.path.join('.');
          let current = formErrors;
          
          err.path.forEach((key: string, index: number) => {
            if (index === err.path.length - 1) {
              current[key] = err.message;
            } else {
              if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
              }
              current = current[key] as FormErrors;
            }
          });
        });
        
        setErrors(formErrors);
      }
      
      setIsValid(false);
      return false;
    }
  }, [formData, sectionVisibility]);

  // Auto-validate on data change
  useEffect(() => {
    if (isDirty) {
      const timeoutId = setTimeout(() => {
        validateForm();
      }, 500); // Debounce validation
      
      return () => clearTimeout(timeoutId);
    }
  }, [formData, isDirty, validateForm]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setIsValid(false);
    setTouchedFields(new Set());
    setIsDirty(false);
  }, [initialData]);

  // Get field error
  const getFieldError = useCallback((fieldPath: string) => {
    const pathArray = fieldPath.split('.');
    let current: any = errors;
    
    for (const key of pathArray) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return undefined;
      }
    }
    
    return typeof current === 'string' ? current : undefined;
  }, [errors]);

  // Check if field is touched
  const isFieldTouched = useCallback((fieldPath: string) => {
    return touchedFields.has(fieldPath);
  }, [touchedFields]);

  return {
    formData,
    errors,
    isValid,
    isDirty,
    updateField,
    patchArray,
    validateSectionData,
    validateForm,
    resetForm,
    getFieldError,
    isFieldTouched,
    setFormData
  };
};

// Section visibility controller
export const useSectionVisibility = (initialVisibility: SectionVisibility) => {
  const [sectionVisibility, setSectionVisibility] = useState<SectionVisibility>(initialVisibility);

  const toggleSection = useCallback((section: keyof SectionVisibility) => {
    setSectionVisibility(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  const showSection = useCallback((section: keyof SectionVisibility) => {
    setSectionVisibility(prev => ({
      ...prev,
      [section]: true
    }));
  }, []);

  const hideSection = useCallback((section: keyof SectionVisibility) => {
    setSectionVisibility(prev => ({
      ...prev,
      [section]: false
    }));
  }, []);

  return {
    sectionVisibility,
    toggleSection,
    showSection,
    hideSection,
    setSectionVisibility
  };
};