import { getStaticVehicleSketch } from '@/lib/vehicleSketchData';

export async function getCarTemplateMapping(templateName: string): Promise<Record<string, string>> {
  return getStaticVehicleSketch(templateName);
}
