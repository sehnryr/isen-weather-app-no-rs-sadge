export interface GeocodeAddress {
  city: string;
  country: string;
}

export interface GeocodeResponse {
  address: GeocodeAddress;
}
