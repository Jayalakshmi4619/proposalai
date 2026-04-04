import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | number | Date) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export const fixOklchColors = (element: HTMLElement) => {
  const allElements = [element, ...Array.from(element.querySelectorAll('*'))];
  const temp = document.createElement('div');
  temp.style.display = 'none';
  document.body.appendChild(temp);

  allElements.forEach((node: any) => {
    const style = window.getComputedStyle(node);
    const inlineStyles: Record<string, string> = {};
    
    // Iterate through all computed styles
    for (let i = 0; i < style.length; i++) {
      const prop = style[i];
      const value = style.getPropertyValue(prop);
      
      if (value && (value.includes('oklch') || value.includes('oklab') || value.includes('var('))) {
        try {
          temp.style.setProperty(prop, value);
          const resolved = window.getComputedStyle(temp).getPropertyValue(prop);
          if (resolved && !resolved.includes('oklch') && !resolved.includes('oklab')) {
            inlineStyles[prop] = resolved;
          }
        } catch (e) {
          // Ignore errors for individual properties
        }
      }
    }
    
    // Apply resolved styles as inline styles
    Object.entries(inlineStyles).forEach(([prop, value]) => {
      node.style.setProperty(prop, value);
    });
  });
  
  document.body.removeChild(temp);
};
