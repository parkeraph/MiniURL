export default interface MiniURLGetResponse {
  success: boolean;
  exists: boolean;
  fullURL: string;
  error?: string;
}
