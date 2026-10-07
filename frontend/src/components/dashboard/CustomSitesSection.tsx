// ==============================================================================
// Proyecto: BA Protege+
// Componente: CustomSitesSection (Gestión CRUD de Sitios Bloqueados Personalizados)
// Archivo: src/components/dashboard/CustomSitesSection.tsx
// ==============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { ActionButton } from '../ActionButton';
import { Badge } from '../Badge';
import { colors } from '../../theme/colors';
import { CustomBlockedDomain } from '../../types';
import { apiService } from '../../services/api.service';

interface CustomSitesSectionProps {
  customSites: CustomBlockedDomain[];
  onRefreshList: () => void;
}

export const CustomSitesSection: React.FC<CustomSitesSectionProps> = ({
  customSites,
  onRefreshList,
}) => {
  const [siteSearch, setSiteSearch] = useState('');
  const [showAddSiteModal, setShowAddSiteModal] = useState(false);
  const [newSiteDomain, setNewSiteDomain] = useState('');
  const [newSiteCategory, setNewSiteCategory] = useState('Apuestas');
  const [editingSite, setEditingSite] = useState<CustomBlockedDomain | null>(null);
  const [editSiteDomain, setEditSiteDomain] = useState('');
  const [editSiteCategory, setEditSiteCategory] = useState('Apuestas');
  const [loadingSite, setLoadingSite] = useState(false);

  const handleAddSite = async () => {
    if (!newSiteDomain.trim()) {
      Alert.alert('Campo Requerido', 'Ingresa un dominio válido (ej. casino-ilegal.bet).');
      return;
    }
    setLoadingSite(true);
    try {
      await apiService.addCustomBlockedSite(newSiteDomain, newSiteCategory);
      setNewSiteDomain('');
      setShowAddSiteModal(false);
      onRefreshList();
      Alert.alert('🛡️ Sitio Bloqueado', 'Dominio agregado a tu lista de bloqueo.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo agregar el dominio.');
    } finally {
      setLoadingSite(false);
    }
  };

  const handleStartEdit = (site: CustomBlockedDomain) => {
    setEditingSite(site);
    setEditSiteDomain(site.domain);
    setEditSiteCategory(site.category || 'Apuestas');
  };

  const handleSaveEdit = async () => {
    if (!editingSite) return;
    if (!editSiteDomain.trim()) {
      Alert.alert('Campo Requerido', 'El dominio no puede quedar vacío.');
      return;
    }
    setLoadingSite(true);
    try {
      await apiService.updateCustomBlockedSite(editingSite.id, {
        domain: editSiteDomain,
        category: editSiteCategory,
      });
      setEditingSite(null);
      onRefreshList();
      Alert.alert('✅ Sitio Actualizado', 'Los cambios fueron guardados.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo actualizar el dominio.');
    } finally {
      setLoadingSite(false);
    }
  };

  const handleToggleSiteActive = async (site: CustomBlockedDomain) => {
    try {
      await apiService.updateCustomBlockedSite(site.id, {
        isActive: !site.isActive,
      });
      onRefreshList();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo cambiar el estado del bloqueo.');
    }
  };

  const handleDeleteSite = (site: CustomBlockedDomain) => {
    Alert.alert(
      'Eliminar Sitio Bloqueado',
      `¿Deseas desbloquear y eliminar permanentemente "${site.domain}" de tu lista?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteCustomBlockedSite(site.id);
              onRefreshList();
              Alert.alert('Sitio Eliminado', `El dominio ${site.domain} fue eliminado.`);
            } catch (e: any) {
              Alert.alert('Error al eliminar', e.message || 'No se pudo eliminar el dominio.');
            }
          },
        },
      ]
    );
  };

  const filteredSites = customSites.filter((s) =>
    s.domain.toLowerCase().includes(siteSearch.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Buscador de sitios */}
      <TextInput
        style={styles.searchInput}
        placeholder="🔍 Buscar dominio bloqueado..."
        placeholderTextColor={colors.textSecondary}
        value={siteSearch}
        onChangeText={setSiteSearch}
      />

      <ActionButton
        title="+ Bloquear Nuevo Sitio Web"
        variant="primary"
        onPress={() => setShowAddSiteModal(true)}
      />

      {filteredSites.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            No tienes sitios personalizados bloqueados. Agrega dominios específicos que desees restringir.
          </Text>
        </View>
      ) : (
        filteredSites.map((site) => (
          <View key={site.id} style={styles.siteCard}>
            <View style={styles.siteCardHeader}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.siteDomainText}>🌐 {site.domain}</Text>
                <View style={styles.siteCategoryBadge}>
                  <Text style={styles.siteCategoryText}>
                    {site.category || 'Personalizado'}
                  </Text>
                </View>
              </View>
              <Badge
                status={site.isActive ? 'activo' : 'inactivo'}
                label={site.isActive ? 'BLOQUEADO' : 'PAUSADO'}
              />
            </View>

            <View style={styles.siteActionsRow}>
              <TouchableOpacity
                style={styles.siteActionButton}
                onPress={() => handleToggleSiteActive(site)}
                activeOpacity={0.7}
              >
                <Text style={styles.siteActionText}>
                  {site.isActive ? '⏸️ Pausar' : '▶️ Reanudar'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.siteActionButton}
                onPress={() => handleStartEdit(site)}
                activeOpacity={0.7}
              >
                <Text style={styles.siteActionText}>✏️ Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.siteActionButton, styles.siteActionDeleteButton]}
                onPress={() => handleDeleteSite(site)}
                activeOpacity={0.7}
              >
                <Text style={[styles.siteActionText, styles.siteActionDeleteText]}>
                  🗑️ Eliminar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      {/* Modal: Agregar Sitio */}
      <Modal
        visible={showAddSiteModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddSiteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalEmoji}>🛡️</Text>
            <Text style={styles.modalTitle}>Bloquear Sitio Web</Text>
            <Text style={styles.modalBody}>
              Ingresa el dominio o dirección web que deseas restringir en los dispositivos de tu familia.
            </Text>

            <Text style={styles.inputLabel}>Dominio o URL del Sitio:</Text>
            <TextInput
              style={styles.formInput}
              placeholder="ejemplo: casino-ilegal.bet"
              placeholderTextColor={colors.textSecondary}
              value={newSiteDomain}
              onChangeText={setNewSiteDomain}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.inputLabel}>Categoría / Motivo:</Text>
            <View style={styles.categorySelectorRow}>
              {['Apuestas', 'Redes Sociales', 'Juegos', 'Adultos', 'Personalizado'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    newSiteCategory === cat && styles.categoryChipActive,
                  ]}
                  onPress={() => setNewSiteCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      newSiteCategory === cat && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <ActionButton
              title="Guardar y Bloquear Sitio"
              variant="primary"
              loading={loadingSite}
              onPress={handleAddSite}
            />
            <ActionButton
              title="Cancelar"
              variant="secondary"
              onPress={() => setShowAddSiteModal(false)}
            />
          </View>
        </View>
      </Modal>

      {/* Modal: Editar Sitio */}
      <Modal
        visible={!!editingSite}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditingSite(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalEmoji}>✏️</Text>
            <Text style={styles.modalTitle}>Editar Sitio Bloqueado</Text>
            <Text style={styles.modalBody}>
              Modifica el dominio o la categoría del sitio restringido.
            </Text>

            <Text style={styles.inputLabel}>Dominio o URL:</Text>
            <TextInput
              style={styles.formInput}
              value={editSiteDomain}
              onChangeText={setEditSiteDomain}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.inputLabel}>Categoría:</Text>
            <View style={styles.categorySelectorRow}>
              {['Apuestas', 'Redes Sociales', 'Juegos', 'Adultos', 'Personalizado'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    editSiteCategory === cat && styles.categoryChipActive,
                  ]}
                  onPress={() => setEditSiteCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      editSiteCategory === cat && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <ActionButton
              title="Guardar Cambios"
              variant="primary"
              loading={loadingSite}
              onPress={handleSaveEdit}
            />
            <ActionButton
              title="Cancelar"
              variant="secondary"
              onPress={() => setEditingSite(null)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: 10,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginVertical: 8,
  },
  emptyText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  siteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  siteCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  siteDomainText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  siteCategoryBadge: {
    backgroundColor: '#E7F1FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  siteCategoryText: {
    fontSize: 11,
    color: '#0056B3',
    fontWeight: '600',
  },
  siteActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 8,
  },
  siteActionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  siteActionDeleteButton: {
    borderColor: '#F8D7DA',
    backgroundColor: '#FFF5F5',
  },
  siteActionText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  siteActionDeleteText: {
    color: colors.statusDanger,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
  },
  modalEmoji: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  modalBody: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 6,
    marginBottom: 4,
  },
  formInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  categorySelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 8,
  },
  categoryChip: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 11,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: '#FFF',
  },
});
