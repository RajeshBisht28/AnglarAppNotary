export function isEmptyValue(value: any): boolean {
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  if (typeof value === 'string') {
    return value.trim() === '';
  }
  return value === null || value === undefined || value === '';
}

export function getFormattedValue(value: any): string {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  return value ? value.toString().trim() : '';
}

export function downloadFile(fileUrl: string): void {
  const link = document.createElement('a');
  link.href = fileUrl;
  link.download = '';
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
