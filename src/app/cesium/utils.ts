// default aircraft height relative to ground
export const DEFAULT_AIRC_HEIGHT = 10;

export const RAD_IN_DEG = Math.PI / 180;
export const DEG_IN_RAD = 180 / Math.PI;

export class CesiumUtils {
    public static degreesToCartesian(position) {
        return Cesium.Cartographic.toCartesian(new Cesium.Cartographic(position.longitude, position.latitude));
    }

    public static rotateToEntity(entityPos, observerPos) {
        entityPos = Cesium.Cartographic.fromCartesian(entityPos);
        observerPos = Cesium.Cartographic.fromCartesian(observerPos);
        const phi1 = entityPos.latitude * RAD_IN_DEG;
        const phi2 = observerPos.latitude * RAD_IN_DEG;
        const lam1 = entityPos.longitude * RAD_IN_DEG;
        const lam2 = observerPos.longitude * RAD_IN_DEG;
        const groundCameraBearing = Math.atan2(Math.sin(lam2 - lam1) * Math.cos(phi2), Math.cos(phi1) * Math.sin(phi2)
            - Math.sin(phi1) * Math.cos(phi2) * Math.cos(lam2 - lam1)) * DEG_IN_RAD;
        return (groundCameraBearing + 90) * RAD_IN_DEG;
    }


    // position = viewer.scene.globe.ellipsoid.scaleToGeodeticSurface(position);
}
