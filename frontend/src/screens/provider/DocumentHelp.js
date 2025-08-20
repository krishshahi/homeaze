import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const DocumentHelp = () => {
  const navigation = useNavigation();

  const documentTypes = [
    {
      id: 'id',
      title: 'ID Verification',
      description:
        'Government-issued photo identification to verify your identity.',
      requirements: [
        'Must be currently valid',
        'Must show your full name and photo',
"Must be government-issued (passport, driver\'s license, etc.)",
        'Must be clearly legible',
      ],
      tips: [
        'Ensure the entire document is visible in the photo',
        'Take the photo in good lighting',
        'Avoid glare or shadows on the document',
      ],
    },
    {
      id: 'business',
      title: 'Business License',
      description:
        'Valid business operating license or permit from your local authority.',
      requirements: [
        'Must be current and valid',
        'Must show business name and registration number',
        'Must show type of business activity',
        'Must show expiration date',
      ],
      tips: [
        'Submit all pages if multi-page document',
        'Include any relevant endorsements',
        'Ensure address details are visible',
      ],
    },
    {
      id: 'insurance',
      title: 'Insurance Certificate',
      description:
        'Proof of liability insurance coverage for your business operations.',
      requirements: [
        'Must show current coverage dates',
        'Must meet minimum coverage requirements',
        'Must list your business as the insured party',
        'Must show insurance provider details',
      ],
      tips: [
        'Submit the full certificate of insurance',
        'Include policy declaration page',
        'Ensure coverage types are clearly visible',
      ],
    },
    {
      id: 'certification',
      title: 'Professional Certification',
      description:
        'Relevant professional certifications or qualifications for your services.',
      requirements: [
        'Must be from accredited organizations',
        'Must be current if certification has expiration',
        'Must show your name as certificate holder',
        'Must show certification type and level',
      ],
      tips: [
        'Submit both front and back if relevant',
        'Include any specialization endorsements',
        'Ensure certification number is visible',
      ],
    },
  ];

  const renderDocumentTypeCard = (docType) => (
    <View key={docType.id} style={styles.docTypeCard}>
      <View style={styles.docTypeHeader}>
        <View style={styles.docTypeTitle}>
          <Text style={styles.docTypeName}>{docType.title}</Text>
          <Text style={styles.docTypeDescription}>{docType.description}</Text>
        </View>
        <Icon name="file-text" size={24} color="#2196F3" />
      </View>

      <View style={styles.requirementsSection}>
        <Text style={styles.sectionTitle}>Requirements</Text>
        {docType.requirements.map((req, index) => (
          <View key={index} style={styles.requirementItem}>
            <Icon name="check-circle" size={16} color="#4CAF50" />
            <Text style={styles.requirementText}>{req}</Text>
          </View>
        ))}
      </View>

      <View style={styles.tipsSection}>
        <Text style={styles.sectionTitle}>Submission Tips</Text>
        {docType.tips.map((tip, index) => (
          <View key={index} style={styles.tipItem}>
            <Icon name="info" size={16} color="#2196F3" />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>
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
        <Text style={styles.title}>Document Guidelines</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.introSection}>
          <Icon name="shield" size={24} color="#2196F3" />
          <View style={styles.introContent}>
            <Text style={styles.introTitle}>
              Why We Need Your Documents
            </Text>
            <Text style={styles.introText}>
              Document verification helps us maintain a trusted marketplace and
              ensure the safety of our customers. All documents are securely
              stored and handled according to privacy regulations.
            </Text>
          </View>
        </View>

        <View style={styles.documentsContainer}>
          {documentTypes.map(renderDocumentTypeCard)}
        </View>

        <View style={styles.supportSection}>
          <Text style={styles.supportTitle}>Need Help?</Text>
          <Text style={styles.supportText}>
            If you have questions about document requirements or need assistance
            with the verification process, our support team is here to help.
          </Text>
          <TouchableOpacity
            style={styles.supportButton}
            onPress={() => navigation.navigate('Support')}
          >
            <Icon name="message-circle" size={20} color="#2196F3" />
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
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
  introSection: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
  },
  introContent: {
    flex: 1,
    marginLeft: 16,
  },
  introTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  introText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  documentsContainer: {
    padding: 8,
  },
  docTypeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  docTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  docTypeTitle: {
    flex: 1,
    marginRight: 16,
  },
  docTypeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  docTypeDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  requirementsSection: {
    marginBottom: 16,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  tipsSection: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  supportSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    margin: 8,
    borderRadius: 8,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  supportText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
  },
  supportButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196F3',
  },
});

export default DocumentHelp;
