import { mockRouteResponse, mockSearchSuggestions } from './data';

export const mockAMapSearch = (keyword: string, city: string = '北京') => {
  return new Promise<{ suggestions: Array<{ name: string, location: string }> }>((resolve) => {
    setTimeout(() => {
      const filtered = mockSearchSuggestions.filter(item =>
        item.name.includes(keyword) || item.location.includes(keyword)
      );
      resolve({ suggestions: filtered });
    }, 300);
  });
};

export const mockAMapRoute = (
  start: string, 
  end: string, 
  mode: 'walking' | 'riding' | 'driving'
) => {
  return new Promise<typeof mockRouteResponse>((resolve) => {
    setTimeout(() => {
      resolve({
        ...mockRouteResponse,
        route: {
          ...mockRouteResponse.route,
          distance: mode === 'driving' ? 3000 : mode === 'riding' ? 1800 : 1200,
          duration: mode === 'driving' ? 600 : mode === 'riding' ? 1200 : 900
        }
      });
    }, 500);
  });
};

export const mockBatchRoutes = (items: Array<{name: string, mode: string}>) => {
  return new Promise<Array<{
    start: string;
    end: string;
    distance: number;
    duration: number;
    path: number[][];
  }>>((resolve) => {
    setTimeout(() => {
      const routes = [];
      for (let i = 0; i < items.length - 1; i++) {
        const mode = items[i].mode;
        routes.push({
          start: items[i].name,
          end: items[i + 1].name,
          distance: mode === 'driving' ? 3000 : mode === 'riding' ? 1800 : 1200,
          duration: mode === 'driving' ? 600 : mode === 'riding' ? 1200 : 900,
          path: mockRouteResponse.route.paths[0]
        });
      }
      resolve(routes);
    }, 800);
  });
};