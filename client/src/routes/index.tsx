import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { ErrorBoundary } from "../components/ErrorBoundary";

const HomePage = lazy(() => import("../pages/HomePage").then((m) => ({ default: m.HomePage })));
const ProductListPage = lazy(() =>
  import("../features/products/pages/ProductListPage").then((m) => ({ default: m.ProductListPage }))
);
const ProductDetailsPage = lazy(() =>
  import("../features/products/pages/ProductDetailsPage").then((m) => ({ default: m.ProductDetailsPage }))
);
const WishlistPage = lazy(() =>
  import("../features/products/pages/WishlistPage").then((m) => ({ default: m.WishlistPage }))
);
const CartPage = lazy(() =>
  import("../features/cart/pages/CartPage").then((m) => ({ default: m.CartPage }))
);
const CheckoutPage = lazy(() =>
  import("../features/checkout/pages/CheckoutPage").then((m) => ({ default: m.CheckoutPage }))
);
const OrderHistoryPage = lazy(() =>
  import("../features/orders/pages/OrderHistoryPage").then((m) => ({ default: m.OrderHistoryPage }))
);
const OrderDetailsPage = lazy(() =>
  import("../features/orders/pages/OrderDetailsPage").then((m) => ({ default: m.OrderDetailsPage }))
);
const VendorListPage = lazy(() =>
  import("../features/vendors/pages/VendorListPage").then((m) => ({ default: m.VendorListPage }))
);
const VendorDashboardPage = lazy(() =>
  import("../features/vendor/pages/VendorDashboardPage").then((m) => ({ default: m.VendorDashboardPage }))
);
const LoginPage = lazy(() =>
  import("../features/auth/pages/LoginPage").then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import("../features/auth/pages/RegisterPage").then((m) => ({ default: m.RegisterPage }))
);
const ForgotPasswordPage = lazy(() =>
  import("../features/auth/pages/ForgotPasswordPage").then((m) => ({ default: m.ForgotPasswordPage }))
);
const AdminLayout = lazy(() =>
  import("../features/admin/layout/AdminLayout").then((m) => ({ default: m.AdminLayout }))
);
const AdminDashboardPage = lazy(() =>
  import("../features/admin/pages/AdminDashboardPage").then((m) => ({ default: m.AdminDashboardPage }))
);
const AdminVendorsPage = lazy(() =>
  import("../features/admin/pages/AdminVendorsPage").then((m) => ({ default: m.AdminVendorsPage }))
);
const AdminOrdersPage = lazy(() =>
  import("../features/admin/pages/AdminOrdersPage").then((m) => ({ default: m.AdminOrdersPage }))
);
const AdminProductsPage = lazy(() =>
  import("../features/admin/pages/AdminProductsPage").then((m) => ({ default: m.AdminProductsPage }))
);
const AdminUsersPage = lazy(() =>
  import("../features/admin/pages/AdminUsersPage").then((m) => ({ default: m.AdminUsersPage }))
);
const AdminRefundsPage = lazy(() =>
  import("../features/admin/pages/AdminRefundsPage").then((m) => ({ default: m.AdminRefundsPage }))
);
const AdminCmsPage = lazy(() =>
  import("../features/admin/pages/AdminCmsPage").then((m) => ({ default: m.AdminCmsPage }))
);
const AdminActivityPage = lazy(() =>
  import("../features/admin/pages/AdminActivityPage").then((m) => ({ default: m.AdminActivityPage }))
);
const NotFoundPage = lazy(() =>
  import("../pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage }))
);

const Fallback = () => (
  <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ErrorBoundary>
        <AppShell />
      </ErrorBoundary>
    ),
    children: [
      { index: true, element: <Suspense fallback={<Fallback />}><HomePage /></Suspense> },
      { path: "products", element: <Suspense fallback={<Fallback />}><ProductListPage /></Suspense> },
      { path: "products/:productId", element: <Suspense fallback={<Fallback />}><ProductDetailsPage /></Suspense> },
      {
        path: "cart",
        element: <Suspense fallback={<Fallback />}><CartPage /></Suspense>,
      },
      {
        path: "checkout",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<Fallback />}>
              <CheckoutPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "wishlist",
        element: <Suspense fallback={<Fallback />}><WishlistPage /></Suspense>,
      },
      {
        path: "orders",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<Fallback />}>
              <OrderHistoryPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "orders/:orderId",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<Fallback />}>
              <OrderDetailsPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      { path: "vendors", element: <Suspense fallback={<Fallback />}><VendorListPage /></Suspense> },
      {
        path: "vendor",
        element: (
          <ProtectedRoute roles={["VENDOR"]}>
            <Suspense fallback={<Fallback />}>
              <VendorDashboardPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "login",
        element: <Suspense fallback={<Fallback />}><LoginPage /></Suspense>,
      },
      {
        path: "register",
        element: <Suspense fallback={<Fallback />}><RegisterPage /></Suspense>,
      },
      {
        path: "forgot-password",
        element: <Suspense fallback={<Fallback />}><ForgotPasswordPage /></Suspense>,
      },
      {
        path: "admin",
        element: (
          <ProtectedRoute roles={["ADMIN"]}>
            <Suspense fallback={<Fallback />}>
              <AdminLayout />
            </Suspense>
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: "vendors", element: <AdminVendorsPage /> },
          { path: "orders", element: <AdminOrdersPage /> },
          { path: "products", element: <AdminProductsPage /> },
          { path: "users", element: <AdminUsersPage /> },
          { path: "refunds", element: <AdminRefundsPage /> },
          { path: "cms", element: <AdminCmsPage /> },
          { path: "activity", element: <AdminActivityPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <Suspense fallback={<Fallback />}><NotFoundPage /></Suspense> },
]);
