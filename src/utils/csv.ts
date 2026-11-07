// CSV export and import helpers

export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers?: { key: keyof T; label: string }[]
) {
  if (!data || !data.length) {
    alert('No data available to export.');
    return;
  }

  let keys: (keyof T)[];
  let headerLabels: string[];

  if (headers && headers.length) {
    keys = headers.map(h => h.key);
    headerLabels = headers.map(h => h.label);
  } else {
    keys = Object.keys(data[0]) as (keyof T)[];
    headerLabels = keys as string[];
  }

  const csvRows = [
    headerLabels.join(','),
    ...data.map(row =>
      keys
        .map(key => {
          const rawVal: any = row[key];
          let strVal: string = '';
          if (rawVal !== undefined && rawVal !== null) {
            if (typeof rawVal === 'object') {
              strVal = JSON.stringify(rawVal);
            } else {
              strVal = String(rawVal);
            }
          }
          strVal = strVal.replace(/"/g, '""');
          return `"${strVal}"`;
        })
        .join(',')
    ),
  ];

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.replace(/(^"|"$)/g, '').trim());
  const results: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.replace(/(^"|"$)/g, '').trim());
    const obj: Record<string, string> = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    results.push(obj);
  }

  return results;
}
