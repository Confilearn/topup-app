import { useThemeStore } from '@/store/themeStore';
import { DARK_COLORS, LIGHT_COLORS, AppColors } from '@/constants/theme';

export function useColors(): AppColors {
  const { isDark } = useThemeStore();
  return isDark ? DARK_COLORS : LIGHT_COLORS;
}
