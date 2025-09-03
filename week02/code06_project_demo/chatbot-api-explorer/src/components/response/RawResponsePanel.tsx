import React, { useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';

export const RawResponsePanel: React.FC = () => {
  const { lastApiResponse } = useAppStore();

  // Debug console.log for raw response
  useEffect(() => {
    if (lastApiResponse?.rawResponse) {
      console.log('Raw Response Length:', lastApiResponse.rawResponse.length);
      console.log('Complete Raw Response:', lastApiResponse.rawResponse);
    }
  }, [lastApiResponse?.rawResponse]);

  // Return null to remove from UI
  return null;
};
