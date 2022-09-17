// Unsure why the default types aren't sufficient.
import {Tour} from 'v3-tour/types/index';
declare module '@vue/runtime-core' {
    export interface ComponentCustomProperties {
        $tours: Record<string, Tour>;
    }
}
