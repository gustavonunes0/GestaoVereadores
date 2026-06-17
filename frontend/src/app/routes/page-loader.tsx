import { Suspense, type ComponentType, type LazyExoticComponent, type ReactElement } from 'react';
import { RouteFallback } from '../../components/RouteFallback';

/** Envolve página lazy com Suspense e fallback padrão. */
export function page(Component: LazyExoticComponent<ComponentType>): ReactElement {
    return (
        <Suspense fallback={<RouteFallback />}>
            <Component />
        </Suspense>
    );
}
