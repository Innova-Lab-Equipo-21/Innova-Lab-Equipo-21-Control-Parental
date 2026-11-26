// ==============================================================================
// Proyecto: BA Protege+
// Componente: ProfileSection Styles
// Archivo: src/components/dashboard/cuenta/ProfileSection.styles.ts
// Descripción: Estilos modulares desacoplados para la tarjeta de perfil del tutor,
//              insignias de verificación, botones de acción y modales asociados.
// ==============================================================================

import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

/**
 * Reglas de diseño para la tarjeta de perfil de usuario responsable, sus etiquetas de rol,
 * botones para vincular cuentas de terceros y modales de edición de datos personales.
 */
export const styles = StyleSheet.create({
  /** Tarjeta contenedor principal del perfil de usuario */
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
  },
  /** Encabezado horizontal que agrupa el avatar y la información personal del usuario */
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  /** Contenedor circular con borde blanco para alojar el avatar o ícono del tutor */
  profileAvatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
  },
  /** Imagen del avatar dentro del contenedor circular */
  avatarImage: {
    width: 44,
    height: 44,
  },
  /** Columna con el nombre, correo, teléfono y roles del usuario */
  profileInfo: {
    flex: 1,
  },
  /** Texto en negrita para el nombre completo del tutor */
  profileName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  /** Texto secundario para la dirección de correo electrónico */
  profileEmail: {
    fontSize: 12.5,
    color: colors.textSecondary,
    marginTop: 1,
  },
  /** Texto secundario para el número telefónico del tutor */
  profilePhone: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  /** Fila contenedora de insignias (Rol Responsable + Verificación +18) */
  roleBadgeContainer: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
    alignItems: 'center',
  },
  /** Contenedor pequeño para la insignia de rol */
  roleBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  /** Texto en la insignia de rol */
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  /** Contenedor para la insignia de verificación institucional +18 */
  verifiedBadge: {
    backgroundColor: '#D1E7DD',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  /** Texto de verificación de mayoría de edad */
  verifiedBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#0F5132',
  },
  /** Nota explicativa o aviso debajo de la información del avatar */
  photoNotice: {
    fontSize: 11,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 12,
    backgroundColor: '#F8F9FA',
    padding: 8,
    borderRadius: 8,
  },
  /** Fila con los botones principales (Editar Perfil y Vinculación Google) */
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
    alignItems: 'center',
  },
  /** Botón de diseño institucional para iniciar la vinculación con Google */
  googleLinkButton: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginVertical: 8,
    flexDirection: 'row',
    backgroundColor: '#F2F2F2',
    borderWidth: 1.5,
    borderColor: '#DADCE0',
    overflow: 'hidden',
  },
  /** Texto del botón de vinculación con Google */
  googleLinkButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3C4043',
  },
  /** Estado del botón cuando la cuenta ya ha sido vinculada exitosamente a Google */
  googleLinkedButton: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginVertical: 8,
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    borderWidth: 1.5,
    borderColor: '#A5D6A7',
  },
  /** Texto del botón de cuenta vinculada a Google */
  googleLinkedButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E7D32',
  },
  /** Tamaño del ícono oficial de Google */
  googleIconSmall: {
    width: 18,
    height: 18,
  },
  /** Imagen oficial completa del botón de Google sin texto adicional */
  googleLogoOnly: {
    width: '100%',
    height: 36,
  },
  /** Fondo semitransparente para overlays modales */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  /** Contenedor interior del cuerpo del modal */
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  /** Encabezado del modal de edición de datos */
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  /** Título principal dentro del modal */
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  /** Subtítulo descriptivo en el modal */
  modalSubtitle: {
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  /** Botón de cierre en el modal */
  modalCloseBtn: {
    padding: 4,
    marginLeft: 8,
  },
  /** Texto 'X' o ícono del botón de cierre */
  modalCloseText: {
    fontSize: 20,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  /** Grupo de campo e etiqueta en formularios */
  inputGroup: {
    marginBottom: 14,
  },
  /** Etiqueta descriptiva del campo de entrada */
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  /** Indicador de campo obligatorio asterisk */
  requiredAsterisk: {
    color: '#DC3545',
    fontWeight: '700',
  },
  /** Contenedor de caja de texto para entradas */
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 12,
  },
  /** Borde destacado al enfocar el campo */
  inputFocusedBorder: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
  },
  /** Borde de error en caso de validación fallida */
  inputErrorBorder: {
    borderColor: colors.statusDanger,
    backgroundColor: '#FFF8F8',
  },
  /** Estilos directos de la caja TextInput */
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    height: '100%',
  },
  /** Texto de error de validación bajo la caja de entrada */
  fieldErrorText: {
    fontSize: 11,
    color: colors.statusDanger,
    fontWeight: '500',
    marginTop: 4,
    marginLeft: 2,
  },
  /** Distribución para desplegables tipo dropdown */
  dropdownContainer: {
    justifyContent: 'space-between',
  },
  /** Texto seleccionado dentro del desplegable */
  dropdownSelectedText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  /** Texto placeholder en desplegables sin valor */
  dropdownPlaceholderText: {
    color: colors.textMuted,
  },
  /** Flecha o indicador del menú desplegable */
  dropdownArrow: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  /** Menú flotante desplegable con opciones */
  dropdownMenu: {
    marginTop: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  /** Opción individual dentro del menú desplegable */
  dropdownMenuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  /** Estilo de opción seleccionada en el menú */
  dropdownMenuItemSelected: {
    backgroundColor: colors.primaryLight,
  },
  /** Texto de cada opción del menú desplegable */
  dropdownMenuItemText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  /** Texto de la opción seleccionada */
  dropdownMenuItemTextSelected: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  /** Marca de verificación en opción elegida */
  dropdownCheckmark: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  /** Zona de peligro para acciones críticas como eliminar la cuenta */
  dangerZoneContainer: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FEB2B2',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
  },
  /** Título dentro de la zona de peligro */
  dangerZoneTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#C53030',
    marginBottom: 4,
  },
  /** Subtítulo admonitorio de la zona de peligro */
  dangerZoneSubtitle: {
    fontSize: 12,
    color: '#9B2C2C',
    marginBottom: 12,
    lineHeight: 16,
  },
});
