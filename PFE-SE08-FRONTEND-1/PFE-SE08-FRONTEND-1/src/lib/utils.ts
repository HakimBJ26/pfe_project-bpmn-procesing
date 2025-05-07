import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const createFile = (filename: string, fileContent: string,extension: string,fileType: string): File => {
  if (!filename.endsWith(extension)) {
    filename += extension;
  }
  const blob = new Blob([fileContent], { type: fileType });

  const file = new File([blob], filename, { type: fileType });

  return file;
};