import { environment } from "environments/environment";

export function getImageUrl(imagePath: string): string {
  return `${environment.api}${imagePath}`;
}