import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as apiModule from "@/lib/api";

const vtuAPI = apiModule.vtuAPI;

// Log stored VTU services on store initialization
const logStoredServices = async () => {
  try {
    const stored = await AsyncStorage.getItem("vtu-storage");
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log("📱 VTU Services in Local Storage:", {
        state: parsed.state,
        airtimeServices: parsed.state?.airtimeServices?.length || 0,
        dataServices: parsed.state?.dataServices?.length || 0,
        electricityServices: parsed.state?.electricityServices?.length || 0,
        cableServices: parsed.state?.cableServices?.length || 0,
        lastUpdated: parsed.state?.lastUpdated
          ? new Date(parsed.state.lastUpdated).toLocaleString()
          : "Never",
        version: parsed.version,
      });

      // Log sample services for each category
      if (parsed.state?.airtimeServices?.length > 0) {
        console.log(
          "📞 Sample Airtime Services:",
          parsed.state.airtimeServices.slice(0, 2),
        );
      }
      if (parsed.state?.dataServices?.length > 0) {
        console.log(
          "📊 Sample Data Services:",
          parsed.state.dataServices.slice(0, 2),
        );
      }
      if (parsed.state?.electricityServices?.length > 0) {
        console.log(
          "⚡ Sample Electricity Services:",
          parsed.state.electricityServices.slice(0, 2),
        );
      }
      if (parsed.state?.cableServices?.length > 0) {
        console.log(
          "📺 Sample Cable Services:",
          parsed.state.cableServices.slice(0, 2),
        );
      }
    } else {
      console.log("📱 No VTU services found in local storage");
    }
  } catch (error) {
    console.error("📱 Error reading VTU services from storage:", error);
  }
};

// Log services on app start
logStoredServices();

// VTU Service interfaces - match web implementation
export interface VtuService {
  serviceID: string;
  amount: string; // Marked-up price
  originalAmount: string; // Base price
  markupPercentage: number;
  network?: string;
  provider?: string;
  description?: string;
  validity?: string;
  dataType?: string;
  typeSingle?: string;
  type?: string;
  plan?: string;
  channel?: string;
  isActive: boolean;
}

interface VtuState {
  // Service data
  airtimeServices: VtuService[];
  dataServices: VtuService[];
  electricityServices: VtuService[];
  cableServices: VtuService[];

  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;

  // Cache management
  lastUpdated: number | null;

  // Actions
  fetchServices: (forceRefresh?: boolean) => Promise<void>;
  refreshServices: () => Promise<void>;
  clearCache: () => void;
  clearCacheAndRefetch: () => Promise<void>;

  // Purchase actions
  purchaseAirtime: (payload: any) => Promise<any>;
  purchaseData: (payload: any) => Promise<any>;
  purchaseElectricity: (payload: any) => Promise<any>;
  purchaseCable: (payload: any) => Promise<any>;
}

// AsyncStorage storage for Zustand
const mobileStorage = {
  getItem: async (name: string) => {
    try {
      return await AsyncStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string) => {
    try {
      await AsyncStorage.setItem(name, value);
    } catch {
      // Silently fail
    }
  },
  removeItem: async (name: string) => {
    try {
      await AsyncStorage.removeItem(name);
    } catch {
      // Silently fail
    }
  },
};

const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

export const useVtuStore = create<VtuState>()(
  persist(
    (set, get) => ({
      // Initial state
      airtimeServices: [],
      dataServices: [],
      electricityServices: [],
      cableServices: [],
      isLoading: false,
      isRefreshing: false,
      lastUpdated: null,

      // Fetch services with caching
      fetchServices: async (forceRefresh = false) => {
        const { lastUpdated } = get();
        const now = Date.now();

        // Check if we can use cache
        if (
          !forceRefresh &&
          lastUpdated &&
          now - lastUpdated < CACHE_DURATION
        ) {
          return; // Use cached data
        }

        // Check if vtuAPI is available
        if (!vtuAPI || typeof vtuAPI.getPricing !== "function") {
          console.error("VTU API is not available");
          set({ isLoading: false });
          return;
        }

        set({ isLoading: true });

        try {
          // Fetch each service type separately like the web client does
          console.log(" Fetching VTU services by type...");

          const [
            airtimeResponse,
            dataResponse,
            electricityResponse,
            cableResponse,
          ] = await Promise.all([
            vtuAPI.getPricing("airtime"),
            vtuAPI.getPricing("data"),
            vtuAPI.getPricing("electricity"),
            vtuAPI.getPricing("cable"),
          ]);

          console.log(" API Responses:", {
            airtime: airtimeResponse?.data?.data?.length || 0,
            data: dataResponse?.data?.data?.length || 0,
            electricity: electricityResponse?.data?.data?.length || 0,
            cable: cableResponse?.data?.data?.length || 0,
          });

          // Process responses (filter active services only)
          const processServices = (response: any) => {
            return (
              response?.data?.data?.filter(
                (service: VtuService) => service.isActive,
              ) || []
            );
          };

          const airtimeServices = processServices(airtimeResponse);
          const dataServices = processServices(dataResponse);
          const electricityServices = processServices(electricityResponse);
          const cableServices = processServices(cableResponse);

          console.log("🔍 Service categorization:", {
            airtimeServices: airtimeServices.length,
            dataServices: dataServices.length,
            electricityServices: electricityServices.length,
            cableServices: cableServices.length,
            sampleAirtime: airtimeServices.slice(0, 2).map((s: VtuService) => ({
              description: s.description,
              amount: s.amount,
            })),
            sampleData: dataServices.slice(0, 2).map((s: VtuService) => ({
              description: s.description,
              amount: s.amount,
            })),
            sampleElectricity: electricityServices
              .slice(0, 2)
              .map((s: VtuService) => ({
                description: s.description,
                amount: s.amount,
              })),
            sampleCable: cableServices.slice(0, 2).map((s: VtuService) => ({
              description: s.description,
              amount: s.amount,
            })),
          });

          const updatedServices = {
            airtimeServices,
            dataServices,
            electricityServices,
            cableServices,
            lastUpdated: now,
            isLoading: false,
          };

          set(updatedServices);

          // Log updated services
          console.log("🔄 VTU Services Updated:", {
            airtimeServices: updatedServices.airtimeServices.length,
            dataServices: updatedServices.dataServices.length,
            electricityServices: updatedServices.electricityServices.length,
            cableServices: updatedServices.cableServices.length,
            lastUpdated: new Date(now).toLocaleString(),
            forceRefresh,
          });

          // Log sample of each service type
          if (updatedServices.airtimeServices.length > 0) {
            console.log(
              "📞 Updated Airtime Services:",
              updatedServices.airtimeServices.slice(0, 2),
            );
          }
          if (updatedServices.dataServices.length > 0) {
            console.log(
              "📊 Updated Data Services:",
              updatedServices.dataServices.slice(0, 2),
            );
          }
          if (updatedServices.electricityServices.length > 0) {
            console.log(
              "⚡ Updated Electricity Services:",
              updatedServices.electricityServices.slice(0, 2),
            );
          }
          if (updatedServices.cableServices.length > 0) {
            console.log(
              "📺 Updated Cable Services:",
              updatedServices.cableServices.slice(0, 2),
            );
          }
        } catch (error) {
          console.error("Error fetching VTU services:", error);
          set({ isLoading: false });
          throw error;
        }
      },

      // Get VTU pricing - matches POST /vtu/pricing
      getPricing: async (serviceType?: string) => {
        const body = serviceType
          ? JSON.stringify({ type: serviceType })
          : undefined;
        const options: RequestInit = {
          method: "POST",
          ...(body && { body }),
        };

        const url = `${process.env.EXPO_PUBLIC_API_URL || "https://topupafrica.online"}${process.env.EXPO_PUBLIC_API_PREFIX || "/api"}/vtu/pricing`;

        // Get auth token
        const token = await AsyncStorage.getItem("auth_token");

        // Prepare headers
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };

        // Add authorization header if token exists
        if (token) {
          (headers as Record<string, string>).Authorization = `Bearer ${token}`;
        }

        const response = await fetch(url, {
          ...options,
          headers,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              `HTTP ${response.status}: ${response.statusText}`,
          );
        }

        return await response.json();
      },

      // Force refresh services
      refreshServices: async () => {
        set({ isRefreshing: true });
        try {
          await get().fetchServices(true);
        } catch (error) {
          console.error("Error refreshing services:", error);
        } finally {
          set({ isRefreshing: false });
        }
      },

      // Clear cache
      clearCache: () => {
        set({
          airtimeServices: [],
          dataServices: [],
          electricityServices: [],
          cableServices: [],
          lastUpdated: null,
        });
      },

      // Clear cache and refetch
      clearCacheAndRefetch: async () => {
        console.log("🗑️ Clearing VTU cache and refetching...");
        get().clearCache();
        try {
          await get().fetchServices(true); // Force refresh
          console.log("✅ VTU cache cleared and services refetched");
        } catch (error) {
          console.error("❌ Failed to refetch after cache clear:", error);
          throw error;
        }
      },

      // Purchase methods
      purchaseAirtime: async (payload) => {
        if (!vtuAPI || typeof vtuAPI.purchaseAirtime !== "function") {
          throw new Error("VTU API is not available");
        }
        try {
          const response = await vtuAPI.purchaseAirtime(payload);
          return response;
        } catch (error) {
          console.error("Airtime purchase error:", error);
          throw error;
        }
      },

      purchaseData: async (payload) => {
        if (!vtuAPI || typeof vtuAPI.purchaseData !== "function") {
          throw new Error("VTU API is not available");
        }
        try {
          const response = await vtuAPI.purchaseData(payload);
          return response;
        } catch (error) {
          console.error("Data purchase error:", error);
          throw error;
        }
      },

      purchaseElectricity: async (payload) => {
        if (!vtuAPI || typeof vtuAPI.payElectricity !== "function") {
          throw new Error("VTU API is not available");
        }
        try {
          const response = await vtuAPI.payElectricity(payload);
          return response;
        } catch (error) {
          console.error("Electricity purchase error:", error);
          throw error;
        }
      },

      purchaseCable: async (payload) => {
        if (!vtuAPI || typeof vtuAPI.subscribeCable !== "function") {
          throw new Error("VTU API is not available");
        }
        try {
          const response = await vtuAPI.subscribeCable(payload);
          return response;
        } catch (error) {
          console.error("Cable purchase error:", error);
          throw error;
        }
      },
    }),
    {
      name: "vtu-storage",
      storage: createJSONStorage(() => mobileStorage),
      partialize: (state) => ({
        airtimeServices: state.airtimeServices,
        dataServices: state.dataServices,
        electricityServices: state.electricityServices,
        cableServices: state.cableServices,
        lastUpdated: state.lastUpdated,
      }),
    },
  ),
);
