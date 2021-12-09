import ModuleLoader from '@/intiv/core/Loader/ModuleLoader';
import { Inject, ObjectManager } from '@/intiv/utils/ObjectManager';
import _ from 'lodash';


export default class ServiceLoader
{
    
    @Inject()
    protected moduleLoader : ModuleLoader;
    
    public async load ()
    {
        const objectManager = ObjectManager.getSingleton();
        
        // global services
        const services = require('@/etc/services').default;
        
        for (let [ name, service ] of Object.entries(services)) {
            service = await (<Function>service)();
            objectManager.bindService(service, name);
        }
        
        // modules services
        const modules = await this.moduleLoader.loadModules();
        const moduleServices = await this.moduleLoader.loadFilePerModule('etc/services');
        
        for (const [ moduleName, moduleDescription ] of Object.entries(modules)) {
            const servicesPackage = moduleServices[moduleName];
            if (servicesPackage) {
                const servicesList = servicesPackage.default;
                
                for (let [ serviceName, serviceGetter ] of Object.entries(servicesList)) {
                    const serviceCode = `@${moduleDescription.code}/${serviceName}`;
                    const service = await (<Function>serviceGetter)();
                    
                    objectManager.bindService(service, serviceCode);
                }
            }
        }
    }
    
}
