export interface Environment {
    name: string;
    takeoff: {longitude: number, latitude: number, height: number, angle: number};
    pilot: {longitude: number, latitude: number, height: number};
}
