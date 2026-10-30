// ==============================================================================
// Proyecto: BA Protege+
// Componente: Web Simulator - React Native Shim for Vite
// Archivo: src/web/react-native-shim.tsx
// Descripción: Shim ligero de compatibilidad React Native para Vite Web Simulator.
// ==============================================================================

import React from 'react';

function styleToCss(style: any): React.CSSProperties {
  if (!style) return {};
  if (Array.isArray(style)) {
    return style.reduce((acc, curr) => ({ ...acc, ...styleToCss(curr) }), {});
  }
  if (typeof style === 'object') {
    const css: any = {};
    for (const key in style) {
      const val = style[key];
      if (val === undefined || val === null) continue;

      // Conversión de propiedades React Native a CSS Web
      if (key === 'gap') css.gap = val;
      else if (key === 'paddingHorizontal') {
        css.paddingLeft = val;
        css.paddingRight = val;
      } else if (key === 'paddingVertical') {
        css.paddingTop = val;
        css.paddingBottom = val;
      } else if (key === 'marginHorizontal') {
        css.marginLeft = val;
        css.marginRight = val;
      } else if (key === 'marginVertical') {
        css.marginTop = val;
        css.marginBottom = val;
      } else if (key === 'borderRadius') css.borderRadius = `${val}px`;
      else if (key === 'borderWidth') {
        css.borderWidth = `${val}px`;
        css.borderStyle = 'solid';
      } else if (key === 'tintColor') css.color = val;
      else css[key] = val;
    }
    return css;
  }
  return {};
}

export const View: React.FC<any> = ({ children, style, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', boxSizing: 'border-box', ...styleToCss(style) }} {...props}>
    {children}
  </div>
);

export const Text: React.FC<any> = ({ children, style, ...props }) => (
  <span style={{ boxSizing: 'border-box', ...styleToCss(style) }} {...props}>
    {children}
  </span>
);

export const Image: React.FC<any> = ({ source, style, resizeMode = 'contain', ...props }) => {
  const src = typeof source === 'object' && source?.uri ? source.uri : source;
  return (
    <img
      src={src}
      style={{ objectFit: resizeMode as any, ...styleToCss(style) }}
      {...props}
    />
  );
};

export const TouchableOpacity: React.FC<any> = ({ children, style, onPress, activeOpacity, ...props }) => (
  <button
    onClick={onPress}
    style={{
      background: 'none',
      border: 'none',
      padding: 0,
      margin: 0,
      cursor: 'pointer',
      textAlign: 'inherit',
      font: 'inherit',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      ...styleToCss(style),
    }}
    {...props}
  >
    {children}
  </button>
);

export const SafeAreaView: React.FC<any> = ({ children, style, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: '100vh', boxSizing: 'border-box', ...styleToCss(style) }} {...props}>
    {children}
  </div>
);

export const ScrollView: React.FC<any> = ({ children, style, contentContainerStyle, ...props }) => (
  <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', ...styleToCss(style) }} {...props}>
    <div style={{ display: 'flex', flexDirection: 'column', ...styleToCss(contentContainerStyle) }}>
      {children}
    </div>
  </div>
);

export const StyleSheet = {
  create: (styles: any) => styles,
  flatten: (styles: any) => styleToCss(styles),
};

export const Dimensions = {
  get: () => ({ width: 375, height: 812, scale: 2, fontScale: 1 }),
  addEventListener: () => ({ remove: () => {} }),
};

export const Platform = {
  OS: 'web',
  select: (obj: any) => obj.web || obj.default,
};

export const Alert = {
  alert: (title: string, message?: string) => {
    window.alert(`${title}${message ? `\n\n${message}` : ''}`);
  },
};

export default {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
  Alert,
};
