const AMAP_JS_KEY = process.env.UMI_APP_AMAP_JS_KEY;
const AMAP_SECRET_KEY = process.env.UMI_APP_AMAP_SECRET_KEY; // 添加安全密钥

export const loadAMapScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if ((window as any).AMap) {
      resolve();
      return;
    }

    (window as any)._AMapSecurityConfig = {
      securityJsCode: AMAP_SECRET_KEY, 
    };

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.defer = true;

    script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_JS_KEY}`;
    
    script.onload = () => {
      console.log('高德地图脚本加载成功');
      resolve();
    };
    
    script.onerror = (error) => {
      console.error('高德地图脚本加载失败:', error);
      reject(error);
    };

    document.head.appendChild(script);
  });
};