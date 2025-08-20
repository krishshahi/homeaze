import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import SecurityAPI from '../services/securityApi';

const { width } = Dimensions.get('window');

/**
 * Active Sessions Screen Component
 */
export const ActiveSessionsScreen = ({ visible, onClose }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (visible) {
      loadSessions();
    }
  }, [visible]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await SecurityAPI.getActiveSessions();
      if (response.success) {
        setSessions(response.data.sessions);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  };

  const handleRevokeSession = async (sessionId) => {
    Alert.alert(
      'Revoke Session',
      'Are you sure you want to revoke this session? You will be logged out from that device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(sessionId);
              await SecurityAPI.revokeSession(sessionId);
              Alert.alert('Success', 'Session revoked successfully');
              await loadSessions();
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to revoke session');
            } finally {
              setActionLoading(null);
            }
          }
        }
      ]
    );
  };

  const handleRevokeOtherSessions = async () => {
    Alert.alert(
      'Revoke Other Sessions',
      'This will log you out from all other devices. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke All Others',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading('others');
              const response = await SecurityAPI.revokeOtherSessions();
              Alert.alert('Success', `${response.data.revokedCount} sessions revoked`);
              await loadSessions();
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to revoke sessions');
            } finally {
              setActionLoading(null);
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile': return '📱';
      case 'tablet': return '📱';
      case 'desktop': return '💻';
      default: return '🖥️';
    }
  };

  const renderSessionItem = (session, index) => {
    const isCurrentSession = index === 0; // Assuming first session is current
    
    return (
      <View key={session.sessionId} style={[
        styles.sessionItem,
        isCurrentSession && styles.currentSessionItem
      ]}>
        <View style={styles.sessionHeader}>
          <View style={styles.deviceInfo}>
            <Text style={styles.deviceIcon}>
              {getDeviceIcon(session.deviceInfo?.deviceType)}
            </Text>
            <View style={styles.deviceDetails}>
              <Text style={styles.deviceName}>
                {session.deviceInfo?.browser || 'Unknown Browser'} on {session.deviceInfo?.os || 'Unknown OS'}
              </Text>
              <Text style={styles.deviceType}>
                {session.deviceInfo?.deviceType || 'Unknown Device'}
              </Text>
            </View>
          </View>
          {isCurrentSession && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>Current</Text>
            </View>
          )}
        </View>

        <View style={styles.sessionDetails}>
          <Text style={styles.sessionDetailText}>
            IP Address: {session.deviceInfo?.ip || 'Unknown'}
          </Text>
          <Text style={styles.sessionDetailText}>
            Last Active: {formatDate(session.lastActivity)}
          </Text>
          <Text style={styles.sessionDetailText}>
            Created: {formatDate(session.createdAt)}
          </Text>
        </View>

        {!isCurrentSession && (
          <TouchableOpacity
            style={[styles.revokeButton, actionLoading === session.sessionId && styles.loadingButton]}
            onPress={() => handleRevokeSession(session.sessionId)}
            disabled={actionLoading === session.sessionId}
          >
            {actionLoading === session.sessionId ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.revokeButtonText}>Revoke</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Active Sessions</Text>
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={handleRefresh}
            disabled={refreshing}
          >
            <Text style={styles.refreshButtonText}>
              {refreshing ? '⟳' : '↻'}
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading sessions...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <Text style={styles.description}>
                These are all the devices where you're currently signed in. Review them regularly for security.
              </Text>

              {sessions.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No active sessions found</Text>
                </View>
              ) : (
                <>
                  {sessions.map((session, index) => renderSessionItem(session, index))}
                  
                  {sessions.length > 1 && (
                    <TouchableOpacity
                      style={[styles.revokeAllButton, actionLoading === 'others' && styles.loadingButton]}
                      onPress={handleRevokeOtherSessions}
                      disabled={actionLoading === 'others'}
                    >
                      {actionLoading === 'others' ? (
                        <ActivityIndicator size="small" color={COLORS.white} />
                      ) : (
                        <Text style={styles.revokeAllButtonText}>
                          Revoke All Other Sessions ({sessions.length - 1})
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
};

/**
 * Security Dashboard Component
 */
export const SecurityDashboard = ({ visible, onClose }) => {
  const [securitySummary, setSecuritySummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadSecuritySummary();
    }
  }, [visible]);

  const loadSecuritySummary = async () => {
    try {
      setLoading(true);
      const response = await SecurityAPI.getSecuritySummary();
      if (response.success) {
        setSecuritySummary(response.data);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to load security summary');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'high': return COLORS.error;
      case 'medium': return COLORS.warning;
      case 'low': return COLORS.success;
      default: return COLORS.textSecondary;
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Security Dashboard</Text>
          <View style={styles.placeholder} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading security summary...</Text>
          </View>
        ) : securitySummary ? (
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              {/* Risk Assessment */}
              <View style={styles.riskCard}>
                <View style={styles.riskHeader}>
                  <Text style={styles.riskIcon}>
                    {getRiskIcon(securitySummary.riskAssessment?.level)}
                  </Text>
                  <View>
                    <Text style={styles.riskLevel}>
                      Security Risk: {securitySummary.riskAssessment?.level?.toUpperCase() || 'Unknown'}
                    </Text>
                    <Text style={[styles.riskSubtext, { color: getRiskColor(securitySummary.riskAssessment?.level) }]}>
                      {securitySummary.riskAssessment?.isSuspicious 
                        ? 'Suspicious activity detected'
                        : 'No suspicious activity'
                      }
                    </Text>
                  </View>
                </View>
                
                {securitySummary.riskAssessment?.reasons && securitySummary.riskAssessment.reasons.length > 0 && (
                  <View style={styles.riskReasons}>
                    <Text style={styles.riskReasonsTitle}>Security Concerns:</Text>
                    {securitySummary.riskAssessment.reasons.map((reason, index) => (
                      <Text key={index} style={styles.riskReason}>• {reason}</Text>
                    ))}
                  </View>
                )}
              </View>

              {/* Statistics Cards */}
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{securitySummary.totalActiveSessions || 0}</Text>
                  <Text style={styles.statLabel}>Active Sessions</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{securitySummary.uniqueLocations || 0}</Text>
                  <Text style={styles.statLabel}>Unique Locations</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{securitySummary.uniqueDeviceTypes || 0}</Text>
                  <Text style={styles.statLabel}>Device Types</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{securitySummary.uniqueBrowsers || 0}</Text>
                  <Text style={styles.statLabel}>Browsers</Text>
                </View>
              </View>

              {/* Suspicious Flags */}
              {securitySummary.suspiciousFlags && securitySummary.suspiciousFlags.length > 0 && (
                <View style={styles.flagsCard}>
                  <Text style={styles.cardTitle}>🚨 Security Alerts</Text>
                  {securitySummary.suspiciousFlags.map((flag, index) => (
                    <View key={index} style={styles.flagItem}>
                      <Text style={styles.flagText}>{flag}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Last Login */}
              {securitySummary.lastLogin && (
                <View style={styles.lastLoginCard}>
                  <Text style={styles.cardTitle}>🕐 Last Login</Text>
                  <Text style={styles.lastLoginText}>
                    {new Date(securitySummary.lastLogin).toLocaleString()}
                  </Text>
                </View>
              )}

              {/* Device Types */}
              {securitySummary.deviceTypes && securitySummary.deviceTypes.length > 0 && (
                <View style={styles.devicesCard}>
                  <Text style={styles.cardTitle}>📱 Connected Device Types</Text>
                  <View style={styles.devicesList}>
                    {securitySummary.deviceTypes.map((device, index) => (
                      <View key={index} style={styles.deviceTag}>
                        <Text style={styles.deviceTagText}>{device}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        ) : (
          <View style={styles.errorState}>
            <Text style={styles.errorText}>Failed to load security summary</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadSecuritySummary}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: COLORS.text,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButtonText: {
    fontSize: 18,
    color: COLORS.white,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  sessionItem: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  currentSessionItem: {
    borderColor: COLORS.primary,
    backgroundColor: '#f0f9ff',
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  deviceDetails: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  deviceType: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  currentBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  currentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  sessionDetails: {
    marginBottom: SPACING.md,
  },
  sessionDetailText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  revokeButton: {
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    minHeight: 40,
    justifyContent: 'center',
  },
  revokeButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  revokeAllButton: {
    backgroundColor: COLORS.warning,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  revokeAllButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingButton: {
    backgroundColor: COLORS.disabled,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    marginBottom: SPACING.md,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },

  // Security Dashboard Styles
  riskCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  riskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riskIcon: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  riskLevel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  riskSubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  riskReasons: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  riskReasonsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  riskReason: {
    fontSize: 14,
    color: COLORS.error,
    marginBottom: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.lg,
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
    marginRight: '2%',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  flagsCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  flagItem: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  flagText: {
    fontSize: 14,
    color: COLORS.error,
  },
  lastLoginCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  lastLoginText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  devicesCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  devicesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  deviceTag: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  deviceTagText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '600',
  },
});

export default {
  ActiveSessionsScreen,
  SecurityDashboard
};
