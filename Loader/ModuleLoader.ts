export default class ModuleLoader
{

    public async loadComponents(types : string[])
    {
        return this._loadComponentsFromModules(
            types,
            require.context('@/modules', true, /\.(ts|vue)/)
        );
    }

    public async loadFilePerModule(file : string)
    {
        return this._loadFilePerModule(
            file,
            require.context('@/modules', true, /\.(ts|vue)/)
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

    protected async _loadFilePerModule(file : string, require)
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
