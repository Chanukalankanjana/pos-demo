import { featureConfigs, type FeatureKey, type FeatureConfig } from "@/config/features"

export function useFeature(featureKey: FeatureKey): { config: FeatureConfig; isEnabled: boolean } {
  const config = featureConfigs[featureKey]
  const isEnabled = config?.isEnabled ?? false

  return { config, isEnabled }
}

