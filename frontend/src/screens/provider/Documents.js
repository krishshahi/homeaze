import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const Documents = () => {
  const navigation = useNavigation();
  
  const mockDocuments = {
    identity: {
      title: 'Identity Verification',
      status: 'verified',
      documents: [
        {
          id: 'id1',
          type: 'Driver\'s License',
          status: 'verified',
          expiryDate: '2025-12-31',
          uploadDate: '2024-01-15',
          fileUrl: 'path/to/drivers-license.jpg',
        },
      ],
      required: true,
    },
    business: {
      title: 'Business Documents',
      status: 'verified',
      documents: [
        {
          id: 'bus1',
          type: 'Business Registration',
          status: 'verified',
          expiryDate: null,
          uploadDate: '2024-01-15',
          fileUrl: 'path/to/business-reg.pdf',
        },
        {
          id: 'bus2',
          type: 'Tax Certificate',
          status: 'verified',
          expiryDate: '2024-12-31',
          uploadDate: '2024-01-15',
          fileUrl: 'path/to/tax-cert.pdf',
        },
      ],
      required: true,
    },
    insurance: {
      title: 'Insurance',
      status: 'expiring_soon',
      documents: [
        {
          id: 'ins1',
          type: 'Liability Insurance',
          status: 'expiring_soon',
          expiryDate: '2024-03-15',
          uploadDate: '2023-03-15',
          fileUrl: 'path/to/insurance.pdf',
        },
      ],
      required: true,
    },
    certifications: {
      title: 'Professional Certifications',
      status: 'incomplete',
      documents: [
        {
          id: 'cert1',
          type: 'Cleaning Certification',
          status: 'verified',
          expiryDate: '2025-06-30',
          uploadDate: '2023-06-30',
          fileUrl: 'path/to/cert.pdf',
        },
      ],
      required: false,
    },
  };

  const handleUploadDocument = (category) => {
    navigation.navigate('UploadDocument', { category });
  };

  const handleViewDocument = (document) => {
    navigation.navigate('ViewDocument', { document });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return '#4CAF50';
      case 'pending':
        return '#FFC107';
      case 'rejected':
        return '#F44336';
      case 'expiring_soon':
        return '#FF9800';
      default:
        return '#666666';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'verified':
        return 'Verified';
      case 'pending':
        return 'Pending';
      case 'rejected':
        return 'Rejected';
      case 'expiring_soon':
        return 'Expiring Soon';
      default:
        return 'Not Uploaded';
    }
  };

  const renderDocumentCard = (document) => (
    <TouchableOpacity
      key={document.id}
      style={styles.documentCard}
      onPress={() => handleViewDocument(document)}
    >
      <View style={styles.documentHeader}>
        <Icon
          name={document.fileUrl.endsWith('.pdf') ? 'file-text' : 'image'}
          size={24}
          color="#666"
        />
        <View style={styles.documentInfo}>
          <Text style={styles.documentType}>{document.type}</Text>
          <Text style={styles.uploadDate}>
            Uploaded on {document.uploadDate}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(document.status) },
          ]}
        >
          <Text style={styles.statusText}>
            {getStatusLabel(document.status)}
          </Text>
        </View>
      </View>

      {document.expiryDate && (
        <View style={styles.expiryInfo}>
          <Icon
            name="calendar"
            size={16}
            color={
              new Date(document.expiryDate) < new Date()
                ? '#F44336'
                : '#666'
            }
          />
          <Text
            style={[
              styles.expiryDate,
              {
                color:
                  new Date(document.expiryDate) < new Date()
                    ? '#F44336'
                    : '#666',
              },
            ]}
          >
            Expires on {document.expiryDate}
          </Text>
        </View>
      )}

      <View style={styles.documentActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleUploadDocument(document.type)}
        >
          <Icon name="upload" size={16} color="#2196F3" />
          <Text style={styles.actionButtonText}>Update</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleViewDocument(document)}
        >
          <Icon name="eye" size={16} color="#2196F3" />
          <Text style={styles.actionButtonText}>View</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderCategorySection = (category, data) => (
    <View key={category} style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>{data.title}</Text>
          {data.required && (
            <Text style={styles.requiredText}>Required Documents</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => handleUploadDocument(category)}
        >
          <Icon name="plus" size={20} color="#2196F3" />
          <Text style={styles.uploadButtonText}>Upload</Text>
        </TouchableOpacity>
      </View>

      {data.documents.length > 0 ? (
        data.documents.map(renderDocumentCard)
      ) : (
        <View style={styles.emptyState}>
          <Icon name="file" size={48} color="#CCCCCC" />
          <Text style={styles.emptyStateText}>No documents uploaded</Text>
          <Text style={styles.emptyStateSubtext}>
            Tap the Upload button to add documents
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Documents & Licenses</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.verificationStatus}>
          <Icon name="shield" size={24} color="#4CAF50" />
          <View style={styles.verificationInfo}>
            <Text style={styles.verificationTitle}>
              Verification Status: Complete
            </Text>
            <Text style={styles.verificationSubtext}>
              All required documents have been verified
            </Text>
          </View>
        </View>

        {Object.entries(mockDocuments).map(([category, data]) =>
          renderCategorySection(category, data)
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  verificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#E8F5E9',
    marginBottom: 8,
  },
  verificationInfo: {
    marginLeft: 12,
    flex: 1,
  },
  verificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  verificationSubtext: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  requiredText: {
    fontSize: 12,
    color: '#F44336',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  uploadButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  documentCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  documentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  documentType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  uploadDate: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  expiryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  expiryDate: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  documentActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#2196F3',
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default Documents;
