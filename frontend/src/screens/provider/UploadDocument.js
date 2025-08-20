import { useNavigation, useRoute } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const UploadDocument = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { documentType, documentId, isReplacement } = route.params;

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status: cameraStatus } =
          await ImagePicker.requestCameraPermissionsAsync();
        const { status: libraryStatus } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Camera and media library access is required to upload documents.'
          );
        }
      }
    })();
  }, []);

  const getDocumentTypeInfo = () => {
    switch (documentType) {
      case 'id':
        return {
          title: 'ID Verification',
          description: 'Government-issued photo identification',
          allowedTypes: ['image/*', 'application/pdf'],
          maxFiles: 2,
        };
      case 'business':
        return {
          title: 'Business License',
          description: 'Valid business operating license or permit',
          allowedTypes: ['image/*', 'application/pdf'],
          maxFiles: 3,
        };
      case 'insurance':
        return {
          title: 'Insurance Certificate',
          description: 'Proof of liability insurance coverage',
          allowedTypes: ['image/*', 'application/pdf'],
          maxFiles: 2,
        };
      case 'certification':
        return {
          title: 'Professional Certification',
          description: 'Relevant professional certifications',
          allowedTypes: ['image/*', 'application/pdf'],
          maxFiles: 3,
        };
      default:
        return {
          title: 'Document',
          description: 'Upload required document',
          allowedTypes: ['image/*', 'application/pdf'],
          maxFiles: 1,
        };
    }
  };

  const documentInfo = getDocumentTypeInfo();

  const handleTakePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        const fileInfo = await FileSystem.getInfoAsync(asset.uri);
        
        if (fileInfo.size > MAX_FILE_SIZE) {
          Alert.alert(
            'File Too Large',
            'Please select a file smaller than 10MB'
          );
          return;
        }

        setSelectedFiles([
          ...selectedFiles,
          {
            uri: asset.uri,
            type: 'image/jpeg',
            name: `photo_${Date.now()}.jpg`,
            size: fileInfo.size,
          },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleSelectFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: documentInfo.allowedTypes,
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (result.type === 'success' || (result.assets && result.assets.length > 0)) {
        const files = result.assets || [result];
        for (const file of files) {
          const fileInfo = await FileSystem.getInfoAsync(file.uri);
          
          if (fileInfo.size > MAX_FILE_SIZE) {
            Alert.alert(
              'File Too Large',
              'One or more files exceed the 10MB limit'
            );
            return;
          }
        }

        const newFiles = files.map(file => ({
          uri: file.uri,
          type: file.mimeType,
          name: file.name,
          size: file.size,
        }));

        if (selectedFiles.length + newFiles.length > documentInfo.maxFiles) {
          Alert.alert(
            'Too Many Files',
            `You can only upload up to ${documentInfo.maxFiles} files for this document type`
          );
          return;
        }

        setSelectedFiles([...selectedFiles, ...newFiles]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select files. Please try again.');
    }
  };

  const handleRemoveFile = (index) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      Alert.alert('Error', 'Please select at least one file to upload');
      return;
    }

    setIsUploading(true);

    try {
      // Here you would typically upload the files to your backend
      // Simulating upload delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      Alert.alert(
        'Success',
        'Documents uploaded successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to upload documents. Please try again.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const renderFilePreview = (file, index) => {
    const isImage = file.type.startsWith('image/');
    const fileSize = (file.size / 1024 / 1024).toFixed(2);

    return (
      <View key={index} style={styles.filePreview}>
        {isImage ? (
          <Image source={{ uri: file.uri }} style={styles.imagePreview} />
        ) : (
          <View style={styles.fileIcon}>
            <Icon name="file-text" size={24} color="#666" />
          </View>
        )}
        <View style={styles.fileInfo}>
          <Text style={styles.fileName} numberOfLines={1}>
            {file.name}
          </Text>
          <Text style={styles.fileSize}>{fileSize} MB</Text>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveFile(index)}
        >
          <Icon name="x" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {isReplacement ? 'Replace Document' : 'Upload Document'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.documentInfo}>
          <Icon name="file-text" size={24} color="#2196F3" />
          <View style={styles.documentDetails}>
            <Text style={styles.documentTitle}>{documentInfo.title}</Text>
            <Text style={styles.documentDescription}>
              {documentInfo.description}
            </Text>
          </View>
        </View>

        <View style={styles.uploadSection}>
          <View style={styles.uploadInfo}>
            <Text style={styles.uploadTitle}>Upload Requirements</Text>
            <View style={styles.requirementItem}>
              <Icon name="check-circle" size={16} color="#4CAF50" />
              <Text style={styles.requirementText}>
                File types: Images or PDF
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Icon name="check-circle" size={16} color="#4CAF50" />
              <Text style={styles.requirementText}>
                Maximum {documentInfo.maxFiles} file(s)
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Icon name="check-circle" size={16} color="#4CAF50" />
              <Text style={styles.requirementText}>
                Maximum 10MB per file
              </Text>
            </View>
          </View>

          <View style={styles.uploadButtons}>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleTakePhoto}
              disabled={selectedFiles.length >= documentInfo.maxFiles}
            >
              <Icon name="camera" size={24} color="#2196F3" />
              <Text style={styles.uploadButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleSelectFiles}
              disabled={selectedFiles.length >= documentInfo.maxFiles}
            >
              <Icon name="folder" size={24} color="#2196F3" />
              <Text style={styles.uploadButtonText}>Select Files</Text>
            </TouchableOpacity>
          </View>
        </View>

        {selectedFiles.length > 0 && (
          <View style={styles.previewSection}>
            <Text style={styles.previewTitle}>Selected Files</Text>
            {selectedFiles.map(renderFilePreview)}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (isUploading || selectedFiles.length === 0) &&
              styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isUploading || selectedFiles.length === 0}
        >
          {isUploading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Icon name="upload-cloud" size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>
                {isReplacement ? 'Replace Document' : 'Upload Document'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
  },
  documentDetails: {
    flex: 1,
    marginLeft: 16,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  documentDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  uploadSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
  },
  uploadInfo: {
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  uploadButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  uploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  uploadButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  previewSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  imagePreview: {
    width: 48,
    height: 48,
    borderRadius: 4,
    backgroundColor: '#EEEEEE',
  },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: 4,
    backgroundColor: '#EEEEEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: '#666',
  },
  removeButton: {
    padding: 8,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  submitButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default UploadDocument;
