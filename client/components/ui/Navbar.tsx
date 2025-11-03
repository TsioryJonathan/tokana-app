import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { usePathname, useRouter, useSegments } from 'expo-router';

type NavItem = {
  path: string;
  label: string;
  icon: React.ReactNode;
};

type NavbarProps = {
  items: NavItem[];
};

export default function Navbar({ items }: NavbarProps) {
  const pathname = usePathname();
  const segments = useSegments();
  const router = useRouter();

  const getActiveRoute = () => {
    if (!pathname) return '';
    // Extract the route after the group (admin/courier)
    const pathParts = pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2) {
      return `/${pathParts[0]}/${pathParts[1]}`;
    }
    return pathname;
  };

  return (
    <View className="bg-white border-t border-gray-200 shadow-lg shadow-gray-300/50">
      <View className="flex-row items-center justify-around px-2 py-3">
        {items.map((item) => {
          const currentRoute = getActiveRoute();
          const itemRoute = item.path.split('?')[0]; // Remove query params
          const isActive = currentRoute === itemRoute || 
                         (itemRoute.endsWith('/(admin)') && segments[0] === '(admin)' && segments.length === 1) ||
                         (itemRoute.endsWith('/(courier)') && segments[0] === '(courier)' && segments.length === 1);
          
          return (
            <TouchableOpacity
              key={item.path}
              onPress={() => router.push(item.path as any)}
              activeOpacity={0.7}
              className={`flex-1 items-center py-2 rounded-xl ${isActive ? 'bg-[#FFD700]/10' : ''}`}
            >
              <View className={`mb-1 ${isActive ? '' : 'opacity-60'}`}>
                {React.cloneElement(item.icon as React.ReactElement, { 
                  color: isActive ? '#FFD700' : '#6B7280',
                  size: 24 
                })}
              </View>
              <Text className={`text-xs font-quicksand-semibold ${isActive ? 'text-[#FFD700]' : 'text-gray-600'}`}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

