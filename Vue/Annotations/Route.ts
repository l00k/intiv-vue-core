import { RouteConfig } from 'vue-router';
import { ObjectManager } from '@/intiv/utils/ObjectManager';
import App from '@/intiv/core/App';


export default function Route(path : string, name : string, options : Partial<RouteConfig> = {})
{
    return (Target : any) => {
        const routeRecord : RouteConfig = {
            path,
            name,
            component: Target,
            ...options
        };

        ObjectManager.getSingleton()
            .getInstance(App)
            .getVueRouter()
            .addRoute(routeRecord);
    };
}
