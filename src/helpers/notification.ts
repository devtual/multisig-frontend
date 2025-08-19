
import { toast, ToastContent } from "react-toastify";

export class Notification {
    public static show(message: ToastContent, type = NotificationType.Success, 
        position = NotificationPosition.TopRight as any, args: any = null) {
        
        let t: any = toast;
        t = t[type];
        
        return t(message, {
            position: position
        });
    }
}

export const NotificationType = {
    Success: 'success',
    Error: 'error'
}

export const NotificationPosition = {
    TopLeft: 'top-left',
    TopRight: 'top-right',
    TopCenter: 'top-center',
    BottomLeft: 'bottom-left',
    BottomRight: 'bottom-right',
    BottomCenter: 'bottom-center',
}