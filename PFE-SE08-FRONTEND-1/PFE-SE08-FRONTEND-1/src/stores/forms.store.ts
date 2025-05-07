import { FormData } from "@/services/types";
import { create } from "zustand";

type FormsState = {
    forms: FormData[];
    deleteForm: (formKey: string) => void;
    setForms: (forms: FormData[]) => void;
    getFormByKey: (formKey: string) => FormData | undefined;
};

export const useFormsStore = create<FormsState>((set, get) => ({
    forms: [],
    deleteForm: (formKey: string) => {
        set((state) => ({
            forms: state.forms.filter((form) => form.formKey !== formKey),
        }));
    },
    setForms: (forms: FormData[]) => {
        set({ forms });
    },
    getFormByKey: (formKey: string) => {
        return get().forms.find((form) => form.formKey === formKey);
    },
})); 