import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/public-shell/public-shell.component').then((m) => m.PublicShellComponent),
    children: [
      {
        path: '',
        title: 'app.name',
        loadComponent: () => import('./features/home/home-page.component').then((m) => m.HomePageComponent),
      },
      {
        path: 'doctors',
        title: 'nav.doctors',
        loadComponent: () => import('./features/directory/doctors/doctors-page.component').then((m) => m.DoctorsPageComponent),
      },
      {
        path: 'doctors/:id',
        title: 'titles.doctorProfile',
        loadComponent: () =>
          import('./features/directory/doctor-detail/doctor-detail.component').then((m) => m.DoctorDetailComponent),
      },
      {
        path: 'booking/:doctorId',
        title: 'booking.title',
        loadComponent: () => import('./features/booking/booking-page.component').then((m) => m.BookingPageComponent),
      },
      {
        path: 'login',
        title: 'nav.login',
        loadComponent: () => import('./features/auth/login/login-page.component').then((m) => m.LoginPageComponent),
      },
      {
        path: 'register',
        title: 'nav.register',
        loadComponent: () => import('./features/auth/register/register-page.component').then((m) => m.RegisterPageComponent),
      },
    ],
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/app-shell/app-shell.component').then((m) => m.AppShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'nav.dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard-page.component').then((m) => m.DashboardPageComponent),
      },
      {
        path: 'booking',
        title: 'booking.title',
        canActivate: [roleGuard],
        data: { roles: ['patient'] },
        loadComponent: () =>
          import('./features/booking/authenticated-booking-page.component').then((m) => m.AuthenticatedBookingPageComponent),
      },
      {
        path: 'booking/:doctorId',
        title: 'booking.title',
        canActivate: [roleGuard],
        data: { roles: ['patient'] },
        loadComponent: () => import('./features/booking/booking-page.component').then((m) => m.BookingPageComponent),
      },
      {
        path: 'appointments',
        title: 'nav.appointments',
        loadComponent: () =>
          import('./features/appointments/list/appointments-page.component').then((m) => m.AppointmentsPageComponent),
      },
      {
        path: 'appointments/:id',
        title: 'appointments.detailTitle',
        loadComponent: () =>
          import('./features/appointments/detail/appointment-detail.component').then((m) => m.AppointmentDetailComponent),
      },
      {
        path: 'folder',
        title: 'folder.title',
        canActivate: [roleGuard],
        data: { roles: ['patient'] },
        loadComponent: () =>
          import('./features/clinical-folder/clinical-folder-page.component').then(
            (m) => m.ClinicalFolderPageComponent,
          ),
      },
      {
        path: 'patients/:patientId/folder',
        title: 'titles.patientFolder',
        canActivate: [roleGuard],
        data: { roles: ['doctor', 'admin'] },
        loadComponent: () =>
          import('./features/clinical-folder/clinical-folder-page.component').then(
            (m) => m.ClinicalFolderPageComponent,
          ),
      },
      {
        path: 'reports',
        title: 'reports.title',
        loadComponent: () => import('./features/reports/list/reports-page.component').then((m) => m.ReportsPageComponent),
      },
      {
        path: 'reports/:id',
        title: 'reports.detailTitle',
        loadComponent: () => import('./features/reports/detail/report-detail.component').then((m) => m.ReportDetailComponent),
      },
      {
        path: 'reviews',
        title: 'reviews.title',
        canActivate: [roleGuard],
        data: { roles: ['patient'] },
        loadComponent: () => import('./features/reviews/reviews-page.component').then((m) => m.ReviewsPageComponent),
      },
      {
        path: 'agenda',
        title: 'nav.agenda',
        canActivate: [roleGuard],
        data: { roles: ['doctor'] },
        loadComponent: () => import('./features/agenda/agenda-page.component').then((m) => m.AgendaPageComponent),
      },
      {
        path: 'admin',
        title: 'admin.title',
        canActivate: [roleGuard],
        data: { roles: ['admin'] },
        loadComponent: () => import('./features/admin/admin-page.component').then((m) => m.AdminPageComponent),
      },
      {
        path: 'settings',
        title: 'nav.settings',
        loadComponent: () => import('./features/settings/settings-page.component').then((m) => m.SettingsPageComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
