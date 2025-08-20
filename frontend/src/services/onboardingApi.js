import api from './api';

// Fetch onboarding slides and intro content from backend
// Expected backend shape:
// {
//   intro: { title: string, subtitle: string },
//   slides: Array<{ id: string, title: string, description: string, icon: string }>
// }
export const getOnboardingContent = async () => {
  try {
    // Prefer a dedicated onboarding endpoint if available
    const res = await api.get('/config/onboarding');
    // Axios instance returns response.data already via interceptor
    // Normalize shapes
    if (res?.slides || res?.intro) return res;
    if (res?.data?.slides || res?.data?.intro) return res.data;
    return res;
  } catch (e) {
    throw e;
  }
};

export default { getOnboardingContent };
