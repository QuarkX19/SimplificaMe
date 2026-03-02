import { Layer } from './methodology.types';

export function validateLayer(layer: Layer, userData: Record<string, string>): boolean {
  if (!layer.outputs || layer.outputs.length === 0) return true;
  if (!userData || Object.keys(userData).length === 0) return false;
  
  // Verificar que los campos requeridos de la matriz principal tienen valor
  const filledFields = layer.mainMatrix.fields.filter(
    field => userData[field] && userData[field].trim() !== ''
  );
  
  // Requiere al menos 50% de campos llenos para validar
  return filledFields.length >= Math.ceil(layer.mainMatrix.fields.length * 0.5);
}
