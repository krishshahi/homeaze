import React from 'react';

import EnhancedProviderServiceCreateScreen from './EnhancedProviderServiceCreateScreen';

// Create service screen is an alias for the EnhancedProviderServiceCreateScreen
const CreateServiceScreen = (props) => {
  return <EnhancedProviderServiceCreateScreen {...props} />;
};

export default CreateServiceScreen;
