import React, { useEffect, useRef, useState } from 'react';
import { Card, CardHeader, CardBody } from "@nextui-org/react";

// Chart.js initialization state
type ChartStatus = 'loading' | 'loaded' | 'error';
let chartStatus: ChartStatus = 'loading';

// Define dynamic imports for chart libraries to avoid server-side rendering issues
let Chart: any = null;
let ChartModules: any = null;

// Custom event to notify when Chart.js is loaded
const CHART_LOADED_EVENT = 'chartjsloaded';

// Function to load Chart.js once and notify all components
const loadChartJs = () => {
  if (typeof window === 'undefined' || chartStatus !== 'loading') return;
  
  chartStatus = 'loading';
  try {
    // @ts-expect-error - Dynamic import of external module
    import(/* webpackIgnore: true */ 'chart.js')
      .then(module => {
        ChartModules = module;
        Chart = module.Chart;
        
        // Register required components
        Chart.register(
          module.ArcElement,
          module.LineElement,
          module.BarElement,
          module.PointElement,
          module.CategoryScale,
          module.LinearScale,
          module.Tooltip,
          module.Legend
        );
        
        chartStatus = 'loaded';
        window.dispatchEvent(new Event(CHART_LOADED_EVENT));
      })
      .catch(error => {
        console.error('Failed to load Chart.js:', error);
        chartStatus = 'error';
      });
  } catch (error) {
    console.error('Error initializing Chart.js:', error);
    chartStatus = 'error';
  }
};

// Load Chart.js if we're in the browser
if (typeof window !== 'undefined') {
  loadChartJs();
}

// Chart props interface
interface ChartComponentProps {
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  data: {
    labels: string[];
    values: number[];
    avgHours?: number[];
  };
  title: string;
  description: string;
  colors?: string[];
}

const ChartComponent: React.FC<ChartComponentProps> = ({ 
  type, 
  data, 
  title, 
  description, 
  colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'] 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [chartInstance, setChartInstance] = useState<any>(null);
  const [isChartJsLoaded, setIsChartJsLoaded] = useState<boolean>(chartStatus === 'loaded');

  // Listen for Chart.js loading
  useEffect(() => {
    const handleChartLoaded = () => {
      setIsChartJsLoaded(true);
    };

    // If already loaded, no need to listen
    if (chartStatus === 'loaded') {
      setIsChartJsLoaded(true);
      return;
    }
    
    // Listen for the chartjsloaded event
    window.addEventListener(CHART_LOADED_EVENT, handleChartLoaded);
    
    // Try to load Chart.js if not already loading
    if (chartStatus === 'loading' && typeof window !== 'undefined') {
      loadChartJs();
    }
    
    return () => {
      window.removeEventListener(CHART_LOADED_EVENT, handleChartLoaded);
    };
  }, []);

  // Create chart instance when component mounts and Chart.js is loaded
  useEffect(() => {
    if (!canvasRef.current || !isChartJsLoaded || !Chart || !ChartModules) return;

    // Destroy previous chart instance if it exists
    if (chartInstance) {
      chartInstance.destroy();
    }

    try {
      // Prepare dataset based on chart type
      const dataset: any = {
        label: title,
        data: data.values,
        backgroundColor: colors,
        borderColor: type === 'line' ? colors[0] : colors,
        borderWidth: 1,
      };

      // Create new chart instance
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;
      
      const newChartInstance = new Chart(ctx, {
        type,
        data: {
          labels: data.labels,
          datasets: [dataset],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom',
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              enabled: true,
            },
          },
        },
      });
      setChartInstance(newChartInstance);
    } catch (error) {
      console.error('Error creating chart:', error);
    }

    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [canvasRef, isChartJsLoaded, data, type, title, colors, chartInstance]);

  return (
    <Card className="p-4">
      <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
        <h3 className="text-large font-medium">{title}</h3>
        <p className="text-small text-default-500">{description}</p>
      </CardHeader>
      <CardBody>
        <div className="w-full h-64 relative">
          {!isChartJsLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-500">Loading chart...</p>
            </div>
          )}
          <canvas ref={canvasRef} />
        </div>
      </CardBody>
    </Card>
  );
};

export default ChartComponent;
