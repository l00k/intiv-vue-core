import _ from 'lodash';


export type ModuleDescription = {
    priority: number,
    code: string,
};


export default class ModuleLoader
{

    protected modules : { [moduleName: string] : ModuleDescription } = {};


    public async loadModules()
    {
        if (!this.modules) {
            const modules = await this._loadFilePerModule(
                'etc/module',
                require.context('@/modules', true, /\.ts$/)
            );
            
            this.modules = Object.fromEntries(
                Object.entries(modules)
                    .sort((a, b) => a[1].priority < b[1].priority ? -1 : 1)
            );
            
            for (const moduleName in this.modules) {
                this.modules[moduleName] = {
                    code: _.camelCase(moduleName),
                    ...this.modules[moduleName],
                }
            }
        }
        
        return this.modules;
    }

    public async loadComponents(types : string[])
    {
        return this._loadComponentsFromModules(
            types,
            require.context('@/modules', true, /\.(ts|vue)$/)
        );
    }

    public async loadFilePerModule(file : string)
    {
        return this._loadFilePerModule(
            file,
            require.context('@/modules', true, /\.(ts|vue)$/)
        );
    }

    protected async _loadComponentsFromModules(types : string[], require)
    {
        const modules = [];

        for (const path of require.keys()) {
            const pathParts = path.replace(/^[./]+/g, '').split('/');
            const moduleName = pathParts.shift();
            const objectName = pathParts.join('/');

            if (!path) {
                continue;
            }

            let includable = false;
            for (let type of types) {
                if (objectName.indexOf(type) === 0) {
                    includable = true;
                    break;
                }
            }

            if (includable) {
                const module = require(path);
                modules.push(module);
            }
        }

        return modules;
    }

    protected async _loadFilePerModule(file : string, require) : Promise<{ [moduleName : string]: any }>
    {
        const files : any = {};

        for (const path of require.keys()) {
            const pathParts = path.replace(/^[./]+/g, '').split('/');
            const moduleName = pathParts.shift();
            const objectName = pathParts.join('/');

            if (!path) {
                continue;
            }

            if (objectName.indexOf(file) === 0) {
                files[moduleName] = require(path);
            }
        }

        return files;
    }

}
