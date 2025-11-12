import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { hp, wp } from '../constants/StyleGuide';

interface PrivacyModalProps {
  visible: boolean;
  onClose: () => void;
  onViewPolicy?: () => void;
}

export const PrivacyModal = memo<PrivacyModalProps>(({ visible, onClose, onViewPolicy }) => {
  const { t } = useTranslation();
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          {/* Shield Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <View style={styles.shieldIcon}>
                <Text style={styles.shieldText}>🛡️</Text>
              </View>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{t('privacyModal.title')}</Text>

          {/* Description */}
          <Text style={styles.description}>
            {t('privacyModal.description')}
          </Text>

          {/* Privacy Features */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>🗑️</Text>
              <Text style={styles.featureText}>{t('privacyModal.feature1')}</Text>
            </View>

            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>🔒</Text>
              <Text style={styles.featureText}>{t('privacyModal.feature2')}</Text>
            </View>

            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>🛡️</Text>
              <Text style={styles.featureText}>{t('privacyModal.feature3')}</Text>
            </View>
          </View>

          {/* Got It Button */}
          <TouchableOpacity
            style={styles.gotItButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.gotItButtonText}>{t('privacyModal.gotIt')}</Text>
          </TouchableOpacity>

          {/* View Full Privacy Policy */}
          <TouchableOpacity
            onPress={onViewPolicy}
            activeOpacity={0.7}
          >
            <Text style={styles.policyLink}>{t('privacyModal.viewPolicy')}</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
});

PrivacyModal.displayName = 'PrivacyModal';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(5),
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: wp(6),
    padding: wp(6),
    width: '100%',
    maxWidth: wp(90),
  },
  iconContainer: {
    marginBottom: hp(2),
    alignSelf: 'center',
  },
  iconCircle: {
    width: wp(16),
    height: wp(16),
    borderRadius: wp(8),
    backgroundColor: '#E8F0FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shieldIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  shieldText: {
    fontSize: wp(8),
  },
  title: {
    fontSize: wp(6),
    fontWeight: '700',
    color: '#111827',
    marginBottom: hp(2),
    textAlign: 'center',
  },
  description: {
    fontSize: wp(3.8),
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: wp(5.5),
    marginBottom: hp(3),
    paddingHorizontal: wp(2),
  },
  featuresContainer: {
    width: '100%',
    marginBottom: hp(3),
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  featureIcon: {
    fontSize: wp(5),
    marginRight: wp(3),
    width: wp(7),
  },
  featureText: {
    fontSize: wp(3.8),
    color: '#6B7280',
    flex: 1,
  },
  gotItButton: {
    backgroundColor: '#2E70FF',
    borderRadius: wp(6),
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(8),
    width: '100%',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  gotItButtonText: {
    color: '#FFFFFF',
    fontSize: wp(4.2),
    fontWeight: '600',
  },
  policyLink: {
    color: '#2E70FF',
    fontSize: wp(3.8),
    fontWeight: '600',
  },
});
