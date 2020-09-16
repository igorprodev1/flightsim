export class Controller {
    name: string;
    isDefault: boolean;
    functions:
        {
            displayName: string,
            name: string,
            reverse: boolean,
            inputType: string,
            inputIndex: number
        }[];
}
