export class PluginLoader {
    private static instance: PluginLoader;
    private pluginsLoaded: boolean = false;
    private availablePlugins: Set<string> = new Set();

    public static getInstance(): PluginLoader {
        if (!PluginLoader.instance) {
            PluginLoader.instance = new PluginLoader();
        }
        return PluginLoader.instance;
    }

    private constructor() {}

    private async loadPlugins(): Promise<void> {
        if (this.pluginsLoaded) return;

        return new Promise((resolve, reject) => {
            if (!(window as any).AMap) {
                reject(new Error('AMap未加载'));
                return;
            }

            // TODO: 添加AMap.DragRoute插件
            const basicPlugins = ['AMap.Driving', 'AMap.Walking', 'AMap.Transfer', 'AMap.Riding'];

            // 显示成功加载的出行方式
            (window as any).AMap.plugin(basicPlugins, () => {
                const pluginMapping: Record<string,string> = {
                    'AMap.Driving': 'driving',
                    'AMap.Walking': 'walking',
                    'AMap.Transfer': 'transfer',
                    'AMap.Riding': 'riding'
                };
                basicPlugins.forEach(plugin => {
                    const pluginClass = plugin.replace('AMap.', '');
                    if ((window as any).AMap[pluginClass]) {
                        const mappedName = pluginMapping[plugin];
                        if(mappedName) {
                            this.availablePlugins.add(mappedName);
                        }
                    }
                });   
                this.pluginsLoaded = true;
                console.log('已加载的插件:', Array.from(this.availablePlugins));
                resolve(undefined);
            });
        });
    }

    public async ensurePluginsLoaded(): Promise<void> {
        if (this.pluginsLoaded) return;
        await this.loadPlugins();
    }

    public isPluginAvailable(pluginName: string): boolean {
        return this.availablePlugins.has(pluginName.toLowerCase());
    }

    public getAvailablePlugins(): string[] {
        return Array.from(this.availablePlugins);
    }

    public reset(): void {
        this.pluginsLoaded = false;
        this.availablePlugins.clear();
    }
}

export const ensurePluginsLoaded = async (): Promise<void> => {
    const loader = PluginLoader.getInstance();
    await loader.ensurePluginsLoaded();
};

export const isPluginAvailable = (pluginName: string): boolean => {
    const loader = PluginLoader.getInstance();
    return loader.isPluginAvailable(pluginName);
};