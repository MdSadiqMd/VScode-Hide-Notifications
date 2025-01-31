import * as vscode from 'vscode';

interface NotificationItem {
    message: string;
    type: 'error' | 'warning' | 'info';
    timestamp: Date;
    id: string;
}

export class NotificationTreeProvider implements vscode.TreeDataProvider<NotificationItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<NotificationItem | undefined | null | void> = new vscode.EventEmitter<NotificationItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<NotificationItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private notifications: Map<string, NotificationItem> = new Map();

    getTreeItem(element: NotificationItem): vscode.TreeItem {
        const treeItem = new vscode.TreeItem(
            element.message,
            vscode.TreeItemCollapsibleState.None
        );

        treeItem.description = element.timestamp.toLocaleTimeString();
        treeItem.tooltip = `${element.type.toUpperCase()} - ${element.timestamp.toLocaleString()}`;

        switch (element.type) {
            case 'error':
                treeItem.iconPath = new vscode.ThemeIcon('error');
                break;
            case 'warning':
                treeItem.iconPath = new vscode.ThemeIcon('warning');
                break;
            case 'info':
                treeItem.iconPath = new vscode.ThemeIcon('info');
                break;
        }

        return treeItem;
    }

    getChildren(): Thenable<NotificationItem[]> {
        return Promise.resolve(Array.from(this.notifications.values())
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
    }

    addNotification(message: string, type: 'error' | 'warning' | 'info'): void {
        const id = `${message}-${Date.now()}`;
        const notification: NotificationItem = {
            message,
            type,
            timestamp: new Date(),
            id
        };

        this.notifications.set(id, notification);
        this._onDidChangeTreeData.fire();
        console.log(`Added notification: ${type} - ${message}`);
    }

    clear(): void {
        this.notifications.clear();
        this._onDidChangeTreeData.fire();
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
}