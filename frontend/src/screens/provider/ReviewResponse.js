import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const ReviewResponse = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { reviewId } = route.params;

  const [response, setResponse] = useState('');
  const [suggestedResponses] = useState([
    {
      id: '1',
      title: 'Thank you',
      text: 'Thank you for your feedback! We appreciate your business and are glad we could meet your expectations.',
    },
    {
      id: '2',
      title: 'Apology',
      text: 'We apologize for not meeting your expectations. We take your feedback seriously and will use it to improve our service.',
    },
    {
      id: '3',
      title: 'Positive with promise',
      text: 'Thank you for your positive feedback! We strive to maintain this level of service and look forward to serving you again.',
    },
    {
      id: '4',
      title: 'Address concern',
      text: 'Thank you for bringing this to our attention. We would love to discuss this further and make things right. Please contact our support team.',
    },
  ]);

  // Mock review data
  const mockReview = {
    id: reviewId,
    customer: {
      name: 'John Smith',
      image: null,
    },
    rating: 4,
    criteria: {
      quality: 4,
      punctuality: 4,
      professionalism: 5,
      value: 4,
      cleanliness: 4,
    },
    comment:
      'Great service overall. Very professional team. Only minor issue was they were a bit late, but they called ahead to inform.',
    date: '2024-02-10',
    service: 'Regular Cleaning',
  };

  const handleSubmit = () => {
    if (!response.trim()) {
      Alert.alert('Error', 'Please enter a response');
      return;
    }

    // Here you would typically submit the response to your backend
    navigation.goBack();
  };

  const renderStars = (rating) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            name="star"
            size={16}
            color={star <= rating ? '#FFC107' : '#EEEEEE'}
            style={{ marginRight: 2 }}
          />
        ))}
      </View>
    );
  };

  const handleUseSuggestion = (text) => {
    setResponse(text);
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
        <Text style={styles.title}>Reply to Review</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <View style={styles.reviewerInfo}>
              <View style={styles.reviewerAvatar}>
                <Icon name="user" size={24} color="#666" />
              </View>
              <View>
                <Text style={styles.reviewerName}>{mockReview.customer.name}</Text>
                <Text style={styles.reviewDate}>{mockReview.date}</Text>
              </View>
            </View>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceText}>{mockReview.service}</Text>
            </View>
          </View>

          <View style={styles.ratingSection}>
            {renderStars(mockReview.rating)}
          </View>

          <Text style={styles.reviewComment}>{mockReview.comment}</Text>
        </View>

        <View style={styles.responseSection}>
          <Text style={styles.sectionTitle}>Your Response</Text>
          <TextInput
            style={styles.responseInput}
            value={response}
            onChangeText={setResponse}
            placeholder="Write your response..."
            multiline
            textAlignVertical="top"
          />

          <View style={styles.suggestionsSection}>
            <Text style={styles.suggestionsTitle}>Suggested Responses</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.suggestionsScroll}
            >
              {suggestedResponses.map((suggestion) => (
                <TouchableOpacity
                  key={suggestion.id}
                  style={styles.suggestionCard}
                  onPress={() => handleUseSuggestion(suggestion.text)}
                >
                  <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                  <Text style={styles.suggestionText} numberOfLines={2}>
                    {suggestion.text}
                  </Text>
                  <Icon name="plus" size={16} color="#2196F3" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.guidelines}>
            <Icon name="info" size={20} color="#2196F3" />
            <View style={styles.guidelinesContent}>
              <Text style={styles.guidelinesTitle}>Response Guidelines</Text>
              <Text style={styles.guidelinesText}>
                • Keep your response professional and courteous{'\n'}
                • Address specific concerns mentioned in the review{'\n'}
                • Thank the customer for their feedback{'\n'}
                • Keep the response concise and to the point{'\n'}
                • Avoid defensive language
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, !response && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!response}
        >
          <Text style={styles.submitButtonText}>Submit Response</Text>
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
  reviewCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEEEEE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
  },
  serviceInfo: {
    backgroundColor: '#E3F2FD',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  serviceText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  ratingSection: {
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  responseSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  responseInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    height: 120,
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
  },
  suggestionsSection: {
    marginBottom: 16,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  suggestionsScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  suggestionCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    width: 200,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  suggestionText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  guidelines: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
  },
  guidelinesContent: {
    flex: 1,
    marginLeft: 12,
  },
  guidelinesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  guidelinesText: {
    fontSize: 14,
    color: '#2196F3',
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ReviewResponse;
