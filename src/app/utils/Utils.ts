export class Utils {
    public static getUID() {
        return Math.random().toString(36).substr(2, 21);
    }

    public static isExists(variable) {
        if (typeof variable === 'undefined' || variable === null) {
           return false;
        } else {
            return true;
        }
    }
}
