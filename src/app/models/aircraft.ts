export interface FirebaseAircraft {
    name: string;
    image: string;
    model: string;
    description: string;
    cesiumAssetID: string;
}

export interface CesiumAircraft {
  posCartesian;
  posCartographic;
  rotLocal;
  rotGlobal;
}

