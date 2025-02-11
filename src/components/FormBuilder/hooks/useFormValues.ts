import { useState } from "react";

export const useFormValues = () => {
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  const updateFormValue = (id: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [id]: value }));
  };

  return {
    formValues,
    setFormValues,
    updateFormValue,
  };
};
