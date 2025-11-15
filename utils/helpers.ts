

export const formatDateHeading = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('de-DE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC' 
    }).format(date);
};

export const downloadBlob = (blob: Blob, filename: string): void => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
