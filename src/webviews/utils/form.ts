export function processFormData(formData: FormData) {
  const groupedData: Record<string, string | Record<string, string>> = {};

  formData.forEach((value, key) => {
    // Split by '[' and clean up ']'
    const parts = key.split('[').map(str => str.replace(']', ''));

    let current = groupedData;

    // Handle all parts except the last one
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current)) {
        current[part] = {};
      }
      current = current[part] as Record<string, any>;
    }

    // Handle the last part (actual value assignment)
    const lastPart = parts[parts.length - 1];
    if (typeof value === 'string') {
      current[lastPart] = value;
    }
  });

  return groupedData;
}