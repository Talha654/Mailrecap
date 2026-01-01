import React from 'react';
import Toast, { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';
import { wp, hp } from '../constants/StyleGuide';

/**
 * Custom Toast Configuration
 * Provides styled success, error, and info toast notifications
 */
const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#000F54',
        borderLeftWidth: 5,
        backgroundColor: '#000F54',
        height: hp(8),
      }}
      contentContainerStyle={{
        paddingHorizontal: wp(4),
      }}
      text1Style={{
        fontSize: wp(4),
        fontWeight: '700',
        color: '#fff',
      }}
      text2Style={{
        fontSize: wp(3.5),
        color: '#fff',
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: '#D6212F',
        borderLeftWidth: 5,
        backgroundColor: '#FEF2F2',
        height: hp(8),
      }}
      contentContainerStyle={{
        paddingHorizontal: wp(4),
      }}
      text1Style={{
        fontSize: wp(4),
        fontWeight: '700',
        color: '#991B1B',
      }}
      text2Style={{
        fontSize: wp(3.5),
        color: '#DC2626',
      }}
    />
  ),
  info: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#3B82F6',
        borderLeftWidth: 5,
        backgroundColor: '#EFF6FF',
        height: hp(8),
      }}
      contentContainerStyle={{
        paddingHorizontal: wp(4),
      }}
      text1Style={{
        fontSize: wp(4),
        fontWeight: '700',
        color: '#1E40AF',
      }}
      text2Style={{
        fontSize: wp(3.5),
        color: '#2563EB',
      }}
    />
  ),
};

/**
 * Toast Component
 * Renders the toast notification container with custom configuration
 */
export const ToastComponent: React.FC = () => {
  return <Toast config={toastConfig} />;
};

/**
 * Helper functions to show toast notifications
 */
export const showSuccessToast = (title: string, message?: string) => {
  Toast.show({
    type: 'success',
    text1: title,
    text2: message,
    visibilityTime: 3000,
    autoHide: true,
    topOffset: hp(6),
  });
};

export const showErrorToast = (title: string, message?: string) => {
  Toast.show({
    type: 'error',
    text1: title,
    text2: message,
    visibilityTime: 3000,
    autoHide: true,
    topOffset: hp(6),
  });
};

export const showInfoToast = (title: string, message?: string) => {
  Toast.show({
    type: 'info',
    text1: title,
    text2: message,
    visibilityTime: 3000,
    autoHide: true,
    topOffset: hp(6),
  });
};

export default ToastComponent;
