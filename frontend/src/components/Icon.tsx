// ==============================================================================
// Proyecto: BA Protege+
// Componente: Icon (Íconos Oficiales PNG del Kit UI)
// Archivo: src/components/Icon.tsx
// Descripción: Componente unificado para renderizar los íconos PNG oficiales del proyecto
//              compatibles con Android, iOS y Web.
// ==============================================================================

import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

import alertaPng from '../assets/icons/alerta.png';
import busquedaPng from '../assets/icons/busqueda.png';
import campanaPng from '../assets/icons/campana.png';
import candadoPng from '../assets/icons/candado.png';
import checkPng from '../assets/icons/check.png';
import manosPng from '../assets/icons/manos.png';
import ojoPng from '../assets/icons/ojo.png';
import relojPng from '../assets/icons/reloj.png';
import usuarioPng from '../assets/icons/usuario.png';
import volverPng from '../assets/icons/volver.png';

export type IconName =
  | 'ojo'
  | 'manos'
  | 'reloj'
  | 'check'
  | 'volver'
  | 'alerta'
  | 'busqueda'
  | 'campana'
  | 'candado'
  | 'usuario';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: any;
}

const ICON_MAP: Record<IconName, any> = {
  alerta: alertaPng,
  busqueda: busquedaPng,
  campana: campanaPng,
  candado: candadoPng,
  check: checkPng,
  manos: manosPng,
  ojo: ojoPng,
  reloj: relojPng,
  usuario: usuarioPng,
  volver: volverPng,
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color,
  style,
}) => {
  const iconSource = ICON_MAP[name];
  if (!iconSource) return null;

  return (
    <View style={[styles.container, style]}>
      <Image
        source={iconSource}
        style={[
          { width: size, height: size, resizeMode: 'contain' },
          color ? { tintColor: color } : null,
          style,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
