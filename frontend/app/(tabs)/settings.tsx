import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, PrimaryColors } from '@/constants/theme';
import { FLOATING_TAB_BAR_OFFSET } from '@/constants/layout';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUserProfileStore } from '@/store/userProfileStore';
import { getFrequencyLabel, loadNotificationSchedule, NotificationFrequency, scheduleProactiveNotifications, updateNotificationFrequency } from '@/utils/proactiveNotifications';
import { router, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const navigation = useRouter();
  const { clearProfile, userProfile } = useUserProfileStore();
  const insets = useSafeAreaInsets();
  const bottomPadding = useMemo(
    () => FLOATING_TAB_BAR_OFFSET + Math.max(insets.bottom, 16),
    [insets.bottom],
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [notificationFrequency, setNotificationFrequency] = useState<NotificationFrequency>('daily');
  const [showFrequencyModal, setShowFrequencyModal] = useState(false);

  useEffect(() => {
    loadNotificationSchedule().then(schedule => {
      setNotificationFrequency(schedule.frequency);
      setNotificationsEnabled(schedule.enabled);
    });
  }, []);

  const handleClearHistory = () => {
    Alert.alert(
      'Clear Chat History',
      'Are you sure you want to clear all chat history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Chat history has been cleared.');
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert('Export Data', 'Your chat data will be exported to your device.');
  };

  const handleNotificationFrequencyChange = async (frequency: NotificationFrequency) => {
    setNotificationFrequency(frequency);
    setShowFrequencyModal(false);
    
    try {
      await updateNotificationFrequency(frequency);
      
      if (frequency !== 'none' && userProfile?.displayName) {
        await scheduleProactiveNotifications(userProfile.displayName);
      }
      
      Alert.alert('Success', `Notifications set to ${getFrequencyLabel(frequency)}`);
    } catch (error) {
      console.error('Error updating notification frequency:', error);
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out? You will need to sign in again to access your account.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear user profile
              await clearProfile();
              
              // Optionally clear memories (uncomment if you want to clear memories on logout)
              // await clearMemories();
              
              // Navigate to login
              router.replace('/login');
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'Failed to log out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const SettingItem = ({
    title,
    subtitle,
    value,
    onValueChange,
    type = 'switch',
    onPress,
  }: {
    title: string;
    subtitle?: string;
    value?: boolean;
    onValueChange?: (value: boolean) => void;
    type?: 'switch' | 'button';
    onPress?: () => void;
  }) => (
    <ThemedView style={[styles.settingItem, {
      backgroundColor: colors.surface,
      borderColor: colorScheme === 'dark' ? '#2a2a2a' : '#E5E7EB',
    }]}>
      <View style={styles.settingContent}>
        <ThemedText type="defaultSemiBold" style={styles.settingTitle}>
          {title}
        </ThemedText>
        {subtitle && (
          <ThemedText style={styles.settingSubtitle}>{subtitle}</ThemedText>
        )}
      </View>
      {type === 'switch' && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#767577', true: colors.tint }}
          thumbColor={value ? '#ffffff' : '#f4f3f4'}
        />
      )}
      {type === 'button' && (
        <TouchableOpacity onPress={onPress}>
          <ThemedText style={{ color: colors.tint }}>→</ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background, paddingBottom: bottomPadding }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPadding }}
      >
        <ThemedView style={[styles.header, {
          backgroundColor: colors.surface,
          borderBottomColor: colorScheme === 'dark' ? '#2a2a2a' : '#E5E7EB',
        }]}>
          <ThemedText type="title" style={styles.headerTitle}>Settings</ThemedText>
        </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Notifications</ThemedText>
        <SettingItem
          title="Enable Notifications"
          subtitle="Receive check-in messages from Ally"
          value={notificationsEnabled}
          onValueChange={(value) => {
            setNotificationsEnabled(value);
            handleNotificationFrequencyChange(value ? 'daily' : 'none');
          }}
        />
        <SettingItem
          title="Notification Frequency"
          subtitle={getFrequencyLabel(notificationFrequency)}
          type="button"
          onPress={() => setShowFrequencyModal(true)}
        />
        <SettingItem
          title="Sound"
          subtitle="Play sound for notifications"
          value={soundEnabled}
          onValueChange={setSoundEnabled}
        />
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Chat</ThemedText>
        <SettingItem
          title="Auto-save Messages"
          subtitle="Automatically save chat history"
          value={autoSaveEnabled}
          onValueChange={setAutoSaveEnabled}
        />
        <SettingItem
          title="Clear Chat History"
          subtitle="Delete all saved conversations"
          type="button"
          onPress={handleClearHistory}
        />
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Data & Features</ThemedText>
        <SettingItem
          title="Memory Log"
          subtitle="View and manage Ally's memories"
          type="button"
          onPress={() => navigation.push('/MemoryLogScreen')}
        />
        <SettingItem
          title="Avatar Chat"
          subtitle="Chat with animated Ally avatar"
          type="button"
          onPress={() => navigation.push('/AvatarScreen')}
        />
        <SettingItem
          title="Export Chat Data"
          subtitle="Download your chat history"
          type="button"
          onPress={handleExportData}
        />
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>About</ThemedText>
        <ThemedView style={styles.aboutItem}>
          <ThemedText style={styles.aboutText}>Version 1.0.0</ThemedText>
          <ThemedText style={styles.aboutText}>Ally Chatbot</ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Logout Section */}
      <ThemedView style={styles.section}>
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.error + '15', borderColor: colors.error + '40' }]}
          onPress={handleLogout}
        >
          <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color={colors.error} />
          <ThemedText style={[styles.logoutButtonText, { color: colors.error }]}>
            Log Out
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
      </ScrollView>

      {/* Notification Frequency Modal */}
      <Modal
        visible={showFrequencyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFrequencyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="title">Notification Frequency</ThemedText>
              <TouchableOpacity onPress={() => setShowFrequencyModal(false)}>
                <IconSymbol name="xmark.circle.fill" size={24} color={PrimaryColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.frequencyOptions}>
              {(['none', 'daily', 'twice_daily'] as const).map((freq) => (
                <TouchableOpacity
                  key={freq}
                  style={[
                    styles.frequencyOption,
                    {
                      backgroundColor: notificationFrequency === freq ? colors.tint + '20' : colors.background,
                      borderColor: notificationFrequency === freq ? colors.tint : (colorScheme === 'dark' ? '#3a3a3a' : '#E5E7EB'),
                    },
                  ]}
                  onPress={() => handleNotificationFrequencyChange(freq)}
                >
                  <View style={styles.frequencyOptionContent}>
                    <ThemedText type="defaultSemiBold">{getFrequencyLabel(freq)}</ThemedText>
                    {freq === 'daily' && <ThemedText style={styles.frequencyDescription}>One message per day at 9 AM</ThemedText>}
                    {freq === 'twice_daily' && <ThemedText style={styles.frequencyDescription}>Two messages daily at 9 AM and 6 PM</ThemedText>}
                    {freq === 'none' && <ThemedText style={styles.frequencyDescription}>Disable all notifications</ThemedText>}
                  </View>
                  {notificationFrequency === freq && (
                    <IconSymbol name="checkmark.circle.fill" size={24} color={colors.tint} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </ThemedView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 24,
  },
  header: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    opacity: 0.7,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    //backgroundColor: colors.surface,
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 1,
    //borderColor: colorScheme === 'dark' ? '#2a2a2a' : '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  aboutItem: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  aboutText: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    marginTop: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  frequencyOptions: {
    maxHeight: '70%',
  },
  frequencyOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  frequencyOptionContent: {
    flex: 1,
  },
  frequencyDescription: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
  },
});

