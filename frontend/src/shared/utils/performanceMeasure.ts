/**
 * Утилита для измерения производительности вычислений
 * 
 * Использование:
 * ```typescript
 * const measure = performanceMeasure('myComputation');
 * // ... ваш код ...
 * measure.end(); // Выведет время выполнения в консоль
 * ```
 */
export const performanceMeasure = (label: string) => {
    const startTime = performance.now();
    
    return {
        end: () => {
            const endTime = performance.now();
            const duration = endTime - startTime;
            console.log(`⏱️ [Performance] ${label}: ${duration.toFixed(2)}ms`);
            return duration;
        },
        endWithResult: <T>(result: T): T => {
            const endTime = performance.now();
            const duration = endTime - startTime;
            console.log(`⏱️ [Performance] ${label}: ${duration.toFixed(2)}ms`);
            return result;
        }
    };
};

/**
 * Функция для создания обертки useMemo с измерением производительности
 * 
 * Использование в development режиме:
 * ```typescript
 * import { useMemo } from 'react';
 * import { createPerfMeasuredMemo } from 'shared/utils';
 * 
 * const users = useMemo(() => {
 *     const measure = import.meta.env.DEV ? performanceMeasure('users calculation') : null;
 *     // тяжелые вычисления
 *     const result = computeUsers();
 *     measure?.end();
 *     return result;
 * }, [deps]);
 * ```
 */

/**
 * Измерение времени рендера компонента
 * Рекомендуется использовать вместе с React DevTools Profiler
 */
export const measureComponentRender = (componentName: string) => {
    if (import.meta.env.DEV) {
        return {
            onRenderStart: () => {
                performance.mark(`${componentName}-render-start`);
            },
            onRenderEnd: () => {
                performance.mark(`${componentName}-render-end`);
                performance.measure(
                    `${componentName} render`,
                    `${componentName}-render-start`,
                    `${componentName}-render-end`
                );
                
                const measure = performance.getEntriesByName(`${componentName} render`)[0];
                console.log(`🎨 [Render] ${componentName}: ${measure.duration.toFixed(2)}ms`);
                
                // Очищаем маркеры
                performance.clearMarks(`${componentName}-render-start`);
                performance.clearMarks(`${componentName}-render-end`);
                performance.clearMeasures(`${componentName} render`);
            }
        };
    }
    
    return {
        onRenderStart: () => {},
        onRenderEnd: () => {}
    };
};

