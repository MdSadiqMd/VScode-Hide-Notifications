import * as vscode from 'vscode';
import { NotificationTreeProvider } from './notification-view';

let notificationProvider: NotificationTreeProvider;

export function activate(context: vscode.ExtensionContext) {
    notificationProvider = new NotificationTreeProvider();
    vscode.window.registerTreeDataProvider(
        'notificationExplorer',
        notificationProvider
    );

    const notificationLog = vscode.window.createOutputChannel('Notifications Log');
    function logNotification(message: string, type: 'info' | 'warning' | 'error') {
        notificationLog.appendLine(`[${type.toUpperCase()}] ${new Date().toLocaleTimeString()}: ${message}`);
        notificationProvider.addNotification(message, type); // Add to Notification Explorer
    }
    const originalShowInformationMessage = vscode.window.showInformationMessage;
    const originalShowWarningMessage = vscode.window.showWarningMessage;
    const originalShowErrorMessage = vscode.window.showErrorMessage;

    const overrideNotification = (
        originalMethod: typeof vscode.window.showInformationMessage,
        type: 'info' | 'warning' | 'error'
    ) => {
        return function (message: string, ...args: any[]) {
            logNotification(message, type); // Log and add to Notification Explorer
            return Promise.resolve(undefined); // Suppress popup
        };
    };

    vscode.window.showInformationMessage = overrideNotification(originalShowInformationMessage, 'info');
    vscode.window.showWarningMessage = overrideNotification(originalShowWarningMessage, 'warning');
    vscode.window.showErrorMessage = overrideNotification(originalShowErrorMessage, 'error');
    vscode.window.showErrorMessage('Test error message');

    context.subscriptions.push(
        vscode.commands.registerCommand('notification-explorer.clear', () => notificationProvider.clear())
    );

    const originalConsoleLog = console.log;
    console.log = (...args: any[]) => {
        const message = args.join(' ');
        logNotification(message, 'info');
        originalConsoleLog(...args);
    };

    const originalConsoleWarn = console.warn;
    console.warn = (...args: any[]) => {
        const message = args.join(' ');
        logNotification(message, 'warning');
        originalConsoleWarn(...args);
    };

    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
        const message = args.join(' ');
        logNotification(message, 'error');
        originalConsoleError(...args);
    };
}

export function deactivate() { }