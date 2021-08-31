import ModuleLoader from '@/core/Loader/ModuleLoader';
import { ObjectManager, Inject } from '@100k/intiv/ObjectManager';
import { isArrowFunction } from '@100k/intiv/Utility';
import _ from 'lodash';


type Callback = (data : any, previousResult : any) => any;

type Listners = {
    [eventName : string] : Callback[]
};


class ServiceLoader
{

    @Inject()
    protected moduleLoader : ModuleLoader;

    public async load()
    {
        const moduleServices = await this.moduleLoader.loadFilePerModule('etc/services');

        for (let [moduleName, servicesPackage] of Object.entries(moduleServices)) {
            const moduleCode = _.camelCase(moduleName);

            for (let [serviceName, serviceGetter] of Object.entries((<any>servicesPackage).default)) {
                const serviceCode = `@${moduleCode}/${serviceName}`;
                const service = await (<Function> serviceGetter)();
                ObjectManager.bindService(service, serviceCode);
            }
        }
    }

}


export default ServiceLoader;
