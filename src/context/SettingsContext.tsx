import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SiteSettings } from '../types';
import { getPublicSettings, updateAdminSettings } from '../lib/api';

interface SettingsContextType {
  settings: SiteSettings;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
  updateSettings: (updates: Record<string, any>) => Promise<void>;
}

export const defaultSiteSettings: SiteSettings = {
  profile: {
    name: 'Johanna Uroh',
    headline: 'Virtual Assistant & AI Digital Specialist',
    bio: 'I turn ideas into useful digital solutions. Exploring the intersection of AI, technology, content, virtual assistance, and practical digital skills.',
    profilePicture: '/uploads/johanna_uroh_avatar.jpg',
    logoImage: '',
    email: 'urohjohanna25@gmail.com',
    socials: {
      linkedin: 'https://linkedin.com',
      github: 'https://github.com',
      twitter: 'https://twitter.com',
    },
  },
  portfolio: {
    defaultCategory: 'All',
    featuredLimit: 3,
    itemsPerPage: 6,
  },
  features: {
    aiEnabled: true,
    analyticsEnabled: true,
    animationIntensity: 'Full',
  },
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSiteSettings,
  isLoading: false,
  refreshSettings: async () => {},
  updateSettings: async () => {},
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshSettings = useCallback(async () => {
    try {
      const data = await getPublicSettings();
      if (data && data.profile) {
        setSettings(data);
      }
    } catch (err) {
      console.warn('Failed to load public settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettings = async (updates: Record<string, any>) => {
    await updateAdminSettings(updates);
    await refreshSettings();
    window.dispatchEvent(new CustomEvent('portfolio_settings_updated'));
  };

  useEffect(() => {
    refreshSettings();

    const handleUpdate = () => {
      refreshSettings();
    };

    window.addEventListener('portfolio_settings_updated', handleUpdate);
    return () => {
      window.removeEventListener('portfolio_settings_updated', handleUpdate);
    };
  }, [refreshSettings]);

  return (
    <SettingsContext.Provider value={{ settings, isLoading, refreshSettings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSiteSettings = () => useContext(SettingsContext);
