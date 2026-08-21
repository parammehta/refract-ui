export const ModelAnimationType = {
  SpringUp: 'spring-up',
  LaptopOpen: 'laptop-open',
} as const;

export type ModelAnimationTypeValue = typeof ModelAnimationType[keyof typeof ModelAnimationType];

export interface DeviceModelConfig {
  url: string;
  width: number;
  height: number;
  position: { x: number; y: number; z: number };
  animation: ModelAnimationTypeValue;
}

/** The device model filenames this module knows how to serve, relative to `basePath`. */
export const MODEL_FILES = {
  phone: 'iphone-11.glb',
  laptop: 'macbook-pro.glb',
} as const;

/**
 * Builds the device model config, resolving each model's `.glb` against
 * `basePath` rather than bundling it — so the host app controls where the
 * files are served from (defaults to `/models/`, matching `public/models/`).
 */
export function createDeviceModels(basePath = '/models/'): Record<string, DeviceModelConfig> {
  return {
    phone: {
      url: `${basePath}${MODEL_FILES.phone}`,
      width: 374,
      height: 512,
      position: { x: 0, y: 0, z: 0 },
      animation: ModelAnimationType.SpringUp,
    },
    laptop: {
      url: `${basePath}${MODEL_FILES.laptop}`,
      width: 1280,
      height: 800,
      position: { x: 0, y: 0, z: 0 },
      animation: ModelAnimationType.LaptopOpen,
    },
  };
}

/** Convenience export for the default `/models/` layout. */
export const deviceModels: Record<string, DeviceModelConfig> = createDeviceModels();
