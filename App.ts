import ModuleLoader from '@/intiv/core/Loader/ModuleLoader';
import ServiceLoader from '@/intiv/core/Loader/ServiceLoader';
import StoreManager from '@/intiv/core/Store/StoreManager';
import { Config, Configuration } from '@/intiv/utils/Configuration';
import { EventBus } from '@/intiv/utils/EventBus';
import { Inject, ObjectManager, Singleton } from '@/intiv/utils/ObjectManager';
import Vue from 'vue';
import VueRouter from 'vue-router';
import Vuex, { Store as VuexStore } from 'vuex';
import isEmpty from 'lodash/isEmpty';
import camelCase from 'lodash/camelCase';
import AppComponent from '@/intiv/core/Vue/AppComponent.vue';


@Singleton()
export default class App
{

    protected configuration : Configuration;

    @Inject()
    protected eventBus : EventBus;

    @Inject()
    protected moduleLoader : ModuleLoader;

    @Inject()
    protected serviceLoader : ServiceLoader;


    protected vue : Vue;

    protected vuexStore : VuexStore<any>;

    protected vueRouter : VueRouter;


    public async run()
    {
        // load configuration
        await this.loadConfigData();

        // register configuration under object manager handlers
        ObjectManager.getSingleton()
            .registerHandler(this.configuration.injectConfigurationValues.bind(this.configuration));

        // load services
        await this.serviceLoader.load();

        // load routes and init router
        this.vueRouter = new VueRouter({
            mode: 'history',
            base: process.env.BASE_URL,
        });

        // load models
        await this.moduleLoader.loadComponents([ 'Domain/Model' ]);

        // setup store and database
        this.vuexStore = new Vuex.Store({
            plugins: [
                StoreManager.getVuexPersister,
            ]
        });

        await import('./Store/Database');

        // load other modules components
        await this.moduleLoader.loadComponents([ 'Observer', 'Page', 'Store' ]);

        // load Vue exts
        await this.loadVueExts();

        // init app
        const appComponent : typeof AppComponent = this.configuration.get('core.layout.appComponent', AppComponent);
        this.vue = new Vue({
            router: this.vueRouter,
            store: this.vuexStore,
            render: h => h(appComponent),
        });

        await this.vue.$mount('#app');
    }

    public getVueRouter() : VueRouter
    {
        return this.vueRouter;
    }

    public getVuexStore() : VuexStore<any>
    {
        return this.vuexStore;
    }

    protected async loadVueExts()
    {
        const vueExts = await this.moduleLoader.loadComponents([ 'Vue' ]);

        for (const vueExt of vueExts) {
            if (isEmpty(vueExt.default)) {
                continue;
            }

            // components
            if (!isEmpty(vueExt.default.components)) {
                for (const name in vueExt.default.components) {
                    Vue.component(name, vueExt.default.components[name]);
                }
            }

            // filters
            if (!isEmpty(vueExt.default.filters)) {
                for (const name in vueExt.default.filters) {
                    Vue.filter(name, vueExt.default.filters[name]);
                }
            }
        }
    }

    protected async loadConfigData()
    {
        this.configuration = Configuration.getSingleton();

        // per module configuration
        const moduleConfigPackages = await this.moduleLoader.loadFilePerModule('etc/config');

        Object.entries(moduleConfigPackages)
            .forEach(([moduleName, moduleConfigPackage]) => {
                const configData = (<any>moduleConfigPackage).default;
                this.configuration.load(configData);
            });

        // global configuration
        const configData = require('@/etc/config.ts').default;
        this.configuration
            .load(configData);
    }

}
