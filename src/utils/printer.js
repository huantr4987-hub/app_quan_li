/**
 * Utility for connecting to PT-210 Thermal Printer via Web Bluetooth
 * and sending ESC/POS commands.
 */

export class BluetoothPrinter {
  constructor() {
    this.device = null;
    this.characteristic = null;
  }

  async connect() {
    try {
      this.device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'PT-210' }, { namePrefix: 'MTP-2' }, { namePrefix: 'Bluetooth' }],
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb', '49535343-fe7d-4ae5-8fa9-9fafd205e455']
      });

      const server = await this.device.gatt.connect();
      
      // Try common printer service UUIDs
      const serviceUUIDs = ['000018f0-0000-1000-8000-00805f9b34fb', '49535343-fe7d-4ae5-8fa9-9fafd205e455'];
      let service = null;
      
      for (const uuid of serviceUUIDs) {
        try {
          service = await server.getPrimaryService(uuid);
          if (service) break;
        } catch (e) {
          console.log(`Service ${uuid} not found, trying next...`);
        }
      }

      if (!service) {
        // If not found, try to list all services (requires experimental features or specific browser support)
        throw new Error("Could not find printer service. Please ensure the printer is on and compatible.");
      }

      const characteristics = await service.getCharacteristics();
      this.characteristic = characteristics.find(c => c.properties.write || c.properties.writeWithoutResponse);

      if (!this.characteristic) {
        throw new Error("Could not find write characteristic on printer.");
      }

      console.log("Connected to printer successfully!");
      return true;
    } catch (error) {
      console.error("Bluetooth Connection Error:", error);
      throw error;
    }
  }

  async print(text) {
    if (!this.characteristic) {
      throw new Error("Printer not connected.");
    }

    // Convert text to Vietnamese-compatible encoding or basic ASCII
    // Most PT-210 support UTF-8 if configured, but let's stick to basic for reliability
    // or use an encoder if available. For now, simple Uint8Array.
    
    const encoder = new TextEncoder();
    const data = encoder.encode(text + '\n\n\n'); // Add extra lines for tearing
    
    // Split into chunks (Bluetooth characteristic writes have limits, usually 20-512 bytes)
    const CHUNK_SIZE = 20;
    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
      const chunk = data.slice(i, i + CHUNK_SIZE);
      await this.characteristic.writeValue(chunk);
    }
  }

  // ESC/POS Commands
  static COMMANDS = {
    RESET: '\x1b\x40',
    ALIGN_LEFT: '\x1b\x61\x00',
    ALIGN_CENTER: '\x1b\x61\x01',
    ALIGN_RIGHT: '\x1b\x61\x02',
    BOLD_ON: '\x1b\x45\x01',
    BOLD_OFF: '\x1b\x45\x00',
    FONT_LARGE: '\x1d\x21\x11', // Double height and width
    FONT_NORMAL: '\x1d\x21\x00',
  };

  async printReceipt(receiptData) {
    const { title, subtitle, rows, totalLabel, totalValue, footer } = receiptData;
    
    let esc = BluetoothPrinter.COMMANDS.RESET;
    
    // Title
    esc += BluetoothPrinter.COMMANDS.ALIGN_CENTER;
    esc += BluetoothPrinter.COMMANDS.BOLD_ON;
    esc += BluetoothPrinter.COMMANDS.FONT_LARGE;
    esc += title + '\n';
    
    // Subtitle
    esc += BluetoothPrinter.COMMANDS.FONT_NORMAL;
    esc += subtitle + '\n';
    esc += '--------------------------------\n'; // 32 chars for 58mm
    
    // Rows
    esc += BluetoothPrinter.COMMANDS.ALIGN_LEFT;
    esc += BluetoothPrinter.COMMANDS.BOLD_OFF;
    for (const row of rows) {
      const left = row.label;
      const right = row.value;
      const spaces = 32 - left.length - right.length;
      esc += left + ' '.repeat(Math.max(1, spaces)) + right + '\n';
    }
    
    esc += '--------------------------------\n';
    
    // Total
    esc += BluetoothPrinter.COMMANDS.BOLD_ON;
    const tLabel = totalLabel;
    const tValue = totalValue;
    const tSpaces = 32 - tLabel.length - tValue.length;
    esc += tLabel + ' '.repeat(Math.max(1, tSpaces)) + tValue + '\n';
    
    // Footer
    esc += '\n';
    esc += BluetoothPrinter.COMMANDS.ALIGN_CENTER;
    esc += BluetoothPrinter.COMMANDS.BOLD_OFF;
    esc += footer + '\n';
    esc += '\n\n\n'; // Feed
    
    await this.print(esc);
  }
}

export const printer = new BluetoothPrinter();
