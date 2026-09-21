export class OfflineManager {
  private static STORAGE_KEY = 'voiceInvoiceOfflineData';

  static saveOfflineData(data: any): void {
    try {
      const existingData = this.getOfflineData();
      existingData.push({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        data,
        synced: false
      });
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingData));
    } catch (error) {
      console.error('Error saving offline data:', error);
    }
  }

  static getOfflineData(): any[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error retrieving offline data:', error);
      return [];
    }
  }

  static getUnsyncedData(): any[] {
    return this.getOfflineData().filter(item => !item.synced);
  }

  static markAsSynced(id: string): void {
    try {
      const data = this.getOfflineData();
      const updated = data.map(item => 
        item.id === id ? { ...item, synced: true } : item
      );
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error marking data as synced:', error);
    }
  }

  static async syncOfflineData(): Promise<void> {
    const unsyncedData = this.getUnsyncedData();
    
    for (const item of unsyncedData) {
      try {
        // Here you would sync with your backend
        // For now, we'll just mark as synced
        await new Promise(resolve => setTimeout(resolve, 100));
        this.markAsSynced(item.id);
      } catch (error) {
        console.error('Error syncing item:', error);
      }
    }
  }

  static clearOfflineData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}