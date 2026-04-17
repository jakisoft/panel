function getElysiumData(data: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(data).toString();
}

export { getElysiumData }