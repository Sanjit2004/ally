import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FLOATING_TAB_BAR_OFFSET } from '@/constants/layout';
import { Colors, PrimaryColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUserProfileStore } from '@/store/userProfileStore';
import { guessVisemeFromText, moodToReactionIntensity, REST_VISEME } from '@/utils/lipsync';
import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { WebViewMessageEvent } from 'react-native-webview';
import { WebView } from 'react-native-webview';

type AvatarOption = {
  id: string;
  name: string;
  modelUrl: string;
  previewUrl: string;
};

type AvatarConfig = {
  id?: string;
  name?: string;
  glb: string;
  preview?: string;
};

type SpeechBoundaryEvent = {
  charIndex?: number;
};

const DEFAULT_AVATAR_CONFIG: AvatarConfig[] = [
  {
    id: 'ally-default',
    name: 'Ally Default',
    glb: 'https://models.readyplayer.me/69192da88e7eb12743562fa9.glb',
  },
  {
    id: 'avatar-2',
    name: 'Professional',
    glb: 'https://models.readyplayer.me/6919567b8e7eb127435b71ee.glb',
  },
  {
    id: 'avatar-3',
    name: 'Casual',
    glb: 'https://models.readyplayer.me/691956e8672cca15c21616b0.glb',
  },
];

const parseAvatarConfig = (): AvatarConfig[] => {
  const envValue = process.env.EXPO_PUBLIC_READY_PLAYER_ME_AVATARS;
  if (!envValue) {
    return DEFAULT_AVATAR_CONFIG;
  }

  try {
    const parsed = JSON.parse(envValue);
    if (Array.isArray(parsed)) {
      const mapped = parsed
        .filter((item): item is AvatarConfig => typeof item?.glb === 'string')
        .map((item) => ({
          id: item.id,
          name: item.name,
          glb: item.glb,
          preview: item.preview,
        }));
      return mapped.length > 0 ? mapped : DEFAULT_AVATAR_CONFIG;
    }
  } catch (error) {
    console.warn('Failed to parse EXPO_PUBLIC_READY_PLAYER_ME_AVATARS. Falling back to defaults.', error);
  }

  return DEFAULT_AVATAR_CONFIG;
};

const toPreviewUrl = (glbUrl: string, explicitPreview?: string): string => {
  if (explicitPreview) return explicitPreview;

  const [base] = glbUrl.split('?');
  const pngBase = base.endsWith('.glb') ? base.replace(/\.glb$/i, '.png') : `${base}.png`;
  return pngBase;
};

const ensureQueryParams = (glbUrl: string): string => {
  const urlHasQuery = glbUrl.includes('?');
  const params = new URLSearchParams(urlHasQuery ? glbUrl.split('?')[1] : '');

  if (!params.has('morphTargets')) {
    params.set('morphTargets', 'ARKit');
  }
  if (!params.has('lod')) {
    params.set('lod', '0');
  }

  const base = glbUrl.split('?')[0];
  return `${base}?${params.toString()}`;
};

const AVATAR_OPTIONS: AvatarOption[] = parseAvatarConfig().map((entry, index) => {
  const modelUrl = ensureQueryParams(entry.glb);
  const previewUrl = toPreviewUrl(entry.glb, entry.preview);

  return {
    id: entry.id ?? `avatar-${index + 1}`,
    name: entry.name ?? `Avatar ${index + 1}`,
    modelUrl,
    previewUrl,
  };
});

const sanitizeStoredAvatarUrl = (stored?: string | null): string | null => {
  if (!stored) return null;
  if (stored.startsWith('preset:')) {
    const presetId = stored.replace('preset:', '');
    const match = AVATAR_OPTIONS.find((option) => option.id === presetId);
    return match ? match.modelUrl : null;
  }
  return ensureQueryParams(stored);
};

const buildStoredAvatarValue = (modelUrl: string): string => ensureQueryParams(modelUrl);

export default function AvatarScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { userProfile, updateProfile } = useUserProfileStore();

  const webViewRef = useRef<WebView | null>(null);

  const [viewerReady, setViewerReady] = useState(false);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(true);

  const sanitizedStoredAvatarUrl = useMemo(
    () => sanitizeStoredAvatarUrl(userProfile?.avatarUrl),
    [userProfile?.avatarUrl]
  );

  const personalAvatar = useMemo(() => {
    if (!sanitizedStoredAvatarUrl) return null;
    return {
      id: 'current',
      name: 'Current avatar',
      modelUrl: sanitizedStoredAvatarUrl,
      previewUrl: toPreviewUrl(sanitizedStoredAvatarUrl),
    };
  }, [sanitizedStoredAvatarUrl]);

  const baseOptions = useMemo(() => {
    const options = [...AVATAR_OPTIONS];
    if (personalAvatar) {
      const exists = options.some((option) => option.modelUrl === personalAvatar.modelUrl);
      return exists ? options : [personalAvatar, ...options];
    }
    return options;
  }, [personalAvatar]);

  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string>(
    sanitizedStoredAvatarUrl ?? baseOptions[0]?.modelUrl ?? ''
  );

  useEffect(() => {
    if (sanitizedStoredAvatarUrl) {
      setSelectedAvatarUrl(sanitizedStoredAvatarUrl);
    }
  }, [sanitizedStoredAvatarUrl]);

  useEffect(() => {
    if (!selectedAvatarUrl && baseOptions[0]) {
      setSelectedAvatarUrl(baseOptions[0].modelUrl);
      return;
    }

    const exists = baseOptions.some((option) => option.modelUrl === selectedAvatarUrl);
    if (!exists && baseOptions[0]) {
      setSelectedAvatarUrl(baseOptions[0].modelUrl);
    }
  }, [baseOptions, selectedAvatarUrl]);

  const reactionIntensity = useMemo(
    () => moodToReactionIntensity(userProfile?.mood),
    [userProfile?.mood]
  );

  const sendToViewer = useCallback((payload: Record<string, unknown>) => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify(payload));
    }
  }, []);

  useEffect(() => {
    if (viewerReady && selectedAvatarUrl) {
      sendToViewer({ type: 'loadAvatar', url: selectedAvatarUrl });
    }
  }, [viewerReady, selectedAvatarUrl, sendToViewer]);

  useEffect(() => {
    if (viewerReady) {
      sendToViewer({ type: 'configure', moodIntensity: reactionIntensity });
    }
  }, [viewerReady, reactionIntensity, sendToViewer]);

  useEffect(() => {
    return () => {
      Speech.stop();
      sendToViewer({ type: 'stopLipSync' });
      sendToViewer({ type: 'viseme', ...REST_VISEME });
    };
  }, [sendToViewer]);

  const selectedOption = useMemo(
    () => baseOptions.find((option) => option.modelUrl === selectedAvatarUrl) ?? baseOptions[0],
    [baseOptions, selectedAvatarUrl]
  );

  const handleAvatarSelect = (option: AvatarOption) => {
    setSelectedAvatarUrl(option.modelUrl);
    if (viewerReady) {
      sendToViewer({ type: 'loadAvatar', url: option.modelUrl });
      sendToViewer({ type: 'reaction', preset: 'userSelect', intensity: reactionIntensity });
    }
  };

  const finishVoiceTest = useCallback(() => {
    setIsTestingVoice(false);
    sendToViewer({ type: 'stopLipSync' });
    sendToViewer({ type: 'viseme', ...REST_VISEME });
    sendToViewer({ type: 'reaction', preset: 'assistantComplete', intensity: reactionIntensity });
  }, [reactionIntensity, sendToViewer]);

  const handleToggleTestVoice = async () => {
    if (isTestingVoice) {
      Speech.stop();
      finishVoiceTest();
      return;
    }

    try {
      const sampleLine = "Hey, it's Ally. I'm here and ready whenever you want to talk.";
      console.log('Starting voice test...');
      setIsTestingVoice(true);
      sendToViewer({ type: 'startLipSync', intensity: reactionIntensity });

      // Check if speech is available
      const voices = await Speech.getAvailableVoicesAsync();
      console.log('Available voices:', voices.length);

      Speech.speak(sampleLine, {
        language: 'en-US',
        rate: 0.95,
        pitch: 1.05,
        onStart: () => {
          console.log('Speech started');
        },
        onBoundary: (event?: SpeechBoundaryEvent) => {
          const charIndex = event?.charIndex ?? -1;
          const viseme = guessVisemeFromText(sampleLine, charIndex);
          if (viseme) {
            sendToViewer({ type: 'viseme', ...viseme });
          }
        },
        onDone: () => {
          console.log('Speech completed');
          finishVoiceTest();
        },
        onStopped: () => {
          console.log('Speech stopped');
          finishVoiceTest();
        },
        onError: (error) => {
          console.error('Speech error:', error);
          finishVoiceTest();
        },
      });
    } catch (error) {
      console.error('Error in voice test:', error);
      finishVoiceTest();
    }
  };

  const handleSave = async () => {
    if (!selectedAvatarUrl) return;
    try {
      setIsSaving(true);
      await updateProfile({ avatarUrl: buildStoredAvatarValue(selectedAvatarUrl) });
      router.back();
    } catch (error) {
      console.error('Error saving avatar selection:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewerMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        console.log('WebView message received:', data.type);
        if (data.type === 'ready') {
          console.log('WebView ready, loading avatar:', selectedAvatarUrl);
          setViewerReady(true);
          sendToViewer({ type: 'configure', moodIntensity: reactionIntensity });
          if (selectedAvatarUrl) {
            setAvatarLoading(true);
            sendToViewer({ type: 'loadAvatar', url: selectedAvatarUrl });
          }
        } else if (data.type === 'error') {
          console.error('Avatar viewer error:', data.message);
          setAvatarLoading(false);
        } else if (data.type === 'avatarLoaded') {
          console.log('Avatar loaded successfully:', data.url);
          setAvatarLoading(false);
        } else if (data.type === 'debug') {
          console.log('[WebView Debug]:', data.message);
        }
      } catch (error) {
        // ignore non-JSON payloads
      }
    },
    [reactionIntensity, selectedAvatarUrl, sendToViewer]
  );

  const bottomPadding = FLOATING_TAB_BAR_OFFSET + Math.max(insets.bottom, 32);
  const surfaceShadow = colorScheme === 'dark' ? undefined : styles.shadow;
  const borderColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.16)' : 'rgba(15,23,42,0.12)';

  return (
    <>
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={['top', 'left', 'right']}
      >
        <ThemedView
          style={[
            styles.header,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colorScheme === 'dark' ? '#2a2a2a' : '#E5E7EB',
            },
            surfaceShadow,
          ]}
        >
          <View style={styles.headerRow}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={[styles.backButton, { borderColor }]}
              onPress={() => router.back()}
            >
              <IconSymbol name="chevron.left" size={18} color={colors.text} />
            </TouchableOpacity>
            <ThemedText type="title" style={styles.headerTitle}>
              Choose Ally’s Avatar
            </ThemedText>
            <View style={{ width: 40 }} />
          </View>
          <ThemedText style={[styles.headerSubtitle, { color: PrimaryColors.textSecondary }]}
          >
            Pick a vibe that feels right—avatars softly blink and move so Ally feels alive.
          </ThemedText>
        </ThemedView>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}
          showsVerticalScrollIndicator={false}
        >
          <ThemedText style={[styles.sectionLabel, { color: PrimaryColors.textSecondary }]}
          >
            Suggested avatars
          </ThemedText>

          <View style={styles.cardGrid}>
            {baseOptions.map((option) => {
              const isSelected = option.modelUrl === selectedAvatarUrl;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.avatarCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: isSelected ? colors.tint : 'transparent',
                    },
                    surfaceShadow,
                  ]}
                  activeOpacity={0.85}
                  onPress={() => handleAvatarSelect(option)}
                >
                  <View style={styles.avatarPreviewWrapper}>
                    <Image
                      source={{ uri: option.previewUrl }}
                      style={styles.avatarPreview}
                      resizeMode="cover"
                      defaultSource={require('@/assets/images/partial-react-logo.png')}
                      onError={(error) => {
                        console.log('Image load error for:', option.previewUrl);
                      }}
                    />
                    {isSelected && (
                      <View style={[styles.selectedBadge, { backgroundColor: colors.tint }]}
                      >
                        <IconSymbol name="checkmark" size={14} color="#fff" />
                      </View>
                    )}
                  </View>
                  <ThemedText style={styles.avatarName}>{option.name}</ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>

          <ThemedView
            style={[
              styles.previewCard,
              { backgroundColor: colors.surface },
              surfaceShadow,
            ]}
          >
            <View style={styles.previewHeader}>
              <ThemedText style={styles.previewTitle}>Live preview</ThemedText>
              {selectedOption && (
                <ThemedText style={[styles.previewSubtitle, { color: PrimaryColors.textSecondary }]}
                >
                  {selectedOption.name}
                </ThemedText>
              )}
            </View>

            <View
              style={[
                styles.viewerContainer,
                {
                  backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.04)',
                },
              ]}
            >
              <WebView
                ref={(ref) => {
                  webViewRef.current = ref;
                }}
                originWhitelist={['*']}
                style={styles.webview}
                source={{ html: VIEWER_HTML }}
                scrollEnabled={false}
                javaScriptEnabled
                domStorageEnabled
                allowFileAccess
                allowUniversalAccessFromFileURLs
                mixedContentMode="always"
                setSupportMultipleWindows={false}
                onMessage={handleViewerMessage}
                onError={(syntheticEvent) => {
                  const { nativeEvent } = syntheticEvent;
                  console.error('WebView error:', nativeEvent);
                }}
                onHttpError={(syntheticEvent) => {
                  const { nativeEvent } = syntheticEvent;
                  console.error('WebView HTTP error:', nativeEvent);
                }}
                onLoadEnd={() => {
                  console.log('WebView loaded');
                }}
              />
              {avatarLoading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color={colors.tint} />
                  <ThemedText style={[styles.loadingText, { color: PrimaryColors.textSecondary }]}>
                    Loading avatar...
                  </ThemedText>
                </View>
              )}
            </View>

            <View style={styles.voiceRow}>
              <TouchableOpacity
                style={[
                  styles.voiceButton,
                  { backgroundColor: colors.tint, opacity: isTestingVoice ? 0.75 : 1 },
                ]}
                onPress={handleToggleTestVoice}
                accessibilityRole="button"
                accessibilityLabel="Test Ally’s voice with lip sync"
              >
                <IconSymbol name={isTestingVoice ? 'stop.fill' : 'waveform'} size={18} color="#fff" />
                <ThemedText style={styles.voiceButtonLabel}>
                  {isTestingVoice ? 'Stop Voice Test' : 'Test Voice'}
                </ThemedText>
              </TouchableOpacity>

              <ThemedText style={[styles.voiceHint, { color: PrimaryColors.textSecondary }]}
              >
                Ally lip-syncs to the sample line and reacts when speaking finishes.
              </ThemedText>
            </View>
          </ThemedView>

          <View style={styles.saveSection}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.tint, opacity: isSaving ? 0.7 : 1 }]}
              onPress={handleSave}
              disabled={isSaving}
              accessibilityRole="button"
              accessibilityLabel="Save avatar and return to chat"
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <IconSymbol name="checkmark.circle.fill" size={18} color="#fff" />
              )}
              <ThemedText style={styles.primaryLabel}>
                {isSaving ? 'Saving…' : 'Save & return to chat'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 24,
  },
  sectionLabel: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  avatarCard: {
    width: '47%',
    borderRadius: 18,
    padding: 12,
    borderWidth: 2,
  },
  avatarPreviewWrapper: {
    borderRadius: 12,
    height: 140,
    marginBottom: 12,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    overflow: 'hidden',
  },
  avatarPreview: {
    width: '100%',
    height: '100%',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarName: {
    fontSize: 15,
    fontWeight: '600',
  },
  previewCard: {
    borderRadius: 20,
    padding: 18,
    gap: 18,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  previewSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  viewerContainer: {
    borderRadius: 18,
    overflow: 'hidden',
    height: 320,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  voiceRow: {
    gap: 12,
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
  },
  voiceButtonLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  voiceHint: {
    fontSize: 13,
    lineHeight: 18,
  },
  saveSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 16,
    paddingVertical: 16,
  },
  primaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  shadow: {
    shadowColor: '#0f172a',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

const VIEWER_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        background: transparent;
        overflow: hidden;
        height: 100%;
      }
      canvas {
        display: block;
        width: 100% !important;
        height: 100% !important;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
      #debug {
        display: none !important;
      }
    </style>
  </head>
  <body>
    <div id="debug"></div>
    <canvas id="canvas"></canvas>
    <script type="importmap">
      {
        "imports": {
          "three": "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js",
          "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/"
        }
      }
    </script>
    <script type="module">
      const debugEl = document.getElementById('debug');
      function debug(msg) {
        console.log(msg);
        window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'debug', message: msg }));
      }
      
      debug('WebView script starting...');
      
      try {
        const THREE = await import('three');
        debug('Three.js loaded: ' + (THREE ? 'YES' : 'NO'));
        
        const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
        debug('GLTFLoader loaded: ' + (GLTFLoader ? 'YES' : 'NO'));
        
        const { DRACOLoader } = await import('three/addons/loaders/DRACOLoader.js');
        debug('DRACOLoader loaded: ' + (DRACOLoader ? 'YES' : 'NO'));

      const renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('canvas'),
        alpha: true,
        antialias: true,
      });
      renderer.setPixelRatio(window.devicePixelRatio || 1);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      renderer.setClearColor(0x000000, 0);
      renderer.setSize(window.innerWidth, window.innerHeight);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
      camera.position.set(0, 1.65, 2.5);
      camera.lookAt(0, 1.5, 0);

      // Better lighting setup
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambientLight);
      
      const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
      keyLight.position.set(2, 3, 3);
      scene.add(keyLight);
      
      const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
      fillLight.position.set(-2, 2, -1);
      scene.add(fillLight);
      
      const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
      backLight.position.set(0, 3, -3);
      scene.add(backLight);

      const loader = new GLTFLoader();
      loader.setCrossOrigin('anonymous');

      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
      loader.setDRACOLoader(dracoLoader);
      const clock = new THREE.Clock();

      const defaultAvatarUrl = '${AVATAR_OPTIONS[0]?.modelUrl ?? ''}';

      let avatar = null;
      let mixer = null;
      let lipSyncActive = false;
      let visemeTimeout = null;
      let blinkState = 'idle';
      let blinkTimer = 2 + Math.random() * 3;
      let blinkElapsed = 0;
      let lookPhase = 0;
      let baseMoodIntensity = 0.8;
      let reactionState = null;
      let baseRotationX = 0;
      let basePositionY = 0;

      const morphMeshes = [];

      const visemeMappings = {
        rest: [],
        open: ['jawOpen', 'mouthOpen', 'viseme_aa', 'viseme_ao'],
        wide: ['viseme_ih', 'viseme_ee', 'mouthSmileLeft', 'mouthSmileRight'],
        narrow: ['viseme_oh', 'viseme_oo'],
        closed: ['viseme_m', 'viseme_bm'],
        teeth: ['viseme_fv'],
      };

      const allVisemeTargets = Array.from(
        new Set(Object.values(visemeMappings).flat())
      );

      function cacheMorphTargets(root) {
        morphMeshes.length = 0;
        root.traverse((child) => {
          if (child.isSkinnedMesh && child.morphTargetDictionary) {
            morphMeshes.push(child);
          }
        });
      }

      function setMorph(names, value) {
        const targets = Array.isArray(names) ? names : [names];
        morphMeshes.forEach((mesh) => {
          const dict = mesh.morphTargetDictionary || {};
          targets.forEach((name) => {
            const index = dict[name];
            if (typeof index === 'number' && mesh.morphTargetInfluences) {
              mesh.morphTargetInfluences[index] = value;
            }
          });
        });
      }

      function resetBlink() {
        setMorph(['eyeBlinkLeft', 'eyeBlinkRight'], 0);
      }

      function clearVisemes() {
        allVisemeTargets.forEach((name) => setMorph(name, 0));
      }

      function applyViseme(command) {
        if (!command) return;
        if (command.shape !== 'rest' && !lipSyncActive) return;

        clearTimeout(visemeTimeout);

        if (command.shape === 'rest') {
          clearVisemes();
          return;
        }

        const names = visemeMappings[command.shape] || [];
        const amount = typeof command.amount === 'number' ? command.amount : 0.8;
        const duration = typeof command.duration === 'number' ? command.duration : 160;

        names.forEach((name) => setMorph(name, amount));
        visemeTimeout = setTimeout(() => {
          names.forEach((name) => setMorph(name, 0));
        }, duration);
      }

      function triggerReaction(preset, intensity) {
        reactionState = {
          preset,
          intensity: typeof intensity === 'number' ? intensity : 0.8,
          elapsed: 0,
          duration: preset === 'assistantComplete' ? 1.1 : 0.9,
        };

        if (preset === 'assistantComplete') {
          setMorph(['browOuterUpLeft', 'browOuterUpRight'], 0.6 * reactionState.intensity);
        }
      }

      function updateReaction(delta) {
        if (!reactionState || !avatar) return;
        reactionState.elapsed += delta;
        const progress = Math.min(reactionState.elapsed / reactionState.duration, 1);
        const eased = Math.sin(progress * Math.PI);

        switch (reactionState.preset) {
          case 'userSelect':
            avatar.rotation.x = baseRotationX + eased * 0.22 * reactionState.intensity;
            break;
          case 'assistantComplete':
            avatar.rotation.x = baseRotationX + eased * 0.08 * reactionState.intensity;
            break;
        }

        if (reactionState.elapsed >= reactionState.duration) {
          avatar.rotation.x = baseRotationX;
          setMorph(['browOuterUpLeft', 'browOuterUpRight'], 0);
          reactionState = null;
        }
      }

      function loadAvatar(url) {
        if (!url) {
          console.error('No avatar URL provided');
          return;
        }
        console.log('Loading avatar from:', url);
        loader.load(
          url,
          (gltf) => {
            debug('Avatar GLTF loaded, adding to scene...');
            if (avatar) {
              scene.remove(avatar);
            }

            avatar = gltf.scene;
            
            // Calculate bounding box to ensure proper positioning
            const box = new THREE.Box3().setFromObject(avatar);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            
            // Position avatar so feet are at y=0 and centered
            basePositionY = -center.y - box.min.y;
            avatar.position.set(0, basePositionY, 0);
            avatar.rotation.set(0, 0, 0);
            baseRotationX = 0;
            scene.add(avatar);
            
            debug('Avatar added! Size: ' + size.y.toFixed(2) + 'm, Children: ' + avatar.children.length);

            cacheMorphTargets(avatar);
            resetBlink();
            clearVisemes();

            mixer = null;
            if (gltf.animations && gltf.animations.length) {
              mixer = new THREE.AnimationMixer(avatar);
              const idleClip =
                gltf.animations.find((clip) => clip.name.toLowerCase().includes('idle')) ||
                gltf.animations[0];
              if (idleClip) {
                const action = mixer.clipAction(idleClip);
                action.play();
              }
            }
            
            window.ReactNativeWebView?.postMessage(
              JSON.stringify({ type: 'avatarLoaded', url })
            );
          },
          (progress) => {
            console.log('Loading progress:', (progress.loaded / progress.total * 100).toFixed(2) + '%');
          },
          (error) => {
            console.error('Avatar loading error:', error);
            window.ReactNativeWebView?.postMessage(
              JSON.stringify({ type: 'error', message: error.message || 'Failed to load avatar' })
            );
          }
        );
      }

      if (defaultAvatarUrl) {
        loadAvatar(defaultAvatarUrl);
      }

      function startLipSync(intensity) {
        lipSyncActive = true;
        if (typeof intensity === 'number') {
          baseMoodIntensity = intensity;
        }
        clearVisemes();
      }

      function stopLipSync() {
        lipSyncActive = false;
        clearVisemes();
      }

      function updateBlink(delta) {
        switch (blinkState) {
          case 'idle':
            blinkTimer -= delta;
            if (blinkTimer <= 0) {
              blinkState = 'closing';
              blinkElapsed = 0;
            }
            break;
          case 'closing':
            blinkElapsed += delta;
            const closeProgress = Math.min(blinkElapsed / 0.07, 1);
            setMorph(['eyeBlinkLeft', 'eyeBlinkRight'], closeProgress);
            if (closeProgress >= 1) {
              blinkState = 'opening';
              blinkElapsed = 0;
            }
            break;
          case 'opening':
            blinkElapsed += delta;
            const openProgress = 1 - Math.min(blinkElapsed / 0.08, 1);
            setMorph(['eyeBlinkLeft', 'eyeBlinkRight'], Math.max(0, openProgress));
            if (openProgress <= 0) {
              blinkState = 'idle';
              blinkTimer = 2 + Math.random() * 4;
            }
            break;
        }
      }

      function render() {
        requestAnimationFrame(render);
        const delta = clock.getDelta();
        if (mixer) {
          mixer.update(delta);
        }

        if (avatar) {
          lookPhase += delta * (0.6 + baseMoodIntensity * 0.4);
          const sway = Math.sin(lookPhase) * 0.15 * baseMoodIntensity;
          avatar.rotation.y = sway;

          const breathe = Math.sin(lookPhase * 0.9) * 0.01 * baseMoodIntensity;
          avatar.position.y = basePositionY + breathe;
        }

        updateBlink(delta);
        updateReaction(delta);

        renderer.render(scene, camera);
      }
      render();

      function handleMessage(event) {
        let data = null;
        try {
          data = JSON.parse(event.data);
        } catch (error) {
          return;
        }

        if (!data) return;
        switch (data.type) {
          case 'loadAvatar':
            loadAvatar(data.url);
            break;
          case 'startLipSync':
            startLipSync(data.intensity);
            break;
          case 'stopLipSync':
            stopLipSync();
            break;
          case 'viseme':
            applyViseme(data);
            break;
          case 'reaction':
            triggerReaction(data.preset, data.intensity);
            break;
          case 'configure':
            if (typeof data.moodIntensity === 'number') {
              baseMoodIntensity = data.moodIntensity;
            }
            break;
        }
      }

      document.addEventListener('message', handleMessage);
      window.addEventListener('message', handleMessage);

      function handleResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }

      window.addEventListener('resize', handleResize);

      window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'ready' }));
      
      } catch (error) {
        debug('ERROR: ' + error.message);
        window.ReactNativeWebView?.postMessage(JSON.stringify({ 
          type: 'error', 
          message: 'Failed to initialize: ' + error.message 
        }));
      }
    </script>
  </body>
</html>`;
