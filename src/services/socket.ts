import { io, Socket } from 'socket.io-client';

interface TerminalError {
  message: string;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private connectionCallbacks: (() => void)[] = [];
  private disconnectionCallbacks: ((reason: string) => void)[] = [];
  private errorCallbacks: ((error: Error) => void)[] = [];

  /**
   * Connect to the Socket.io server
   */
  connect(serverUrl: string = ''): Promise<Socket> {
    return new Promise((resolve, reject) => {
      try {
        // Connect to the terminal namespace using relative URL (proxy will handle routing)
        const socketUrl = serverUrl || window.location.origin;
        this.socket = io(`${socketUrl}/terminal`, {
          transports: ['websocket', 'polling'],
          timeout: 10000,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        // Connection successful
        this.socket.on('connect', () => {
          console.log('Connected to terminal server:', this.socket?.id);
          this.isConnected = true;
          this.connectionCallbacks.forEach(callback => callback());
          resolve(this.socket!);
        });

        // Connection error
        this.socket.on('connect_error', (error: Error) => {
          console.error('Connection error:', error);
          this.isConnected = false;
          this.errorCallbacks.forEach(callback => callback(error));
          reject(error);
        });

        // Disconnection
        this.socket.on('disconnect', (reason: string) => {
          console.log('Disconnected from server:', reason);
          this.isConnected = false;
          this.disconnectionCallbacks.forEach(callback => callback(reason));
        });

        // Reconnection attempt
        this.socket.on('reconnect_attempt', (attemptNumber: number) => {
          console.log(`Reconnection attempt ${attemptNumber}`);
        });

        // Reconnection successful
        this.socket.on('reconnect', (attemptNumber: number) => {
          console.log(`Reconnected after ${attemptNumber} attempts`);
          this.isConnected = true;
          this.connectionCallbacks.forEach(callback => callback());
        });

        // Reconnection failed
        this.socket.on('reconnect_failed', () => {
          console.error('Failed to reconnect to server');
          this.isConnected = false;
        });

      } catch (error) {
        console.error('Socket connection error:', error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * Send terminal input to the server
   */
  sendTerminalInput(data: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('terminal-input', data);
    } else {
      console.warn('Socket not connected. Cannot send terminal input.');
    }
  }

  /**
   * Listen for terminal output from the server
   */
  onTerminalOutput(callback: (data: string) => void): void {
    if (this.socket) {
      this.socket.on('terminal-output', callback);
    }
  }

  /**
   * Listen for terminal errors
   */
  onTerminalError(callback: (error: TerminalError) => void): void {
    if (this.socket) {
      this.socket.on('terminal-error', callback);
    }
  }

  /**
   * Listen for terminal disconnection
   */
  onTerminalDisconnected(callback: () => void): void {
    if (this.socket) {
      this.socket.on('terminal-disconnected', callback);
    }
  }

  /**
   * Send terminal resize event
   */
  resizeTerminal(cols: number, rows: number): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('terminal-resize', { cols, rows });
    }
  }

  /**
   * Manually disconnect terminal
   */
  disconnectTerminal(): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('terminal-disconnect');
    }
  }

  /**
   * Add connection callback
   */
  onConnection(callback: () => void): void {
    this.connectionCallbacks.push(callback);
  }

  /**
   * Add disconnection callback
   */
  onDisconnection(callback: (reason: string) => void): void {
    this.disconnectionCallbacks.push(callback);
  }

  /**
   * Add error callback
   */
  onError(callback: (error: Error) => void): void {
    this.errorCallbacks.push(callback);
  }

  /**
   * Remove all event listeners
   */
  removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
    this.connectionCallbacks = [];
    this.disconnectionCallbacks = [];
    this.errorCallbacks = [];
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Get socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Export singleton instance
export default new SocketService();