/**
 * Parses extractedData from string to object
 * Handles cases where extractedData is a JSON string or already an object
 */
export function parseExtractedData(data: any): Record<string, any> | null {
  if (!data) {
    return null;
  }

  if (typeof data === 'object') {
    return data;
  }

  if (typeof data !== 'string') {
    return null;
  }

  try {
    const trimmed = data.trim();
    if (!trimmed || trimmed === '{}' || trimmed === '[]') {
      return null;
    }
    const parsed = JSON.parse(trimmed);
    return typeof parsed === 'object' ? parsed : null;
  } catch (error) {
    console.error('Failed to parse extractedData:', error, data);
    return null;
  }
}

/**
 * Formats extracted data fields for display
 * Converts field names to readable labels and handles nested objects
 */
export function formatExtractedDataForDisplay(
  data: Record<string, any>
): Array<{ label: string; value: string }> {
  const formatted: Array<{ label: string; value: string }> = [];

  const flattenObject = (obj: any, prefix = ''): void => {
    for (const [key, value] of Object.entries(obj)) {
      const label = formatFieldLabel(prefix ? `${prefix}.${key}` : key);
      const stringValue = formatFieldValue(value);
      if (stringValue) {
        formatted.push({ label, value: stringValue });
      }
    }
  };

  flattenObject(data);
  return formatted;
}

/**
 * Converts camelCase or snake_case field names to readable labels
 */
function formatFieldLabel(fieldName: string): string {
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\./g, ' - ')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Converts field values to string representation
 */
function formatFieldValue(value: any): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.filter(v => v).join(', ');
    }
    return JSON.stringify(value);
  }

  return String(value).trim();
}
