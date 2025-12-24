export function downloadZipFromUrl(fileUrl: string, filename: string = 'document.zip'): void {
  if (!fileUrl) return;

  const link = document.createElement('a');
  link.href = fileUrl;
  link.setAttribute('download', filename);
  link.setAttribute('target', '_blank');
  link.setAttribute('rel', 'noopener noreferrer');

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

