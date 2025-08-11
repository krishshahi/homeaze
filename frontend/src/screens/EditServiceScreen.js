import React from 'react';
import EnhancedProviderServiceCreateScreen from './EnhancedProviderServiceCreateScreen';

// Edit service screen reuses the EnhancedProviderServiceCreateScreen with edit mode
const EditServiceScreen = ({ route, ...props }) => {
  const { serviceId, serviceData } = route.params || {};
  
  return (
    <EnhancedProviderServiceCreateScreen
      {...props} 
      route={{
        ...route,
        params: {
          ...route.params,
          editMode: true,
          serviceId,
          initialData: serviceData,
        }
      }}
    />
  );
};

export default EditServiceScreen;
