import { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import socketService from '../services/socket';
import { cn } from '@/lib/utils';

type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

const Terminal = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize terminal
    const initializeTerminal = async () => {
      try {
        setConnectionStatus('connecting');
        setError(null);

        // Create xterm instance
        xtermRef.current = new XTerm({
          cursorBlink: true,
          cursorStyle: 'block',
          fontFamily: 'JetBrains Mono, Fira Code, Monaco, Consolas, monospace',
          fontSize: 14,
          lineHeight: 1.2,
          theme: {
            background: '#1a1a1a',
            foreground: '#ffffff',
            cursor: '#ffffff',
            cursorAccent: '#000000',
            black: '#000000',
            red: '#e06c75',
            green: '#98c379',
            yellow: '#e5c07b',
            blue: '#61afef',
            magenta: '#c678dd',
            cyan: '#56b6c2',
            white: '#ffffff',
            brightBlack: '#5c6370',
            brightRed: '#e06c75',
            brightGreen: '#98c379',
            brightYellow: '#e5c07b',
            brightBlue: '#61afef',
            brightMagenta: '#c678dd',
            brightCyan: '#56b6c2',
            brightWhite: '#ffffff'
          },
          allowTransparency: false,
          convertEol: true,
          scrollback: 1000,
          tabStopWidth: 4
        });

        // Create fit addon
        fitAddonRef.current = new FitAddon();
        xtermRef.current.loadAddon(fitAddonRef.current);

        // Open terminal in DOM
        if (terminalRef.current) {
          xtermRef.current.open(terminalRef.current);
          fitAddonRef.current.fit();
        }

        // Connect to socket
        await socketService.connect();
        setConnectionStatus('connected');

        // Handle terminal input
        xtermRef.current.onData((data: string) => {
          socketService.sendTerminalInput(data);
        });

        // Handle socket events
        socketService.onTerminalOutput((data: string) => {
          if (xtermRef.current) {
            xtermRef.current.write(data);
          }
        });

        socketService.onTerminalError((error: { message: string }) => {
          console.error('Terminal error:', error);
          setError(error.message || 'Terminal error occurred');
          if (xtermRef.current) {
            xtermRef.current.write(`\r\n\x1b[31mError: ${error.message}\x1b[0m\r\n`);
          }
        });

        socketService.onTerminalDisconnected(() => {
          setConnectionStatus('disconnected');
          if (xtermRef.current) {
            xtermRef.current.write('\r\n\x1b[33mTerminal session ended\x1b[0m\r\n');
          }
        });

        // Handle socket connection events
        socketService.onConnection(() => {
          setConnectionStatus('connected');
          setError(null);
        });

        socketService.onDisconnection((reason: string) => {
          setConnectionStatus('disconnected');
          if (xtermRef.current) {
            xtermRef.current.write(`\r\n\x1b[33mDisconnected: ${reason}\x1b[0m\r\n`);
          }
        });

        socketService.onError((error: Error) => {
          setConnectionStatus('disconnected');
          setError(error.message || 'Connection error');
        });

        // Handle window resize
        const handleResize = () => {
          if (fitAddonRef.current && xtermRef.current) {
            fitAddonRef.current.fit();
            const { cols, rows } = xtermRef.current;
            socketService.resizeTerminal(cols, rows);
          }
        };

        window.addEventListener('resize', handleResize);

        // Initial resize
        setTimeout(handleResize, 100);

        return () => {
          window.removeEventListener('resize', handleResize);
        };

      } catch (error) {
        console.error('Failed to initialize terminal:', error);
        setConnectionStatus('disconnected');
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize terminal';
        setError(errorMessage);
      }
    };

    initializeTerminal();

    // Cleanup
    return () => {
      if (xtermRef.current) {
        xtermRef.current.dispose();
      }
      socketService.removeAllListeners();
      socketService.disconnect();
    };
  }, []);

  // Handle container resize
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (fitAddonRef.current && xtermRef.current) {
        setTimeout(() => {
          if (fitAddonRef.current && xtermRef.current) {
            fitAddonRef.current.fit();
            const { cols, rows } = xtermRef.current;
            socketService.resizeTerminal(cols, rows);
          }
        }, 10);
      }
    });

    if (terminalRef.current) {
      resizeObserver.observe(terminalRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-500';
      case 'connecting':
        return 'text-yellow-500';
      case 'disconnected':
      default:
        return 'text-red-500';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
      default:
        return 'Disconnected';
    }
  };

  const handleReconnect = async () => {
    try {
      setConnectionStatus('connecting');
      setError(null);
      await socketService.connect();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reconnect';
      setError(errorMessage);
      setConnectionStatus('disconnected');
    }
  };

  const handleDisconnect = () => {
    socketService.disconnectTerminal();
  };

  return (
    <div className="h-full w-full bg-background">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-foreground">SSH Terminal</h1>
          <div className="flex items-center space-x-2">
            <div className={cn("w-2 h-2 rounded-full", 
              connectionStatus === 'connected' && "bg-green-500",
              connectionStatus === 'connecting' && "bg-yellow-500 animate-pulse",
              connectionStatus === 'disconnected' && "bg-red-500"
            )}></div>
            <span className={cn("text-sm font-medium", getStatusColor())}>
              {getStatusText()}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {connectionStatus === 'disconnected' && (
            <button
              onClick={handleReconnect}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Reconnect
            </button>
          )}
          {connectionStatus === 'connected' && (
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
            >
              Disconnect
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Terminal Container */}
      <div className="flex-1 h-[calc(100vh-80px)]">
        <div
          ref={terminalRef}
          className="w-full h-full p-4"
          style={{ 
            backgroundColor: '#1a1a1a',
            fontFamily: 'JetBrains Mono, Fira Code, Monaco, Consolas, monospace'
          }}
        />
      </div>
    </div>
  );
};

export default Terminal;