import * as React from 'react';
import { createRouter, createRoute, createRootRoute, Outlet, Navigate } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

// Components
import { Layout } from '@/components/Layout';
import { DashboardPage } from '@/pages/Dashboard';
import { ClassesPage } from '@/pages/Classes';
import { ClassDetailPage } from '@/pages/ClassDetail';
import { CreateClassPage } from '@/pages/CreateClass';
import { CalendarPage } from '@/pages/Calendar';
import { RoomTypesPage } from '@/pages/RoomTypes';
import { RoomsPage } from '@/pages/Rooms';
import { InstructorsPage } from '@/pages/Instructors';
import { NotFoundPage } from '@/pages/NotFound';

// Root Route
const rootRoute = createRootRoute({
    component: () => (
        <>
            <Outlet />
            {import.meta.env.DEV && <TanStackRouterDevtools />}
        </>
    ),
});

// Index Route (redirects to dashboard)
const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <Navigate to="/dashboard" replace />,
});

// Dashboard Route with Layout
const dashboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/dashboard',
    component: () => (
        <Layout>
            <DashboardPage />
        </Layout>
    ),
});

// Classes Routes
const classesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/classes',
    component: () => (
        <Layout>
            <ClassesPage />
        </Layout>
    ),
});

const classDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/classes/$classId',
    component: () => (
        <Layout>
            <ClassDetailPage />
        </Layout>
    ),
});

const createClassRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/classes/create',
    component: () => (
        <Layout>
            <CreateClassPage />
        </Layout>
    ),
});

// Calendar Route
const calendarRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/calendar',
    component: () => (
        <Layout>
            <CalendarPage />
        </Layout>
    ),
});

// Room Types Route
const roomTypesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/room-types',
    component: () => (
        <Layout>
            <RoomTypesPage />
        </Layout>
    ),
});

// Rooms Route
const roomsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/rooms',
    component: () => (
        <Layout>
            <RoomsPage />
        </Layout>
    ),
});

// instructors Route
const instructorsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/instructors',
    component: () => (
        <Layout>
            <InstructorsPage />
        </Layout>
    ),
});

// Not Found Route
const notFoundRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '*',
    component: () => (
        <Layout>
            <NotFoundPage />
        </Layout>
    ),
});

// Route Tree
const routeTree = rootRoute.addChildren([
    indexRoute,
    dashboardRoute,
    classesRoute,
    classDetailRoute,
    createClassRoute,
    calendarRoute,
    roomTypesRoute,
    roomsRoute,
    instructorsRoute,
    notFoundRoute,
]);

// Create Router
export const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
});

// Type Definitions
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}
